// The engine behind the "a project was approved" emails: to the school's alumni (alumniNotifications.js)
// and to every NGO and donor (newNeedEmails.js).
//
// The queue is a MongoDB collection of records, one per email ({ project, status, error, sentAt, … }):
// approval writes them as PENDING, then this sends them one at a time, in the background, so the admin's
// request never waits for email. There is no separate job server, so delivery runs inside the API
// process; if it restarts, resume() picks up whatever is still PENDING.
import Project from "../models/Project.js";
import SchoolProfile from "../models/SchoolProfile.js";
import User from "../models/User.js";
import { isEmailConfigured } from "./emailService.js";

const SEND_BATCH = 50; // records read per round while sending
// When the email service is down every email fails; stop instead of trying hundreds of them.
export const MAX_FAILURES_IN_A_ROW = 5;
export const NOT_CONFIGURED = "Email is not configured on the server (SMTP_HOST / EMAIL_FROM).";

export const errorText = (error) => String(error?.message || error).slice(0, 450);

/**
 * An approved project and its school, as every email about it shows them. Null once it's no longer open.
 * The school's name is null if neither its profile nor its account has one (each email says it its own way).
 */
export const loadOpenProject = async (projectId) => {
    const project = await Project.findById(projectId)
        .select("school title problem budget category priority studentsBenefited expectedCompletion location reviewStatus")
        .lean();
    if (!project || project.reviewStatus !== "OPEN") return null;
    const [profile, user] = await Promise.all([
        SchoolProfile.findOne({ userId: project.school }).select("schoolName district state").lean(),
        User.findById(project.school).select("name").lean(),
    ]);
    return { project, school: { name: profile?.schoolName || user?.name || null, district: profile?.district, state: profile?.state } };
};

/**
 * One queue of emails about approved projects.
 * @param {object} queue
 * @param {import("mongoose").Model} queue.Model the records
 * @param {string} queue.label for the server log, e.g. "Alumni emails"
 * @param {(projectId: string, options: object) => Promise<object|null>} queue.loadContent what every email for
 *   the project needs; null when the project is no longer open (its PENDING emails are then not sent)
 * @param {(record: object, content: object, options: object) => Promise} queue.send sends one record's email
 */
export const createEmailQueue = ({ Model, label, loadContent, send }) => {
    /** Marks every still-PENDING email for the project as FAILED; returns how many. */
    const failPending = async (projectId, reason) =>
        (await Model.updateMany({ project: projectId, status: "PENDING" }, { $set: { status: "FAILED", error: reason } })).modifiedCount;

    /** Sends this project's PENDING emails one by one. Each record is claimed first, so it is sent at most once. */
    const deliverPending = async (projectId, options) => {
        const content = await loadContent(projectId, options);
        if (!content) {
            await failPending(projectId, "The project is no longer open.");
            return;
        }
        if (!isEmailConfigured()) {
            await failPending(projectId, NOT_CONFIGURED);
            return;
        }

        let sent = 0;
        let failed = 0;
        let failuresInARow = 0;
        for (;;) {
            const batch = await Model.find({ project: projectId, status: "PENDING" }).sort({ _id: 1 }).limit(SEND_BATCH).select("_id").lean();
            if (!batch.length) break;
            for (const { _id } of batch) {
                const claimed = await Model.findOneAndUpdate({ _id, status: "PENDING" }, { $set: { status: "SENDING" } }, { returnDocument: "after" }).lean();
                if (!claimed) continue;
                try {
                    // One recipient per message: nobody sees anyone else's name or address.
                    await send(claimed, content, options);
                    await Model.updateOne({ _id }, { $set: { status: "SENT", sentAt: new Date() } });
                    sent += 1;
                    failuresInARow = 0;
                } catch (error) {
                    await Model.updateOne({ _id }, { $set: { status: "FAILED", error: errorText(error) } });
                    failed += 1;
                    failuresInARow += 1;
                    console.error(`${label}: email ${_id} (project ${projectId}) failed:`, errorText(error));
                    if (failuresInARow >= MAX_FAILURES_IN_A_ROW) {
                        failed += await failPending(projectId, `Not sent: stopped after ${MAX_FAILURES_IN_A_ROW} failed emails in a row (last error: ${errorText(error)}).`);
                        console.error(`${label} for project ${projectId} stopped after ${MAX_FAILURES_IN_A_ROW} failures in a row.`);
                        break;
                    }
                }
            }
            if (failuresInARow >= MAX_FAILURES_IN_A_ROW) break;
        }
        console.log(`${label} for project ${projectId}: ${sent} sent, ${failed} failed.`);
    };

    // Project id → the delivery running for it. One at a time per project; a request that arrives while
    // one is running makes it look again for PENDING records before it finishes.
    const deliveries = new Map();

    const start = (projectId, options) => {
        const key = String(projectId);
        const current = deliveries.get(key);
        if (current) {
            current.again = true;
            return current.promise;
        }
        const entry = { again: false };
        entry.promise = (async () => {
            try {
                do {
                    entry.again = false;
                    await deliverPending(key, options);
                } while (entry.again);
            } catch (error) {
                // Runs after the response was sent: log it, never crash the server.
                console.error(`${label} for project ${key} stopped:`, errorText(error));
            } finally {
                deliveries.delete(key);
            }
        })();
        deliveries.set(key, entry);
        return entry.promise;
    };

    /** Resolves when every delivery running in this process has finished (tests, graceful shutdown). */
    const waitForAll = async () => {
        while (deliveries.size) await Promise.all([...deliveries.values()].map((d) => d.promise));
    };

    /**
     * At server start: continue sending what a restart left PENDING. An email that was mid-send when the
     * server stopped may already have been delivered, so it is marked FAILED rather than sent twice.
     */
    const resume = async (options) => {
        const interrupted = await Model.updateMany(
            { status: "SENDING", project: { $nin: [...deliveries.keys()] } },
            { $set: { status: "FAILED", error: "Interrupted by a server restart. Not sent again, in case it had already been delivered." } }
        );
        const projects = await Model.distinct("project", { status: "PENDING" });
        for (const id of projects) start(id, options);
        return { interrupted: interrupted.modifiedCount, projects: projects.length };
    };

    return { start, waitForAll, resume };
};
