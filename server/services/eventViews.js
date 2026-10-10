// What each kind of account may see of a school event. Three views, each an allow-list:
//   school     its own events, with every offer and how to reach whoever made it;
//   supporter  (NGO or donor) approved events only: the event, the school's name and place, and the
//              viewer's own offer. Never the school's contact details, other supporters or the review;
//   admin      the event and its school, for review (see eventReviewController).
import DonorProfile from "../models/DonorProfile.js";
import NGOProfile from "../models/NGOProfile.js";
import SchoolProfile from "../models/SchoolProfile.js";
import User from "../models/User.js";
import { isOpenForOffers } from "../../shared/eventRules.js";

const id = (value) => String(value);
const day = (date) => new Date(date).toISOString().slice(0, 10);

/** The event itself: the same in every view. */
export const eventBase = (e) => ({
    id: id(e._id),
    title: e.title,
    type: e.type,
    date: day(e.date),
    venue: e.venue || "",
    description: e.description,
    expectedStudents: e.expectedStudents,
    helpNeeded: e.helpNeeded || [],
    helpDetails: e.helpDetails || "",
    status: e.status,
});

const reviewFields = (e) => ({
    reviewStatus: e.reviewStatus,
    rejectionReason: e.rejectionReason || null,
    reviewedAt: e.reviewedAt || null,
    submittedAt: e.submittedAt || e.createdAt,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
});

/**
 * Who made each offer, as the school may see them. An NGO is shown as on its funding commitments (name,
 * email, phone, place). A donor agreed, when offering, that the school may see their name and email.
 * @returns {Promise<Map<string, { role, name, contactName?, email, phone?, place }>>}
 */
export const supporterContacts = async (offers) => {
    const ngoIds = offers.filter((o) => o.role === "ngo").map((o) => o.supporter);
    const donorIds = offers.filter((o) => o.role === "donor").map((o) => o.supporter);
    const [ngos, donors, donorProfiles] = await Promise.all([
        ngoIds.length ? NGOProfile.find({ userId: { $in: ngoIds } }).select("userId ngoName contactName email phone district state").lean() : [],
        donorIds.length ? User.find({ _id: { $in: donorIds } }).select("name email").lean() : [],
        donorIds.length ? DonorProfile.find({ userId: { $in: donorIds } }).select("userId city state").lean() : [],
    ]);
    const place = (...parts) => parts.filter(Boolean).join(", ");
    const donorPlace = new Map(donorProfiles.map((p) => [id(p.userId), place(p.city, p.state)]));
    const contacts = new Map();
    for (const n of ngos) contacts.set(id(n.userId), { role: "ngo", name: n.ngoName || "NGO partner", contactName: n.contactName || "", email: n.email || "", phone: n.phone || "", place: place(n.district, n.state) });
    for (const d of donors) contacts.set(id(d._id), { role: "donor", name: d.name, email: d.email, place: donorPlace.get(id(d._id)) || "" });
    return contacts;
};

const offerBase = (o) => ({
    id: id(o._id),
    kinds: o.kinds,
    message: o.message || "",
    status: o.status,
    note: o.note || "",
    offeredAt: o.offeredAt,
    respondedAt: o.respondedAt || null,
});

/** A school's own event, with its offers (newest first). */
export const toSchoolView = (e, contacts) => ({
    ...eventBase(e),
    ...reviewFields(e),
    offers: [...(e.offers || [])]
        .sort((a, b) => b.offeredAt - a.offeredAt)
        .map((o) => ({ ...offerBase(o), role: o.role, supporter: contacts.get(id(o.supporter)) || { role: o.role, name: o.role === "ngo" ? "NGO partner" : "Donor", email: "", place: "" } })),
});

/** School views for several events with one lookup of the supporters. */
export const toSchoolViews = async (events) => {
    const contacts = await supporterContacts(events.flatMap((e) => e.offers || []));
    return events.map((e) => toSchoolView(e, contacts));
};

/**
 * Supporter views of approved `events`, with each school's name and place and the viewer's own offer.
 * With `activeOnly`, a school whose account is no longer active drops out, with all its events.
 */
export const toSupporterViews = async (events, viewerId, { activeOnly }) => {
    const schoolIds = [...new Set(events.map((e) => id(e.school)))];
    const [activeSchools, profiles] = await Promise.all([
        activeOnly ? User.find({ _id: { $in: schoolIds }, role: "school", accountStatus: "active" }).select("_id").lean() : null,
        SchoolProfile.find({ userId: { $in: schoolIds } }).select("userId schoolName district state").lean(),
    ]);
    const active = activeSchools && new Set(activeSchools.map((u) => id(u._id)));
    const profileBySchool = new Map(profiles.map((p) => [id(p.userId), p]));
    return events
        .filter((e) => !active || active.has(id(e.school)))
        .map((e) => {
            const school = profileBySchool.get(id(e.school));
            const mine = (e.offers || []).find((o) => id(o.supporter) === id(viewerId));
            return {
                ...eventBase(e),
                school: { name: school?.schoolName || "Government school", district: school?.district || "", state: school?.state || "" },
                openForOffers: isOpenForOffers({ reviewStatus: e.reviewStatus, status: e.status, date: day(e.date) }),
                myOffer: mine ? offerBase(mine) : null,
            };
        });
};

/** The admin's view: the event, how many offers it has, and its review. */
export const toAdminView = (e, school) => ({
    ...eventBase(e),
    ...reviewFields(e),
    offerCount: (e.offers || []).length,
    school: school || null,
});
