// "A new school need is open" emails to every NGO and donor, when the VIDYADAAN team approves a project.
//
// Approval writes one PENDING NewNeedEmail per active NGO and donor account that hasn't stopped these
// emails, then the email queue (emailQueue.js) sends them one at a time, in the background: the admin's
// request never waits, and resumeNewNeedEmails() continues after a restart. Each email goes to one
// person, links to the project's public page (with what that kind of account can do there), and has a
// "Stop these emails" link.
import NewNeedEmail from "../models/NewNeedEmail.js";
import User from "../models/User.js";
import { stopEmailsToken } from "./emailPreferences.js";
import { createEmailQueue, loadOpenProject, NOT_CONFIGURED } from "./emailQueue.js";
import { isEmailConfigured, sendNewNeedEmail } from "./emailService.js";

const QUEUE_CHUNK = 500; // records written per database round trip
export const NEW_NEED_EMAIL_ROLES = ["ngo", "donor"];

/** The project's public page, set up for an NGO (Fund this need) or a donor (Donate). */
export const needLinkFor = (frontendOrigin, projectId, role) => `${frontendOrigin}/projects/${encodeURIComponent(String(projectId))}?for=${role}`;
/** The page that stops these emails for one account, without signing in. */
export const stopLinkFor = (frontendOrigin, userId) => `${frontendOrigin}/emails/stop?token=${encodeURIComponent(stopEmailsToken(userId))}`;

const queue = createEmailQueue({
    Model: NewNeedEmail,
    label: "New-need emails",
    loadContent: async (projectId) => {
        const open = await loadOpenProject(projectId);
        return open && { ...open, school: { ...open.school, name: open.school.name || "A government school" } };
    },
    send: (record, { project, school }, { frontendOrigin }) =>
        sendNewNeedEmail({
            to: record.email,
            name: record.name,
            role: record.role,
            school,
            project,
            needUrl: needLinkFor(frontendOrigin, project._id, record.role),
            stopUrl: stopLinkFor(frontendOrigin, record.user),
        }),
});

/** Resolves when every new-need email started in this process has been sent or has failed (tests, shutdown). */
export const waitForNewNeedEmails = queue.waitForAll;

/**
 * Called once a project has just become OPEN. Records one email for each active NGO and donor account
 * that hasn't stopped these emails, then starts sending in the background. The unique (project, account)
 * index means a repeated call adds nothing and sends nothing.
 * @returns {Promise<{status: "QUEUED"|"ALREADY_QUEUED"|"NO_RECIPIENTS"|"EMAIL_UNAVAILABLE", queued: number}>}
 */
export const queueNewNeedEmails = async (project, { frontendOrigin }) => {
    const recipients = await User.find({ role: { $in: NEW_NEED_EMAIL_ROLES }, accountStatus: "active", newNeedEmails: { $ne: false } })
        .select("_id name email role")
        .lean();
    if (!recipients.length) return { status: "NO_RECIPIENTS", queued: 0 };

    // Without email set up, the attempt is still recorded, as FAILED with the reason.
    const configured = isEmailConfigured();
    let added = 0;
    for (let i = 0; i < recipients.length; i += QUEUE_CHUNK) {
        const result = await NewNeedEmail.bulkWrite(
            recipients.slice(i, i + QUEUE_CHUNK).map((u) => ({
                updateOne: {
                    filter: { project: project._id, user: u._id },
                    update: {
                        $setOnInsert: {
                            school: project.school,
                            role: u.role,
                            name: u.name,
                            email: u.email,
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
        console.warn(`Project ${project._id} approved, but ${added} emails to NGOs and donors were not sent: ${NOT_CONFIGURED}`);
        return { status: "EMAIL_UNAVAILABLE", queued: 0 };
    }
    if (!added) return { status: "ALREADY_QUEUED", queued: 0 };
    queue.start(project._id, { frontendOrigin });
    return { status: "QUEUED", queued: added };
};

/** At server start: continue sending what a restart left PENDING (see emailQueue.js). */
export const resumeNewNeedEmails = queue.resume;
