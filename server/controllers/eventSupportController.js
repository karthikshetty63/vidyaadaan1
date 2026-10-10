import mongoose from "mongoose";
import SchoolEvent from "../models/SchoolEvent.js";
import User from "../models/User.js";
import { logActivity } from "../services/activityLog.js";
import { toSupporterViews } from "../services/eventViews.js";
import { OFFERS_PER_EVENT_MAX, todayUTC, validateEventOffer } from "../../shared/eventRules.js";
import { eventTarget } from "./eventController.js";

// Approved school events for NGOs and donors (/api/events): see them, offer help, withdraw an offer.
// An offer is a promise of help, never money: the school answers it and contacts the supporter.

const MAX_EVENTS = 200;
const notFound = (res) => res.status(404).json({ message: "Event not found." });
const startOfToday = () => new Date(`${todayUTC()}T00:00:00Z`);

/** An approved, scheduled event that isn't over, from a school whose account is active. */
const findOpenEvent = async (id) => {
    if (!mongoose.isValidObjectId(id)) return null;
    const [event] = await SchoolEvent.findVisibleToSupporters({ _id: id, status: "Scheduled", date: { $gte: startOfToday() } }).lean();
    if (!event) return null;
    const schoolActive = await User.exists({ _id: event.school, role: "school", accountStatus: "active" });
    return schoolActive ? event : null;
};

const viewOf = async (eventId, viewerId) => {
    const [event] = await SchoolEvent.findVisibleToSupporters({ _id: eventId }).lean();
    const [view] = event ? await toSupporterViews([event], viewerId, { activeOnly: false }) : [];
    return view || null;
};

// GET /api/events — approved events that are still to come, soonest first.
export const listOpenEvents = async (req, res, next) => {
    try {
        const events = await SchoolEvent.findVisibleToSupporters({ status: "Scheduled", date: { $gte: startOfToday() } })
            .sort({ date: 1, _id: 1 })
            .limit(MAX_EVENTS)
            .lean();
        return res.json({ events: await toSupporterViews(events, req.user._id, { activeOnly: true }) });
    } catch (error) {
        return next(error);
    }
};

// GET /api/events/mine — every approved event the signed-in NGO or donor has offered to help with
// (including past, completed and cancelled ones), newest event first.
export const listMyOffers = async (req, res, next) => {
    try {
        const events = await SchoolEvent.findVisibleToSupporters({ "offers.supporter": req.user._id }).sort({ date: -1, _id: -1 }).limit(MAX_EVENTS).lean();
        return res.json({ events: await toSupporterViews(events, req.user._id, { activeOnly: false }) });
    } catch (error) {
        return next(error);
    }
};

// POST /api/events/:id/offers  { kinds: [...], message?, shareContact? (donors: must be true) }
export const offerHelp = async (req, res, next) => {
    const { errors, values } = validateEventOffer(req.body, { role: req.user.role });
    if (Object.keys(errors).length) return res.status(400).json({ message: Object.values(errors)[0], errors });
    try {
        const event = await findOpenEvent(req.params.id);
        if (!event) return notFound(res);
        // One offer per supporter, and a cap per event, in one atomic update (two requests can't both add one).
        const updated = await SchoolEvent.findOneAndUpdate(
            {
                _id: event._id,
                reviewStatus: "OPEN",
                status: "Scheduled",
                "offers.supporter": { $ne: req.user._id },
                [`offers.${OFFERS_PER_EVENT_MAX - 1}`]: { $exists: false },
            },
            { $push: { offers: { supporter: req.user._id, role: req.user.role, kinds: values.kinds, message: values.message, status: "OFFERED", offeredAt: new Date() } } },
            { returnDocument: "after" }
        ).lean();
        if (!updated) {
            const current = await SchoolEvent.findById(event._id).select("offers status reviewStatus").lean();
            if (current?.offers.some((o) => o.supporter.equals(req.user._id))) return res.status(409).json({ message: "You've already offered to help with this event." });
            if (current && current.offers.length >= OFFERS_PER_EVENT_MAX) return res.status(409).json({ message: "This event already has as many offers of help as it can take." });
            return res.status(409).json({ message: "This event has just changed. Reload the page and try again." });
        }
        logActivity(req, { action: "event.offer_made", target: eventTarget(updated), details: { kinds: values.kinds, schoolId: updated.school } });
        const [view] = await toSupporterViews([updated], req.user._id, { activeOnly: false });
        return res.status(201).json({ message: "Thank you! Your offer has been sent to the school. It will accept or decline it, and contact you if it accepts.", event: view });
    } catch (error) {
        return next(error);
    }
};

// DELETE /api/events/:id/offers — withdraw your own offer, while the school hasn't answered it.
export const withdrawOffer = async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    try {
        const updated = await SchoolEvent.findOneAndUpdate(
            { _id: req.params.id, reviewStatus: "OPEN", offers: { $elemMatch: { supporter: req.user._id, status: "OFFERED" } } },
            { $pull: { offers: { supporter: req.user._id, status: "OFFERED" } } },
            { returnDocument: "after" }
        ).lean();
        if (!updated) {
            const mine = await SchoolEvent.findOne({ _id: req.params.id, reviewStatus: "OPEN", "offers.supporter": req.user._id }).select("_id").lean();
            if (!mine) return res.status(404).json({ message: "You have no offer on this event." });
            return res.status(409).json({ message: "The school has already answered your offer, so it can't be withdrawn here. Contact the school if your plans have changed." });
        }
        logActivity(req, { action: "event.offer_withdrawn", target: eventTarget(updated), details: { schoolId: updated.school } });
        return res.json({ message: "Your offer has been withdrawn.", event: await viewOf(updated._id, req.user._id) });
    } catch (error) {
        return next(error);
    }
};
