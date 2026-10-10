// GET-only endpoints for the admin Control Tower (/api/admin/monitor/...). Admin-only (see the routes):
// they read and count, and never change a record. Every query is validated and paginated (at most 50 rows).
import mongoose from "mongoose";
import { ACCOUNT_STATUSES } from "../../shared/registrationRules.js";
import { ACTIVITY_CATEGORIES, ACTIVITY_RESULTS, ACTIVITY_ROLES, ACTIVITY_SOURCES } from "../../shared/activityRules.js";
import { PROJECT_REVIEW_STATUSES, PROJECT_STATUSES } from "../../shared/projectRules.js";
import {
    getActivityEvent, getChecks, getOverview, listActivity, listDonations, listDonors, listNgoPayments, listNgos, listProjects, listSchools,
} from "../services/adminMonitor.js";

export const MONITOR_PAGE_MAX = 50;
const PAGE_LIMIT_DEFAULT = 20;
const PAGE_NUMBER_MAX = 10000;
const SEARCH_MAX = 80;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

class QueryError extends Error {}

const intParam = (value, name, { min, max, fallback }) => {
    if (value === undefined || value === "") return fallback;
    if (!/^\d+$/.test(String(value))) throw new QueryError(`${name} must be a whole number.`);
    const n = Number(value);
    if (n < min || n > max) throw new QueryError(`${name} must be between ${min} and ${max}.`);
    return n;
};
const oneOf = (value, name, allowed) => {
    if (value === undefined || value === "") return undefined;
    if (!allowed.includes(value)) throw new QueryError(`${name} must be one of: ${allowed.join(", ")}.`);
    return value;
};
const text = (value) => {
    if (value === undefined) return "";
    if (typeof value !== "string") throw new QueryError("Search must be text.");
    const trimmed = value.trim();
    if (trimmed.length > SEARCH_MAX) throw new QueryError(`Search can be at most ${SEARCH_MAX} characters.`);
    return trimmed;
};
const objectId = (value, name) => {
    if (value === undefined || value === "") return undefined;
    if (!mongoose.isValidObjectId(value)) throw new QueryError(`${name} is not a valid id.`);
    return String(value);
};
/** from/to are calendar days (YYYY-MM-DD, UTC); "to" includes the whole day. */
const dateRange = (from, to) => {
    const parse = (value, name, endOfDay) => {
        if (value === undefined || value === "") return null;
        const d = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
        if (typeof value !== "string" || !DATE.test(value) || Number.isNaN(d.getTime())) throw new QueryError(`${name} must be a date (YYYY-MM-DD).`);
        return d;
    };
    const range = { from: parse(from, "from", false), to: parse(to, "to", true) };
    if (range.from && range.to && range.from > range.to) throw new QueryError("from must be on or before to.");
    return range;
};
const paging = (query) => ({
    page: intParam(query.page, "page", { min: 1, max: PAGE_NUMBER_MAX, fallback: 1 }),
    limit: intParam(query.limit, "limit", { min: 1, max: MONITOR_PAGE_MAX, fallback: PAGE_LIMIT_DEFAULT }),
});

/** Wraps a handler: bad query → 400; the reply is never cached and says when it was made. */
const handle = (read) => async (req, res, next) => {
    let params;
    try {
        params = read.params(req.query || {}, req);
    } catch (error) {
        if (error instanceof QueryError) return res.status(400).json({ message: error.message });
        return next(error);
    }
    try {
        const data = await read.run(params);
        if (data === null) return res.status(404).json({ message: "Not found." });
        res.set("Cache-Control", "no-store");
        return res.json({ generatedAt: new Date().toISOString(), ...data });
    } catch (error) {
        return next(error);
    }
};

const ACCOUNT_LIST = (list) => ({
    params: (q) => ({ q: text(q.q), status: oneOf(q.status, "status", ACCOUNT_STATUSES), paging: paging(q) }),
    run: list,
});

export const monitorOverview = handle({ params: () => ({}), run: getOverview });
export const monitorChecks = handle({ params: () => ({}), run: getChecks });
export const monitorSchools = handle(ACCOUNT_LIST(listSchools));
export const monitorNgos = handle(ACCOUNT_LIST(listNgos));
export const monitorDonors = handle(ACCOUNT_LIST(listDonors));

export const monitorProjects = handle({
    params: (q) => ({
        q: text(q.q),
        review: oneOf(q.review, "review", PROJECT_REVIEW_STATUSES),
        status: oneOf(q.status, "status", PROJECT_STATUSES),
        paging: paging(q),
    }),
    run: listProjects,
});

export const monitorNgoPayments = handle({
    params: (q) => ({
        q: text(q.q),
        channel: oneOf(q.channel, "channel", ["DIRECT", "ONLINE"]),
        status: oneOf(q.status, "status", ["SUBMITTED", "ACCEPTED", "REJECTED", "CREATED", "REFUND_DUE"]),
        ...dateRange(q.from, q.to),
        paging: paging(q),
    }),
    run: listNgoPayments,
});

export const monitorDonations = handle({
    params: (q) => ({
        q: text(q.q),
        status: oneOf(q.status, "status", ["CREATED", "PAID"]),
        mode: oneOf(q.mode, "mode", ["test", "live"]),
        ...dateRange(q.from, q.to),
        paging: paging(q),
    }),
    run: listDonations,
});

export const monitorActivity = handle({
    params: (q) => ({
        q: text(q.q),
        role: oneOf(q.role, "role", ACTIVITY_ROLES),
        category: oneOf(q.category, "category", Object.keys(ACTIVITY_CATEGORIES)),
        result: oneOf(q.result, "result", ACTIVITY_RESULTS),
        source: oneOf(q.source, "source", ACTIVITY_SOURCES),
        actorId: objectId(q.actorId, "actorId"),
        targetId: objectId(q.targetId, "targetId"),
        ...dateRange(q.from, q.to),
        paging: paging(q),
    }),
    run: listActivity,
});

export const monitorActivityEvent = handle({
    params: (_q, req) => ({ eventId: objectId(req.params.id, "id") }),
    run: async ({ eventId }) => {
        const event = eventId ? await getActivityEvent(eventId) : null;
        return event ? { event } : null;
    },
});
