// Emails about a person's own account or records: when the VIDYADAAN team decides on a registration, a
// project or an event; when a school accepts or rejects an NGO's payment; when a school answers an
// offer of help. Each is sent in the background after the action has succeeded, so an email problem
// never changes what the person who acted sees: it is only written to the server log (never with an
// address). Without an email service configured, nothing is sent.
import Project from "../models/Project.js";
import SchoolProfile from "../models/SchoolProfile.js";
import User from "../models/User.js";
import { isEmailConfigured, sendUpdateEmail } from "./emailService.js";

const ROLE_NAMES = { school: "school", ngo: "NGO", donor: "donor" };
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const day = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const partsText = (parts) => (parts.length === 1 ? `part ${parts[0]}` : `parts ${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`);
const schoolNameOf = async (schoolId) => (await SchoolProfile.findOne({ userId: schoolId }).select("schoolName").lean())?.schoolName || "The school";
const recipient = (userId) => User.findById(userId).select("name email role accountStatus").lean();

// Emails still being sent, so tests (and a graceful shutdown) can wait for them.
const pending = new Set();
/** Resolves once every email started so far has been sent or has failed. */
export const notificationEmailsSettled = () => Promise.all([...pending]);

/** Runs `send` in the background. Resolves true if an email went out; never rejects. */
const deliver = (what, send) => {
    if (!isEmailConfigured()) return Promise.resolve(false);
    const task = (async () => {
        try {
            const sent = await send();
            return sent !== false;
        } catch (error) {
            console.error(`${what} email could not be sent:`, error.message);
            return false;
        }
    })();
    pending.add(task);
    task.finally(() => pending.delete(task));
    return task;
};

/** The admin approved or rejected a registration. `user` is the account (with its email). */
export const emailAccountDecision = (origin, user, { approved, reason }) =>
    deliver("Account decision", () =>
        sendUpdateEmail({
            to: user.email,
            name: user.name,
            subject: approved ? "Your VIDYADAAN account is approved" : "Your VIDYADAAN registration was not approved",
            heading: approved ? "Your account is approved" : "Your registration was not approved",
            lines: approved
                ? [`The VIDYADAAN team has checked your registration and approved your ${ROLE_NAMES[user.role] || ""} account. You can sign in now.`]
                : ["The VIDYADAAN team has checked your registration and could not approve it.", "If you can correct this, reply to the team from the Contact page, using this email address."],
            quote: !approved && reason ? { label: "Reason", text: reason } : undefined,
            action: approved ? { label: "Sign in", url: `${origin}/login/${user.role}` } : { label: "Contact the team", url: `${origin}/contact` },
        })
    );

/** The admin approved a project or asked for changes. Goes to the project's school. `alumniQueued`: how many alumni emails the approval queued. */
export const emailProjectDecision = (origin, project, { approved, reason, alumniQueued = 0 }) =>
    deliver("Project decision", async () => {
        const school = await recipient(project.school);
        if (!school) return false;
        return sendUpdateEmail({
            to: school.email,
            name: school.name,
            subject: approved ? `Your project is approved: ${project.title}` : `Changes requested for your project: ${project.title}`,
            heading: approved ? "Your project is approved" : "Changes requested for your project",
            lines: approved
                ? [
                    `The VIDYADAAN team has approved “${project.title}”.`,
                    `NGOs and donors can now see it and fund it.${alumniQueued > 0 ? ` ${alumniQueued === 1 ? "Your active alum is" : `Your ${alumniQueued} active alumni are`} being emailed about it.` : ""}`,
                ]
                : [`The VIDYADAAN team has asked for changes to “${project.title}” before it can be listed.`, "Edit the project to make the changes. Saving it sends it for review again."],
            quote: !approved && reason ? { label: "Changes requested", text: reason } : undefined,
            action: { label: approved ? "View project" : "Edit project", url: `${origin}/dashboard/school/progress?project=${project._id}` },
        });
    });

/** The admin approved an event or asked for changes. Goes to the event's school. */
export const emailEventDecision = (origin, event, { approved, reason }) =>
    deliver("Event decision", async () => {
        const school = await recipient(event.school);
        if (!school) return false;
        return sendUpdateEmail({
            to: school.email,
            name: school.name,
            subject: approved ? `Your event is approved: ${event.title}` : `Changes requested for your event: ${event.title}`,
            heading: approved ? "Your event is approved" : "Changes requested for your event",
            lines: approved
                ? [`The VIDYADAAN team has approved “${event.title}” on ${day(event.date)}.`, "NGOs and donors can now see it and offer help. You'll find their offers on your School Events page."]
                : [`The VIDYADAAN team has asked for changes to “${event.title}” before NGOs and donors can see it.`, "Edit the event to make the changes. Saving it sends it for review again."],
            quote: !approved && reason ? { label: "Changes requested", text: reason } : undefined,
            action: { label: "Open School Events", url: `${origin}/dashboard/school/events` },
        });
    });

/** A school accepted or rejected an NGO's direct payment. Goes to the NGO. */
export const emailPaymentDecision = (origin, payment, { accepted, reason }) =>
    deliver("Payment decision", async () => {
        const [ngo, project, schoolName] = await Promise.all([recipient(payment.ngo), Project.findById(payment.project).select("title").lean(), schoolNameOf(payment.school)]);
        if (!ngo) return false;
        const what = `${inr(payment.amount)} for “${project?.title || "a school need"}” (${partsText(payment.parts)})`;
        return sendUpdateEmail({
            to: ngo.email,
            name: ngo.name,
            subject: accepted ? `Payment accepted: ${inr(payment.amount)} to ${schoolName}` : `Payment not confirmed: ${inr(payment.amount)} to ${schoolName}`,
            heading: accepted ? "The school accepted your payment" : "The school could not confirm your payment",
            lines: accepted
                ? [`${schoolName} has confirmed that your payment of ${what} reached its account.`, "Those parts now count as received."]
                : [`${schoolName} could not confirm your payment of ${what}.`, "Check the payment with your bank, then send it again from Funding. Your parts stay reserved for your NGO."],
            quote: !accepted && reason ? { label: "The school's reason", text: reason } : undefined,
            action: { label: "Open Funding", url: `${origin}/dashboard/ngo#funding` },
        });
    });

/** A school accepted or declined an offer of help for an event. Goes to the NGO or donor who offered. */
export const emailOfferAnswered = (origin, event, offer) =>
    deliver("Offer answer", async () => {
        const [supporter, schoolName] = await Promise.all([recipient(offer.supporter), schoolNameOf(event.school)]);
        if (!supporter) return false;
        const accepted = offer.status === "ACCEPTED";
        return sendUpdateEmail({
            to: supporter.email,
            name: supporter.name,
            subject: accepted ? `Your offer of help was accepted: ${event.title}` : `Your offer of help was declined: ${event.title}`,
            heading: accepted ? "The school accepted your offer of help" : "The school declined your offer of help",
            lines: accepted
                ? [`${schoolName} has accepted your offer (${offer.kinds.join(", ")}) for “${event.title}” on ${day(event.date)}.`, "The school will contact you to arrange the details."]
                : [`${schoolName} has declined your offer (${offer.kinds.join(", ")}) for “${event.title}”.`, "Thank you for offering to help."],
            quote: offer.note ? { label: "Note from the school", text: offer.note } : undefined,
            action: { label: "Open School Events", url: `${origin}/dashboard/${offer.role}#events` },
        });
    });
