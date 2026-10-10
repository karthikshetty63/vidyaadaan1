import mongoose from "mongoose";
import Donation from "../models/Donation.js";
import Project from "../models/Project.js";
import SchoolProfile from "../models/SchoolProfile.js";
import { DONATION_MIN, getUnexpectedDonationFields, validateDonation } from "../../shared/donationRules.js";
import { logActivity } from "../services/activityLog.js";
import { createRazorpayOrder, getRazorpayKeyId, isRazorpayConfigured, isValidPaymentSignature, razorpayMode, readCheckoutResult } from "../services/razorpay.js";
import { findFundableProject } from "./approvedProjectController.js";

// Donors pay online through Razorpay (test mode for now):
//   1. POST /api/donations             the server checks the project and the amount, creates the
//                                      Razorpay order (which fixes the amount) and saves a CREATED donation.
//   2. Razorpay Checkout, in the browser: the donor pays; Razorpay hands back the order ID, the
//                                      payment ID and a signature.
//   3. POST /api/donations/:id/verify  the server checks that signature with the key secret. Only then
//                                      is the donation PAID and added to the project's `raised`.
// Nothing the browser says about a payment is trusted without that signature.
//
// A project's funding: `raised` = NGO payments the school accepted + verified donations, each added
// exactly once. What donors can still give = budget − the parts NGOs have committed to (paid or not)
// − what donors have already given, so no one pays for money an NGO has already promised.

const formatINR = (n) => `₹${n.toLocaleString("en-IN")}`;
const badRequest = (res, message, errors) => res.status(400).json({ message, ...(errors ? { errors } : {}) });
const unavailable = (res) =>
    res.status(503).json({ code: "DONATIONS_UNAVAILABLE", message: "Donations aren't available right now. Please try again later." });
const needNotFound = (res) => res.status(404).json({ message: "This school need is no longer available." });
const donationNotFound = (res) => res.status(404).json({ message: "Donation not found." });

/** What the donor sees of their donation. There is no card or bank data to show: VIDYADAAN never has it. */
const toClient = (d, projectTitle) => ({
    id: d._id.toString(),
    project: { id: d.project.toString(), title: projectTitle || "School need" },
    amount: d.amount,
    currency: d.currency,
    status: d.status,
    mode: d.mode,
    paymentId: d.paymentId || null,
    createdAt: d.createdAt,
    verifiedAt: d.verifiedAt || null,
});

const MY_DONATIONS_LIMIT = 500;

// GET /api/donations/mine — the signed-in donor's own confirmed donations, newest first, for "My donations"
// and the donor's report. Only PAID ones: an order the donor never paid is not a donation. Each comes with
// the need's title and the school's name and place (the donor-safe view), never other donors' details.
export const listMyDonations = async (req, res, next) => {
    try {
        const donations = await Donation.find({ donor: req.user._id, status: "PAID" })
            .sort({ verifiedAt: -1, _id: -1 })
            .limit(MY_DONATIONS_LIMIT)
            .lean();
        const projects = await Project.find({ _id: { $in: [...new Set(donations.map((d) => d.project.toString()))] } })
            .select("title school")
            .lean();
        const profiles = await SchoolProfile.find({ userId: { $in: [...new Set(projects.map((p) => p.school.toString()))] } })
            .select("userId schoolName district state")
            .lean();
        const projectById = new Map(projects.map((p) => [p._id.toString(), p]));
        const schoolByUser = new Map(profiles.map((s) => [s.userId.toString(), s]));
        return res.json({
            donations: donations.map((d) => {
                const project = projectById.get(d.project.toString());
                const school = project && schoolByUser.get(project.school.toString());
                return {
                    ...toClient(d, project?.title),
                    school: { name: school?.schoolName || "Government school", district: school?.district || "", state: school?.state || "" },
                };
            }),
        });
    } catch (error) {
        return next(error);
    }
};

/** What donors can still give to a project (lean, with its fundingParts), in whole rupees. */
const openForDonors = async (project) => {
    const committedByNgos = project.fundingParts.reduce((sum, f) => sum + f.amount, 0);
    const [given] = await Donation.aggregate([
        { $match: { project: project._id, status: "PAID" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return Math.max(0, project.budget - committedByNgos - (given?.total || 0));
};

// POST /api/donations  { projectId, amount, currency? } — start a donation: create its Razorpay order.
// GET /api/school/donations — confirmed donor donations to the signed-in school's projects, newest first.
// Amounts and dates only: a school never sees who its donors are.
export const listSchoolDonations = async (req, res, next) => {
    try {
        const donations = await Donation.find({ school: req.user._id, status: "PAID" })
            .sort({ verifiedAt: -1, _id: -1 })
            .limit(MY_DONATIONS_LIMIT)
            .select("project amount mode verifiedAt createdAt")
            .lean();
        const projects = await Project.find({ _id: { $in: [...new Set(donations.map((d) => d.project.toString()))] }, school: req.user._id }).select("title").lean();
        const titleById = new Map(projects.map((p) => [p._id.toString(), p.title]));
        return res.json({
            donations: donations.map((d) => ({
                id: d._id.toString(),
                project: { id: d.project.toString(), title: titleById.get(d.project.toString()) || "School need" },
                amount: d.amount,
                mode: d.mode,
                verifiedAt: d.verifiedAt || d.createdAt,
            })),
        });
    } catch (error) {
        return next(error);
    }
};

/** How a donation appears in the activity log. */
const donationTarget = (donation, projectTitle) => ({ type: "donation", id: donation._id, label: `${formatINR(donation.amount)}${projectTitle ? ` · ${projectTitle}` : ""}` });

export const createDonation = async (req, res, next) => {
    if (!isRazorpayConfigured()) return unavailable(res);
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) return badRequest(res, "Request body must be a JSON object.");
    // The donor is always the signed-in user; the project, school and amounts come from the database.
    const unexpected = getUnexpectedDonationFields(body);
    if (unexpected.length) {
        return badRequest(res, `Unexpected field(s): ${unexpected.join(", ")}.`, Object.fromEntries(unexpected.map((f) => [f, "This field is not allowed."])));
    }
    const { errors, values } = validateDonation(body);
    if (Object.keys(errors).length) return badRequest(res, Object.values(errors)[0], errors);

    try {
        const project = await findFundableProject(values.projectId);
        if (!project) return needNotFound(res);

        const open = await openForDonors(project);
        if (open < DONATION_MIN) return res.status(409).json({ message: "This need is already fully funded or promised by NGOs." });
        if (values.amount > open) {
            const message = `You can give up to ${formatINR(open)} to this need.`;
            return badRequest(res, message, { amount: message });
        }

        // The donation's ID is the order's receipt, so every Razorpay order points back to its donation.
        const donationId = new mongoose.Types.ObjectId();
        let order;
        try {
            order = await createRazorpayOrder({
                amount: values.amount * 100, // paise
                currency: values.currency,
                receipt: donationId.toString(),
                notes: { projectId: project._id.toString() },
            });
        } catch (error) {
            console.error("Razorpay order could not be created:", error.message);
            return res.status(502).json({ message: "We couldn't reach the payment service. Please try again in a moment." });
        }

        const donation = await Donation.create({
            _id: donationId,
            donor: req.user._id,
            project: project._id,
            school: project.school,
            amount: values.amount,
            currency: values.currency,
            mode: razorpayMode(),
            orderId: order.id,
        });
        logActivity(req, {
            action: "donation.started",
            result: "info",
            target: donationTarget(donation, project.title),
            details: { projectId: project._id, projectTitle: project.title, schoolId: project.school, amount: donation.amount, mode: donation.mode },
        });
        return res.status(201).json({
            message: "Donation started. It is confirmed only once the payment has been verified.",
            donation: toClient(donation, project.title),
            // What Razorpay Checkout needs to open this order. The key ID is public; the secret never leaves the server.
            checkout: {
                keyId: getRazorpayKeyId(),
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                name: "VIDYADAAN",
                description: project.title,
            },
        });
    } catch (error) {
        return next(error);
    }
};

// POST /api/donations/:id/verify  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// — the three values Razorpay Checkout hands the browser after a payment. Safe to send more than once.
export const verifyDonation = async (req, res, next) => {
    if (!isRazorpayConfigured()) return unavailable(res);
    const checkout = readCheckoutResult(req.body);
    if (!checkout) return badRequest(res, "The payment details are missing or incomplete.");
    const { orderId, paymentId, signature } = checkout;
    if (!mongoose.isValidObjectId(req.params.id)) return donationNotFound(res);

    try {
        // Only the signed-in donor's own donation; anyone else's looks like it doesn't exist.
        let donation = await Donation.findOne({ _id: req.params.id, donor: req.user._id }).lean();
        if (!donation) return donationNotFound(res);
        if (orderId !== donation.orderId) return badRequest(res, "These payment details are for a different donation.");
        // The proof that Razorpay took the payment: only Razorpay (and this server) can make this signature.
        if (!isValidPaymentSignature({ orderId: donation.orderId, paymentId, signature })) {
            logActivity(req, { action: "donation.verification_failed", result: "failure", target: donationTarget(donation), details: { projectId: donation.project, amount: donation.amount } });
            return badRequest(res, "We couldn't verify this payment, so no donation was recorded. If money left your account, contact VIDYADAAN support with your payment ID.");
        }

        // Claim it: CREATED → PAID happens once, however many requests arrive at the same moment.
        let justVerified = false;
        if (donation.status === "CREATED") {
            try {
                const claimed = await Donation.findOneAndUpdate(
                    { _id: donation._id, status: "CREATED" },
                    { $set: { status: "PAID", paymentId, verifiedAt: new Date() } },
                    { returnDocument: "after" }
                ).lean();
                justVerified = Boolean(claimed);
                donation = claimed || (await Donation.findById(donation._id).lean());
            } catch (error) {
                // The unique index on paymentId: this payment already belongs to another donation.
                if (error.code === 11000) return res.status(409).json({ message: "This payment has already been recorded." });
                throw error;
            }
        }
        if (donation.paymentId !== paymentId) {
            return res.status(409).json({ message: "This donation has already been paid with a different payment." });
        }

        // Add it to the project's `raised` exactly once. The increase only happens while the donation isn't
        // in countedDonations, in the same atomic update that adds it there. A repeat request, or a retry
        // after a failure between the claim and this step, can't count it twice.
        await Project.updateOne(
            { _id: donation.project, countedDonations: { $ne: donation._id } },
            { $inc: { raised: donation.amount }, $push: { countedDonations: donation._id } }
        );

        const project = await Project.findById(donation.project).select("title").lean();
        // Only the request that verified it records it (repeat requests change nothing).
        if (justVerified) {
            logActivity(req, {
                action: "donation.verified",
                target: donationTarget(donation, project?.title),
                details: { projectId: donation.project, projectTitle: project?.title, schoolId: donation.school, amount: donation.amount, mode: donation.mode, paymentId: donation.paymentId },
            });
        }
        return res.json({
            message: `Your donation of ${formatINR(donation.amount)} is confirmed. Thank you!`,
            donation: toClient(donation, project?.title),
        });
    } catch (error) {
        return next(error);
    }
};
