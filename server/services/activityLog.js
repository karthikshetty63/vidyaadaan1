// The activity log behind the admin Control Tower. Controllers call logActivity() once an action has
// succeeded (or failed in a way worth seeing, such as a wrong password). Logging never changes what the
// user gets: it isn't awaited, and if it fails the error is written to the server log and nothing else.
import mongoose from "mongoose";
import ActivityEvent from "../models/ActivityEvent.js";
import { ACTIVITY_ACTIONS } from "../../shared/activityRules.js";

// Never stored in an event's details, whatever a caller passes.
const FORBIDDEN_DETAIL = /pass|token|secret|signature|email|phone|bank|udise|aadhaar|cookie|^pan$|^ifsc$|^otp$/i;
const MAX_TEXT = 300;
const MAX_KEYS = 12;

/** Keeps only small, plain facts: text (cut to 300 characters), numbers, booleans and short lists of them. */
export const cleanDetails = (details = {}) => {
    const clean = {};
    for (const [key, value] of Object.entries(details || {}).slice(0, MAX_KEYS)) {
        if (FORBIDDEN_DETAIL.test(key) || value === undefined || value === null) continue;
        if (typeof value === "string") clean[key] = value.slice(0, MAX_TEXT);
        else if (typeof value === "number" || typeof value === "boolean") clean[key] = value;
        else if (value instanceof Date) clean[key] = value.toISOString();
        else if (value instanceof mongoose.Types.ObjectId) clean[key] = value.toString();
        else if (Array.isArray(value)) clean[key] = value.filter((v) => ["string", "number"].includes(typeof v)).slice(0, 10);
    }
    return clean;
};

/** A transaction reference with all but its last four characters hidden. */
export const maskReference = (reference) => {
    const text = String(reference || "");
    return text.length <= 4 ? "••••" : `••••${text.slice(-4)}`;
};

/** The actor fields for a signed-in user (or a visitor when there is none). */
export const actorOf = (user) =>
    user ? { id: user._id || user.id || null, role: user.role, name: user.name || "" } : { id: null, role: "visitor", name: "" };

const toId = (value) => (value && mongoose.isValidObjectId(value) ? new mongoose.Types.ObjectId(String(value)) : null);

// Writes still in flight, so tests (and a graceful shutdown) can wait for them.
const pending = new Set();

/**
 * Records one event. Never throws and never rejects. `action` must be one of shared/activityRules.js.
 * @param {{ action: string, actor?: object, target?: { type: string, id?: any, label?: string },
 *   result?: "success"|"failure"|"info", details?: object, at?: Date, source?: string }} event
 */
export const recordActivity = (event) => {
    const write = (async () => {
        const definition = ACTIVITY_ACTIONS[event.action];
        if (!definition) throw new Error(`unknown activity "${event.action}"`);
        const actor = event.actor || { role: "system" };
        await ActivityEvent.create({
            at: event.at || new Date(),
            action: event.action,
            category: definition.category,
            result: event.result || "success",
            actor: { id: toId(actor.id), role: actor.role, name: String(actor.name || "").slice(0, 150) },
            target: {
                type: event.target?.type || "",
                id: toId(event.target?.id),
                label: String(event.target?.label || "").slice(0, 200),
            },
            details: cleanDetails(event.details),
            source: event.source || "live",
        });
    })().catch((error) => {
        console.error(`Activity "${event.action}" could not be recorded:`, error.message);
    });
    pending.add(write);
    write.finally(() => pending.delete(write));
    return write;
};

/** Records what the signed-in user (req.user) just did, unless `actor` says otherwise. Not awaited by callers. */
export const logActivity = (req, { actor, ...event }) => recordActivity({ ...event, actor: actor || actorOf(req?.user) });

/** Resolves once every activity write started so far has finished (tests). */
export const activityWritesSettled = () => Promise.all([...pending]);

// Labels used by several controllers.
export const accountTarget = (user) => ({ type: "account", id: user._id, label: user.name });
export const projectTarget = (project) => ({ type: "project", id: project._id, label: project.title });
