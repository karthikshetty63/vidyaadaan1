import mongoose from "mongoose";
import Alumni from "../models/Alumni.js";
import { ALUMNI_MAX, ALUMNI_STATUSES, getUnexpectedAlumniFields, validateAlumni } from "../../shared/alumniRules.js";

// A school's own alumni list. Every query is scoped to the signed-in school (req.user._id): another
// school's alum looks exactly like one that doesn't exist.

const badRequest = (res, message, errors) => res.status(400).json({ message, ...(errors ? { errors } : {}) });
const notFound = (res) => res.status(404).json({ message: "Alum not found." });

const toClient = (a) => ({
    id: a._id.toString(),
    name: a.name,
    registerNumber: a.registerNumber,
    email: a.email,
    graduationYear: a.graduationYear ?? null,
    status: a.status,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
});

const readBody = (req, res, { isUpdate }) => {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        badRequest(res, "Request body must be a JSON object.");
        return null;
    }
    const unexpected = getUnexpectedAlumniFields(body);
    if (unexpected.length) {
        badRequest(res, `Unexpected field(s): ${unexpected.join(", ")}.`, Object.fromEntries(unexpected.map((f) => [f, "This field is not allowed."])));
        return null;
    }
    const { errors, values } = validateAlumni(body, { isUpdate });
    if (Object.keys(errors).length) {
        badRequest(res, Object.values(errors)[0], errors);
        return null;
    }
    return values;
};

const DUPLICATE = {
    registerNumber: (v) => `Register number ${v} is already on your alumni list.`,
    email: (v) => `${v} is already on your alumni list.`,
};

/** 409 when another alum of this school already has the register number or email (ignoring `exceptId`). */
const rejectDuplicate = async (res, schoolId, values, exceptId) => {
    for (const field of ["registerNumber", "email"]) {
        if (!values[field]) continue;
        const taken = await Alumni.exists({ school: schoolId, [field]: values[field], ...(exceptId ? { _id: { $ne: exceptId } } : {}) });
        if (taken) {
            const message = DUPLICATE[field](values[field]);
            res.status(409).json({ message, errors: { [field]: message } });
            return true;
        }
    }
    return false;
};

/** The same answer when two requests race past rejectDuplicate and the unique index stops the second. */
const duplicateKeyResponse = (res, error, values) => {
    if (error?.code !== 11000) return false;
    const field = Object.keys(error.keyPattern || {}).find((k) => k in DUPLICATE) || "registerNumber";
    const message = DUPLICATE[field](values[field] ?? "This alum");
    res.status(409).json({ message, errors: { [field]: message } });
    return true;
};

const findOwn = (req) =>
    mongoose.isValidObjectId(req.params.id) ? Alumni.findOne({ _id: req.params.id, school: req.user._id }) : Promise.resolve(null);

// GET /api/school/alumni — this school's alumni, newest first.
export const listAlumni = async (req, res, next) => {
    try {
        const alumni = await Alumni.find({ school: req.user._id }).sort({ createdAt: -1, _id: -1 }).lean();
        return res.json({ alumni: alumni.map(toClient) });
    } catch (error) {
        return next(error);
    }
};

// GET /api/school/alumni/summary — counts only, for the dashboard.
export const alumniSummary = async (req, res, next) => {
    try {
        const [active, inactive] = await Promise.all(
            ALUMNI_STATUSES.map((status) => Alumni.countDocuments({ school: req.user._id, status }))
        );
        return res.json({ active, inactive });
    } catch (error) {
        return next(error);
    }
};

// POST /api/school/alumni
export const createAlumni = async (req, res, next) => {
    const values = readBody(req, res, { isUpdate: false });
    if (!values) return undefined;
    try {
        if ((await Alumni.countDocuments({ school: req.user._id })) >= ALUMNI_MAX) {
            return res.status(409).json({ message: `A school can list at most ${ALUMNI_MAX.toLocaleString("en-IN")} alumni.` });
        }
        if (await rejectDuplicate(res, req.user._id, values)) return undefined;
        const alum = await Alumni.create({ ...values, school: req.user._id, status: "ACTIVE" });
        return res.status(201).json({ message: `${alum.name} added to your alumni.`, alum: toClient(alum) });
    } catch (error) {
        if (duplicateKeyResponse(res, error, values)) return undefined;
        return next(error);
    }
};

// PATCH /api/school/alumni/:id — only the fields sent are changed.
export const updateAlumni = async (req, res, next) => {
    const values = readBody(req, res, { isUpdate: true });
    if (!values) return undefined;
    if (!Object.keys(values).length) return badRequest(res, "Nothing to update.");
    try {
        const alum = await findOwn(req);
        if (!alum) return notFound(res);
        if (await rejectDuplicate(res, req.user._id, values, alum._id)) return undefined;
        alum.set(values);
        await alum.save();
        return res.json({ message: `${alum.name}’s details saved.`, alum: toClient(alum) });
    } catch (error) {
        if (duplicateKeyResponse(res, error, values)) return undefined;
        return next(error);
    }
};

// PATCH /api/school/alumni/:id/status  { status: "ACTIVE" | "INACTIVE" }
export const setAlumniStatus = async (req, res, next) => {
    const body = req.body;
    const extra = body && typeof body === "object" && !Array.isArray(body) ? Object.keys(body).filter((k) => k !== "status") : [];
    if (extra.length) return badRequest(res, `Unexpected field(s): ${extra.join(", ")}.`);
    const status = body?.status;
    if (!ALUMNI_STATUSES.includes(status)) return badRequest(res, "status must be ACTIVE or INACTIVE.", { status: "Choose ACTIVE or INACTIVE." });
    try {
        const alum = await findOwn(req);
        if (!alum) return notFound(res);
        alum.status = status;
        await alum.save();
        const message = status === "ACTIVE" ? `${alum.name} is active again and will get emails about new approved projects.` : `${alum.name} is now inactive and won’t get project emails.`;
        return res.json({ message, alum: toClient(alum) });
    } catch (error) {
        return next(error);
    }
};
