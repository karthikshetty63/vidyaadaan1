// What each school, NGO and donor sees under Notifications, worked out from VIDYADAAN's own records.
// Two kinds of item:
//   actions  things waiting for this account (a payment to check, an offer to answer, parts to pay for,
//            changes the review team asked for). They stay until the account deals with them.
//   news     things others did that concern this account (a decision, a payment, a donation, an offer).
// Nothing is stored per notification. The account's `notificationsSeenAt` is the only state: anything
// newer than it is "new" and counts on the bell. Each item links to the page where it is handled.
// A school never learns who its donors are here: donations appear as amounts only.
import Donation from "../models/Donation.js";
import FundingPayment from "../models/FundingPayment.js";
import NGOProfile from "../models/NGOProfile.js";
import Project from "../models/Project.js";
import SchoolEvent from "../models/SchoolEvent.js";
import SchoolProfile from "../models/SchoolProfile.js";
import { supporterContacts } from "./eventViews.js";

const SOURCE_LIMIT = 60; // newest records read from each source
const NEWS_LIMIT = 60; // news items returned

const id = (value) => String(value);
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const partsText = (parts) => (parts.length === 1 ? `part ${parts[0]}` : `parts ${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const action = (fields) => ({ kind: "action", tone: "warning", ...fields });
const news = (fields) => ({ kind: "news", tone: "info", ...fields });

/** "Your account was approved", for every role. */
const accountApproved = (user, to) =>
    user.accountStatus === "active" && user.statusChangedAt
        ? [news({ id: "account-approved", tone: "success", title: "Your account was approved", text: "The VIDYADAAN team verified your registration.", at: user.statusChangedAt, to })]
        : [];

const ngoNames = async (ngoIds) => {
    const unique = [...new Set(ngoIds.map(id))];
    if (!unique.length) return new Map();
    const profiles = await NGOProfile.find({ userId: { $in: unique } }).select("userId ngoName").lean();
    return new Map(profiles.map((p) => [id(p.userId), p.ngoName || "An NGO"]));
};
const schoolNames = async (schoolIds) => {
    const unique = [...new Set(schoolIds.map(id))];
    if (!unique.length) return new Map();
    const profiles = await SchoolProfile.find({ userId: { $in: unique } }).select("userId schoolName").lean();
    return new Map(profiles.map((p) => [id(p.userId), p.schoolName || "A school"]));
};
const projectTitles = async (projectIds) => {
    const unique = [...new Set(projectIds.map(id))];
    if (!unique.length) return new Map();
    const projects = await Project.find({ _id: { $in: unique } }).select("title").lean();
    return new Map(projects.map((p) => [id(p._id), p.title]));
};

// ─── School ──────────────────────────────────────────────────────────────────
const schoolNotifications = async (user) => {
    const paymentFields = "project ngo parts amount status channel submittedAt reviewedAt";
    const [projects, toCheck, paidOnline, donations, events, profile] = await Promise.all([
        Project.find({ school: user._id }).select("title reviewStatus rejectionReason reviewedAt updatedAt fundingParts").lean(),
        // Every direct payment waiting to be checked (none is left out), and the latest online payments Razorpay confirmed.
        FundingPayment.find({ school: user._id, status: "SUBMITTED" }).sort({ submittedAt: -1 }).select(paymentFields).lean(),
        FundingPayment.find({ school: user._id, channel: "ONLINE", status: "ACCEPTED" }).sort({ reviewedAt: -1 }).limit(SOURCE_LIMIT).select(paymentFields).lean(),
        Donation.find({ school: user._id, status: "PAID" }).sort({ verifiedAt: -1 }).limit(SOURCE_LIMIT).select("project amount mode verifiedAt createdAt").lean(),
        SchoolEvent.find({ school: user._id }).select("title reviewStatus rejectionReason reviewedAt updatedAt offers").lean(),
        SchoolProfile.findOne({ userId: user._id }).select("paymentQr").lean(),
    ]);
    const titles = new Map(projects.map((p) => [id(p._id), p.title]));
    const waitingOffers = events.flatMap((e) => (e.reviewStatus === "OPEN" ? e.offers.filter((o) => o.status === "OFFERED").map((o) => ({ event: e, offer: o })) : []));
    const [ngos, supporters] = await Promise.all([
        ngoNames([...toCheck, ...paidOnline].map((p) => p.ngo).concat(projects.flatMap((p) => (p.fundingParts || []).map((f) => f.ngo)))),
        supporterContacts(waitingOffers.map((w) => w.offer)),
    ]);
    const projectPage = (projectId) => `/dashboard/school/progress?project=${projectId}`;
    const qr = profile?.paymentQr;

    const actions = [
        ...toCheck.map((p) =>
            action({
                id: `payment-${p._id}`,
                title: "A payment is waiting for you to check",
                text: `${inr(p.amount)} from ${ngos.get(id(p.ngo)) || "an NGO"} for “${titles.get(id(p.project)) || "your project"}” (${partsText(p.parts)}).`,
                detail: "Check that the money has reached your bank account, then accept or reject it.",
                at: p.submittedAt,
                to: "/dashboard/school/donations",
                button: "Check payment",
            })
        ),
        ...waitingOffers.map(({ event, offer }) =>
            action({
                id: `offer-${offer._id}`,
                title: "An offer of help is waiting for your answer",
                text: `${supporters.get(id(offer.supporter))?.name || (offer.role === "ngo" ? "An NGO" : "A donor")} offers ${offer.kinds.join(", ")} for “${event.title}”.`,
                at: offer.offeredAt,
                to: "/dashboard/school/events",
                button: "Answer offer",
            })
        ),
        ...projects
            .filter((p) => p.reviewStatus === "REJECTED")
            .map((p) =>
                action({
                    id: `project-changes-${p._id}`,
                    tone: "danger",
                    title: "Changes requested for a project",
                    text: `“${p.title}” needs changes before NGOs and donors can see it.`,
                    detail: p.rejectionReason ? `Changes requested: ${p.rejectionReason}` : undefined,
                    at: p.reviewedAt || p.updatedAt,
                    to: projectPage(p._id),
                    button: "Edit and resubmit",
                })
            ),
        ...events
            .filter((e) => e.reviewStatus === "REJECTED")
            .map((e) =>
                action({
                    id: `event-changes-${e._id}`,
                    tone: "danger",
                    title: "Changes requested for an event",
                    text: `“${e.title}” needs changes before NGOs and donors can see it.`,
                    detail: e.rejectionReason ? `Changes requested: ${e.rejectionReason}` : undefined,
                    at: e.reviewedAt || e.updatedAt,
                    to: "/dashboard/school/events",
                    button: "Edit and resubmit",
                })
            ),
        ...(qr?.status === "REJECTED"
            ? [action({
                id: "qr-rejected",
                tone: "danger",
                title: "Your payment QR was not approved",
                text: "NGOs can't see it. Upload the QR of your school's own bank account.",
                detail: qr.rejectionReason ? `Reason: ${qr.rejectionReason}` : undefined,
                at: qr.reviewedAt || qr.submittedAt,
                to: "/dashboard/school",
                button: "Upload another QR",
            })]
            : []),
    ];

    // Parts committed in one request share their commitment time.
    const commitments = projects.flatMap((p) => {
        const groups = new Map();
        for (const f of p.fundingParts || []) {
            const key = `${f.ngo}:${new Date(f.committedAt).getTime()}`;
            const group = groups.get(key) || { ngo: f.ngo, at: f.committedAt, parts: [], amount: 0 };
            group.parts.push(f.part);
            group.amount += f.amount;
            groups.set(key, group);
        }
        return [...groups.entries()].map(([key, g]) =>
            news({
                id: `commitment-${p._id}-${key}`,
                title: "An NGO committed to fund your project",
                text: `${ngos.get(id(g.ngo)) || "An NGO"} committed ${inr(g.amount)} to “${p.title}” (${partsText(g.parts.sort((a, b) => a - b))}).`,
                at: g.at,
                to: projectPage(p._id),
            })
        );
    });

    return {
        actions,
        news: [
            ...accountApproved(user, "/dashboard/school"),
            ...projects
                .filter((p) => p.reviewStatus === "OPEN" && p.reviewedAt)
                .map((p) => news({ id: `project-approved-${p._id}`, tone: "success", title: "Project approved", text: `“${p.title}” is now open to NGOs and donors.`, at: p.reviewedAt, to: projectPage(p._id) })),
            ...events
                .filter((e) => e.reviewStatus === "OPEN" && e.reviewedAt)
                .map((e) => news({ id: `event-approved-${e._id}`, tone: "success", title: "Event approved", text: `NGOs and donors can now offer help for “${e.title}”.`, at: e.reviewedAt, to: "/dashboard/school/events" })),
            ...(qr?.status === "ACTIVE" && qr.reviewedAt
                ? [news({ id: "qr-approved", tone: "success", title: "Your payment QR was approved", text: "NGOs paying your school can scan it now.", at: qr.reviewedAt, to: "/dashboard/school" })]
                : []),
            ...commitments,
            ...paidOnline.map((p) =>
                news({
                    id: `online-payment-${p._id}`,
                    tone: "success",
                    title: "An NGO paid online",
                    text: `${ngos.get(id(p.ngo)) || "An NGO"} paid ${inr(p.amount)} for “${titles.get(id(p.project)) || "your project"}” through Razorpay. It already counts as raised.`,
                    at: p.reviewedAt || p.submittedAt,
                    to: "/dashboard/school/donations",
                })
            ),
            // Amounts only: a school never sees who its donors are.
            ...donations.map((d) =>
                news({
                    id: `donation-${d._id}`,
                    tone: "success",
                    title: "A donation arrived",
                    text: `A donor gave ${inr(d.amount)} to “${titles.get(id(d.project)) || "your project"}”.${d.mode === "test" ? " (Razorpay test mode: no real money.)" : ""}`,
                    at: d.verifiedAt || d.createdAt,
                    to: "/dashboard/school/donations",
                })
            ),
        ],
    };
};

// ─── NGO ─────────────────────────────────────────────────────────────────────
const offerAnswers = async (user, to) => {
    const events = await SchoolEvent.find({ reviewStatus: "OPEN", "offers.supporter": user._id }).select("title school offers").lean();
    const schools = await schoolNames(events.map((e) => e.school));
    return events.flatMap((e) => {
        const offer = e.offers.find((o) => id(o.supporter) === id(user._id));
        if (!offer || offer.status === "OFFERED") return [];
        const accepted = offer.status === "ACCEPTED";
        return [news({
            id: `offer-answer-${offer._id}`,
            tone: accepted ? "success" : "info",
            title: accepted ? "A school accepted your offer of help" : "A school declined your offer of help",
            text: `${schools.get(id(e.school)) || "The school"} · “${e.title}”.${accepted ? " It will contact you to arrange the details." : ""}`,
            detail: offer.note ? `School's note: ${offer.note}` : undefined,
            at: offer.respondedAt,
            to,
        })];
    });
};

const ngoNotifications = async (user) => {
    const [projects, payments, answers] = await Promise.all([
        Project.find({ "fundingParts.ngo": user._id }).select("title fundingParts").lean(),
        FundingPayment.find({ ngo: user._id, status: { $in: ["ACCEPTED", "REJECTED", "REFUND_DUE"] } })
            .sort({ reviewedAt: -1 })
            .limit(SOURCE_LIMIT)
            .select("project school parts amount status channel reviewedAt rejectionReason")
            .lean(),
        offerAnswers(user, "/dashboard/ngo#events"),
    ]);
    const [titles, schools] = await Promise.all([projectTitles(payments.map((p) => p.project)), schoolNames(payments.map((p) => p.school))]);
    const funding = "/dashboard/ngo#funding";

    return {
        actions: projects.flatMap((p) => {
            const unpaid = p.fundingParts.filter((f) => id(f.ngo) === id(user._id) && !f.payment && !f.receivedAt);
            if (!unpaid.length) return [];
            return [action({
                id: `unpaid-${p._id}`,
                title: "Parts are waiting for your payment",
                text: `${inr(unpaid.reduce((sum, f) => sum + f.amount, 0))} for “${p.title}” (${partsText(unpaid.map((f) => f.part).sort((a, b) => a - b))}).`,
                detail: "Pay online, or pay the school directly and send the proof.",
                at: unpaid.reduce((earliest, f) => (!earliest || f.committedAt < earliest ? f.committedAt : earliest), null),
                to: funding,
                button: "Pay for your parts",
            })];
        }),
        news: [
            ...accountApproved(user, "/dashboard/ngo#overview"),
            ...payments.map((p) => {
                const what = `${inr(p.amount)} for “${titles.get(id(p.project)) || "a school need"}”`;
                const school = schools.get(id(p.school)) || "The school";
                const base = { id: `payment-${p._id}`, at: p.reviewedAt, to: funding };
                if (p.status === "ACCEPTED") {
                    return news({ ...base, tone: "success", title: p.channel === "ONLINE" ? "Online payment confirmed" : "The school accepted your payment", text: p.channel === "ONLINE" ? `${what}, verified with Razorpay.` : `${school} confirmed ${what}.` });
                }
                if (p.status === "REJECTED") {
                    return news({ ...base, tone: "danger", title: "The school rejected your payment", text: `${school} could not confirm ${what}. Your parts stay reserved: send the payment again from Funding.`, detail: p.rejectionReason ? `Reason: ${p.rejectionReason}` : undefined });
                }
                return news({ ...base, tone: "danger", title: "An online payment will be refunded", text: `${what}: its parts had already been paid another way.`, detail: "Email VIDYADAAN support with the payment ID." });
            }),
            ...answers,
        ],
    };
};

// ─── Donor ───────────────────────────────────────────────────────────────────
const donorNotifications = async (user) => {
    const [donations, answers] = await Promise.all([
        Donation.find({ donor: user._id, status: "PAID" }).sort({ verifiedAt: -1 }).limit(SOURCE_LIMIT).select("project school amount mode verifiedAt createdAt").lean(),
        offerAnswers(user, "/dashboard/donor#events"),
    ]);
    const [titles, schools] = await Promise.all([projectTitles(donations.map((d) => d.project)), schoolNames(donations.map((d) => d.school))]);
    return {
        actions: [],
        news: [
            ...accountApproved(user, "/dashboard/donor#overview"),
            ...donations.map((d) =>
                news({
                    id: `donation-${d._id}`,
                    tone: "success",
                    title: "Donation confirmed",
                    text: `${inr(d.amount)} to “${titles.get(id(d.project)) || "a school need"}” · ${schools.get(id(d.school)) || "Government school"}.`,
                    detail: d.mode === "test" ? "Razorpay test mode: no real money was charged." : undefined,
                    at: d.verifiedAt || d.createdAt,
                    to: "/dashboard/donor#donations",
                })
            ),
            ...answers,
        ],
    };
};

const BUILDERS = { school: schoolNotifications, ngo: ngoNotifications, donor: donorNotifications };
const newestFirst = (a, b) => new Date(b.at) - new Date(a.at);

/**
 * The signed-in account's notifications.
 * @returns {Promise<{ actions: object[], news: object[], unread: number, seenAt: Date|null, asOf: Date, summary: string }>}
 *   Each item: { id, kind, tone, title, text, detail?, at, to, button?, isNew }.
 *   `asOf` is when the records were read: marking the list as seen up to then never hides anything newer.
 */
export const buildNotifications = async (user) => {
    const asOf = new Date();
    const { actions, news: allNews } = await BUILDERS[user.role](user);
    const seenAt = user.notificationsSeenAt || null;
    const mark = (item) => ({ ...item, isNew: Boolean(item.at) && (!seenAt || new Date(item.at) > seenAt) });
    const withDate = (item) => Boolean(item.at);
    // Something that is waiting is never left out, even if an old record has no date (it sorts last).
    const shownActions = actions.map((item) => ({ ...item, at: item.at || null })).sort(newestFirst).map(mark);
    const shownNews = allNews.filter(withDate).sort(newestFirst).slice(0, NEWS_LIMIT).map(mark);
    const unread = [...shownActions, ...shownNews].filter((item) => item.isNew).length;
    return {
        actions: shownActions,
        news: shownNews,
        unread,
        seenAt,
        asOf,
        summary: shownActions.length ? `${plural(shownActions.length, "thing needs", "things need")} your action` : "Nothing is waiting for you",
    };
};
