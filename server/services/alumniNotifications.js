// "A project from your school was approved" emails to the school's alumni.
//
// Approval writes one PENDING AlumniNotification per active alum, then the email queue (emailQueue.js)
// sends them one at a time, in the background; resumeAlumniNotifications() continues after a restart.
import Alumni from "../models/Alumni.js";
import AlumniNotification from "../models/AlumniNotification.js";
import { createEmailQueue, loadOpenProject, NOT_CONFIGURED } from "./emailQueue.js";
import { isEmailConfigured, sendProjectApprovedEmail } from "./emailService.js";

export { MAX_FAILURES_IN_A_ROW } from "./emailQueue.js";

const QUEUE_CHUNK = 500; // records written per database round trip

/** Where "View project" leads: the public page of this exact project (no sign-in needed to view it). */
export const projectLinkFor = (frontendOrigin, projectId) => `${frontendOrigin}/projects/${encodeURIComponent(String(projectId))}`;

const queue = createEmailQueue({
    Model: AlumniNotification,
    label: "Alumni emails",
    loadContent: async (projectId, { frontendOrigin }) => {
        const open = await loadOpenProject(projectId);
        if (!open) return null;
        return { ...open, school: { ...open.school, name: open.school.name || "your school" }, projectUrl: projectLinkFor(frontendOrigin, open.project._id) };
    },
    send: (record, content) => sendProjectApprovedEmail({ to: record.email, name: record.name, ...content }),
});

/** Resolves when every alumni email started in this process has been sent or has failed (tests, shutdown). */
export const waitForAlumniEmails = queue.waitForAll;

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
    queue.start(project._id, { frontendOrigin });
    return { status: "QUEUED", queued: added };
};

/**
 * At server start: continue sending what a restart left PENDING. An email that was mid-send when the
 * server stopped may already have been delivered, so it is marked FAILED rather than sent twice.
 */
export const resumeAlumniNotifications = queue.resume;
