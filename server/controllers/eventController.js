import mongoose from "mongoose";
import SchoolEvent from "../models/SchoolEvent.js";
import { logActivity } from "../services/activityLog.js";
import { toSchoolViews } from "../services/eventViews.js";
import {
    EVENTS_PER_SCHOOL_MAX, EVENT_FIELDS_AFTER_APPROVAL, getUnexpectedEventFields, todayUTC, validateEvent, validateOfferDecision,
} from "../../shared/eventRules.js";

// A school's own events (/api/school/events). A new event waits for the VIDYADAAN team's review; only
// approved events are shown to NGOs and donors, whose offers of help the school then answers here.

const badRequest = (res, message, errors) => res.status(400).json({ message, ...(errors ? { errors } : {}) });
const notFound = (res) => res.status(404).json({ message: "Event not found." });
export const eventTarget = (event) => ({ type: "event", id: event._id, label: event.title });

const readBody = (req, res, { isUpdate }) => {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        badRequest(res, "Request body must be a JSON object.");
        return null;
    }
    const unexpected = getUnexpectedEventFields(body, { isUpdate });
    if (unexpected.length) {
        badRequest(res, `Unexpected field(s): ${unexpected.join(", ")}.`, Object.fromEntries(unexpected.map((f) => [f, "This field is not allowed."])));
        return null;
    }
    const { errors, values } = validateEvent(body, { isUpdate });
    if (Object.keys(errors).length) {
        badRequest(res, Object.values(errors)[0], errors);
        return null;
    }
    return values;
};

// Only ever the signed-in school's own event; anything else looks like it doesn't exist.
const findOwnEvent = (req) =>
    mongoose.isValidObjectId(req.params.id) ? SchoolEvent.findOne({ _id: req.params.id, school: req.user._id }) : Promise.resolve(null);

const reply = async (res, status, message, event) => {
    const [view] = await toSchoolViews([event.toObject ? event.toObject() : event]);
    return res.status(status).json({ message, event: view });
};

// GET /api/school/events — newest first, each with its offers of help.
export const listMyEvents = async (req, res, next) => {
    try {
        const events = await SchoolEvent.find({ school: req.user._id }).sort({ createdAt: -1, _id: -1 }).lean();
        return res.json({ events: await toSchoolViews(events) });
    } catch (error) {
        return next(error);
    }
};

// POST /api/school/events
export const createEvent = async (req, res, next) => {
    const values = readBody(req, res, { isUpdate: false });
    if (!values) return undefined;
    try {
        if ((await SchoolEvent.countDocuments({ school: req.user._id })) >= EVENTS_PER_SCHOOL_MAX) {
            return res.status(409).json({ message: `A school can have at most ${EVENTS_PER_SCHOOL_MAX} events.` });
        }
        // Every new event waits for an admin before anyone else can see it.
        const event = await SchoolEvent.create({
            ...values,
            date: new Date(`${values.date}T00:00:00Z`),
            school: req.user._id,
            reviewStatus: "PENDING_REVIEW",
            submittedAt: new Date(),
        });
        logActivity(req, { action: "event.submitted", target: eventTarget(event), details: { type: event.type, date: values.date } });
        return reply(res, 201, "Event sent for review. NGOs and donors will see it once the VIDYADAAN team approves it.", event);
    } catch (error) {
        return next(error);
    }
};

// PATCH /api/school/events/:id — only the fields sent are changed.
//   Waiting for review: anything may change.
//   Changes requested:  editing it sends it for review again.
//   Approved:           only the date and the status may change (NGOs and donors keep seeing what was reviewed).
export const updateMyEvent = async (req, res, next) => {
    const values = readBody(req, res, { isUpdate: true });
    if (!values) return undefined;
    if (!Object.keys(values).length) return badRequest(res, "Nothing to update.");
    try {
        const event = await findOwnEvent(req);
        if (!event) return notFound(res);
        const reviewStatus = event.reviewStatus;

        if ("status" in values && reviewStatus !== "OPEN") {
            const message = "You can change the status once the event is approved.";
            return badRequest(res, message, { status: message });
        }
        if (reviewStatus === "OPEN") {
            const locked = Object.keys(values).filter((field) => !EVENT_FIELDS_AFTER_APPROVAL.includes(field));
            if (locked.length) {
                const message = "An approved event's details can't be changed, so NGOs and donors keep seeing what was reviewed. You can change its date or status, or cancel it and post a new event.";
                return badRequest(res, message, Object.fromEntries(locked.map((field) => [field, "This can't change after approval."])));
            }
            if (values.date && values.date !== event.date.toISOString().slice(0, 10) && values.date < todayUTC()) {
                const message = "The new date can't be in the past.";
                return badRequest(res, message, { date: message });
            }
        }

        const changed = Object.keys(values);
        event.set({ ...values, ...(values.date ? { date: new Date(`${values.date}T00:00:00Z`) } : {}) });
        const resubmitted = reviewStatus === "REJECTED";
        if (resubmitted) {
            event.reviewStatus = "PENDING_REVIEW";
            event.submittedAt = new Date();
            event.rejectionReason = undefined;
            event.reviewedBy = undefined;
            event.reviewedAt = undefined;
        }
        await event.save();

        const onlyStatus = changed.length === 1 && changed[0] === "status";
        logActivity(req, {
            action: resubmitted ? "event.resubmitted" : onlyStatus ? "event.status_changed" : "event.updated",
            target: eventTarget(event),
            details: { fields: changed, ...("status" in values ? { status: values.status } : {}), ...(values.date ? { date: values.date } : {}) },
        });
        return reply(res, 200, resubmitted ? "Event sent for review again." : "Event updated.", event);
    } catch (error) {
        return next(error);
    }
};

// PATCH /api/school/events/:id/offers/:offerId  { decision: "ACCEPTED" | "DECLINED", note? }
// The school's answer to an offer of help. Final: an answered offer can't be answered again.
export const respondToOffer = async (req, res, next) => {
    const { errors, values } = validateOfferDecision(req.body);
    if (Object.keys(errors).length) return badRequest(res, Object.values(errors)[0], errors);
    if (!mongoose.isValidObjectId(req.params.id) || !mongoose.isValidObjectId(req.params.offerId)) return notFound(res);
    try {
        // One atomic step, and only while the offer is still unanswered.
        const event = await SchoolEvent.findOneAndUpdate(
            { _id: req.params.id, school: req.user._id, offers: { $elemMatch: { _id: req.params.offerId, status: "OFFERED" } } },
            { $set: { "offers.$.status": values.decision, "offers.$.note": values.note, "offers.$.respondedAt": new Date() } },
            { returnDocument: "after" }
        ).lean();
        if (!event) {
            const existing = await SchoolEvent.findOne({ _id: req.params.id, school: req.user._id, "offers._id": req.params.offerId }).select("offers.$").lean();
            if (!existing) return res.status(404).json({ message: "Offer not found. It may have been withdrawn." });
            return res.status(409).json({ message: `You've already ${existing.offers[0].status === "ACCEPTED" ? "accepted" : "declined"} this offer.` });
        }
        const offer = event.offers.find((o) => String(o._id) === req.params.offerId);
        logActivity(req, {
            action: values.decision === "ACCEPTED" ? "event.offer_accepted" : "event.offer_declined",
            target: eventTarget(event),
            details: { supporterRole: offer.role, kinds: offer.kinds },
        });
        const [view] = await toSchoolViews([event]);
        return res.json({ message: values.decision === "ACCEPTED" ? "Offer accepted. Contact them to arrange the details." : "Offer declined.", event: view });
    } catch (error) {
        return next(error);
    }
};
