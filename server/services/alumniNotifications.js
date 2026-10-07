// "A project from your school was approved" emails to the school's alumni.
//
// The queue is the AlumniNotification collection itself: approval writes one PENDING record per
// active alum, then this process sends them one at a time, in the background, so the admin's request
// never waits for SMTP. There is no separate job server, so delivery runs inside the API process; if
// it restarts, resumeAlumniNotifications() picks up whatever is still PENDING.
import Alumni from "../models/Alumni.js";
import AlumniNotification from "../models/AlumniNotification.js";
import Project from "../models/Project.js";
import SchoolProfile from "../models/SchoolProfile.js";
import User from "../models/User.js";
import { isEmailConfigured, sendProjectApprovedEmail } from "./emailService.js";

const QUEUE_CHUNK = 500; // records written per database round trip
const SEND_BATCH = 50; // records read per round while sending
// When the SMTP server is down every email fails; stop instead of trying hundreds of them.
export const MAX_FAILURES_IN_A_ROW = 5;
const NOT_CONFIGURED = "Email is not configured on the server (SMTP_HOST / EMAIL_FROM).";

/** Where "View project" leads: the public page of this exact project (no sign-in needed to view it). */
export const projectLinkFor = (frontendOrigin, projectId) => `${frontendOrigin}/projects/${encodeURIComponent(String(projectId))}`;

const errorText = (error) => String(error?.message || error).slice(0, 450);

/** Marks every still-PENDING email for the project as FAILED; returns how many. */
const failPending = async (projectId, reason) =>
    (await AlumniNotification.updateMany({ project: projectId, status: "PENDING" }, { $set: { status: "FAILED", error: reason } })).modifiedCount;

/** What every email for this project says, read from the database. Null if it's no longer open. */
const loadEmailContent = async (projectId, frontendOrigin) => {
    const project = await Project.findById(projectId)
        .select("school title problem budget category priority studentsBenefited expectedCompletion location reviewStatus")
        .lean();
    if (!project || project.reviewStatus !== "OPEN") return null;
    const [profile, user] = await Promise.all([
        SchoolProfile.findOne({ userId: project.school }).select("schoolName district state").lean(),
        User.findById(project.school).select("name").lean(),
    ]);
    return {
        school: { name: profile?.schoolName || user?.name || "your school", district: profile?.district, state: profile?.state },
        project,
        projectUrl: projectLinkFor(frontendOrigin, project._id),
    };
};

/** Sends this project's PENDING emails one by one. Each record is claimed first, so it is sent at most once. */
const deliverPending = async (projectId, { frontendOrigin }) => {
    const content = await loadEmailContent(projectId, frontendOrigin);
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
        const batch = await AlumniNotification.find({ project: projectId, status: "PENDING" }).sort({ _id: 1 }).limit(SEND_BATCH).select("_id").lean();
        if (!batch.length) break;
        for (const { _id } of batch) {
            const claimed = await AlumniNotification.findOneAndUpdate({ _id, status: "PENDING" }, { $set: { status: "SENDING" } }, { returnDocument: "after" }).lean();
            if (!claimed) continue;
            try {
                // One recipient per message: nobody sees another alum's name or address.
                await sendProjectApprovedEmail({ to: claimed.email, name: claimed.name, ...content });
                await AlumniNotification.updateOne({ _id }, { $set: { status: "SENT", sentAt: new Date() } });
                sent += 1;
                failuresInARow = 0;
            } catch (error) {
                await AlumniNotification.updateOne({ _id }, { $set: { status: "FAILED", error: errorText(error) } });
                failed += 1;
                failuresInARow += 1;
                console.error(`Alumni email ${_id} (project ${projectId}) failed:`, errorText(error));
                if (failuresInARow >= MAX_FAILURES_IN_A_ROW) {
                    failed += await failPending(projectId, `Not sent: stopped after ${MAX_FAILURES_IN_A_ROW} failed emails in a row (last error: ${errorText(error)}).`);
                    console.error(`Alumni emails for project ${projectId} stopped after ${MAX_FAILURES_IN_A_ROW} failures in a row.`);
                    break;
                }
            }
        }
        if (failuresInARow >= MAX_FAILURES_IN_A_ROW) break;
    }
    console.log(`Alumni emails for project ${projectId}: ${sent} sent, ${failed} failed.`);
};

// Project id → the delivery running for it. One at a time per project; a request that arrives while
// one is running makes it look again for PENDING records before it finishes.
const deliveries = new Map();

const startDelivery = (projectId, options) => {
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
            console.error(`Alumni emails for project ${key} stopped:`, errorText(error));
        } finally {
            deliveries.delete(key);
        }
    })();
    deliveries.set(key, entry);
    return entry.promise;
};

/** Resolves when every delivery running in this process has finished (tests, graceful shutdown). */
export const waitForAlumniEmails = async () => {
    while (deliveries.size) await Promise.all([...deliveries.values()].map((d) => d.promise));
};

/**
 * Called once a project has just become OPEN (approval moved it from PENDING_REVIEW). Records one email
 * for each ACTIVE alum of that project's school who hasn't opted out, then starts sending in the
 * background. The unique (project, alum) index means a repeated call adds nothing and sends nothing.
 * @returns {Promise<{status: "QUEUED"|"ALREADY_QUEUED"|"NO_ALUMNI"|"EMAIL_UNAVAILABLE", queued: number}>}
 */
export const queueProjectApprovalEmails = async (project, { frontendOrigin }) => {
    const recipients = await Alumni.find({ school: project.school, status: "ACTIVE", emailNotificationsEnabled: { $ne: false } })
        .select("_id name email")
        .lean();
    if (!recipients.length) return { status: "NO_ALUMNI", queued: 0 };

    // Without email set up, the attempt is still recorded, as FAILED with the reason.
    const configured = isEmailConfigured();
    let added = 0;
    for (let i = 0; i < recipients.length; i += QUEUE_CHUNK) {
        const result = await AlumniNotification.bulkWrite(
            recipients.slice(i, i + QUEUE_CHUNK).map((a) => ({
                updateOne: {
                    filter: { project: project._id, alumni: a._id },
                    update: {
                        $setOnInsert: {
                            school: project.school,
                            name: a.name,
                            email: a.email,
                            ...(configured ? { status: "PENDING" } : { status: "FAILED", error: NOT_CONFIGURED }),
                        },
                    },
                    upsert: true,
                },
            })),
            { ordered: false }
        );
        added += result.upsertedCount;
    }

    if (!configured) {
        console.warn(`Project ${project._id} approved, but ${added} alumni emails were not sent: ${NOT_CONFIGURED}`);
        return { status: "EMAIL_UNAVAILABLE", queued: 0 };
    }
    if (!added) return { status: "ALREADY_QUEUED", queued: 0 };
    startDelivery(project._id, { frontendOrigin });
    return { status: "QUEUED", queued: added };
};

/**
 * At server start: continue sending what a restart left PENDING. An email that was mid-send when the
 * server stopped may already have been delivered, so it is marked FAILED rather than sent twice.
 */
export const resumeAlumniNotifications = async ({ frontendOrigin }) => {
    const interrupted = await AlumniNotification.updateMany(
        { status: "SENDING", project: { $nin: [...deliveries.keys()] } },
        { $set: { status: "FAILED", error: "Interrupted by a server restart. Not sent again, in case it had already been delivered." } }
    );
    const projects = await AlumniNotification.distinct("project", { status: "PENDING" });
    for (const id of projects) startDelivery(id, { frontendOrigin });
    return { interrupted: interrupted.modifiedCount, projects: projects.length };
};
