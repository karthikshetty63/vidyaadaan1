import bcrypt from "bcryptjs";
import { Buffer } from "node:buffer";
import SchoolProfile from "../models/SchoolProfile.js";
import NGOProfile from "../models/NGOProfile.js";
import User from "../models/User.js";
import {
    EMAIL_PATTERN,
    PASSWORD_MAX_BYTES,
    PUBLIC_ROLES,
    ROLES,
    UDISE_PATTERN,
    UPLOAD_RULES,
    getAccountName,
    getMissingUploads,
    getUnexpectedFields,
    normalizeEmail,
    pickProfileValues,
    validateRegistration,
} from "../../shared/registrationRules.js";
import { PROFILE_MODELS, duplicateKeyError, toProfileDocument } from "../services/profileModels.js";
import { deleteUploadedFiles, storeUploads, validateUploads } from "../services/uploadService.js";
import { clearAuthCookie, getTokenFromRequest, safeUser, setAuthCookie, verifyToken } from "../utils/authToken.js";

const ROLE_LABELS = { donor: "Donor", school: "School", ngo: "NGO", admin: "Admin" };

const badRequest = (res, message, errors, extra = {}) => res.status(400).json({ message, ...(errors ? { errors } : {}), ...extra });

/**
 * Registration accepts either JSON, or multipart/form-data with:
 *   data = JSON string of the form values
 *   <upload field> = file (see UPLOAD_RULES)
 */
const readRegistrationBody = (req) => {
    if (!req.is("multipart/form-data")) {
        const body = req.body;
        if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "Request body must be a JSON object." };
        return { body };
    }
    const textFields = Object.keys(req.body || {});
    const unexpected = textFields.filter((name) => name !== "data");
    if (unexpected.length) return { error: `Unexpected field(s): ${unexpected.join(", ")}.` };
    try {
        const body = JSON.parse(req.body?.data ?? "{}");
        if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("not an object");
        return { body };
    } catch {
        return { error: "Registration data must be valid JSON." };
    }
};

export const register = async (req, res, next) => {
    const { body, error: bodyError } = readRegistrationBody(req);
    if (bodyError) return badRequest(res, bodyError);

    // The server decides which roles may self-register and every account status.
    const role = typeof body.role === "string" ? body.role.trim().toLowerCase() : "";
    if (role === "admin") return badRequest(res, "Admin accounts cannot be registered.", { role: "Admin accounts cannot be registered." });
    if (!PUBLIC_ROLES.includes(role)) return badRequest(res, "Role must be donor, school, or ngo.", { role: "Role must be donor, school, or ngo." });

    // Mass-assignment protection: only fields shown on that role's form are accepted.
    const unexpected = getUnexpectedFields(role, body);
    if (unexpected.length) {
        return badRequest(res, `Unexpected field(s): ${unexpected.join(", ")}.`, Object.fromEntries(unexpected.map((f) => [f, "This field is not allowed."])));
    }

    const { errors, values, firstErrorStep } = validateRegistration(role, body);
    const uploadRules = UPLOAD_RULES[role];
    const { errors: uploadErrors, accepted } = validateUploads(req.files || [], uploadRules);
    for (const missing of getMissingUploads(role, accepted.map((f) => f.field), uploadRules)) uploadErrors[missing.field] = missing.message;

    const allErrors = { ...errors, ...uploadErrors };
    if (Object.keys(allErrors).length) {
        const uploadSteps = Object.keys(uploadErrors).map((f) => uploadRules[f]?.step ?? 0);
        const step = Math.min(...[firstErrorStep, ...uploadSteps].filter((s) => s !== null && s !== undefined));
        return badRequest(res, Object.values(allErrors)[0], allErrors, { step });
    }

    const email = values.email;
    let user;
    let storedFiles = {};
    try {
        // Friendly duplicate checks first; unique indexes below still catch races.
        if (await User.exists({ email })) {
            return res.status(409).json({ message: "An account with this email already exists.", errors: { email: "An account with this email already exists." } });
        }
        if (role === "school" && (await SchoolProfile.exists({ udise: values.udise }))) {
            return res.status(409).json({ message: "A school with this UDISE code is already registered.", errors: { udise: "A school with this UDISE code is already registered." } });
        }
        if (role === "ngo" && (await NGOProfile.exists({ pan: values.pan }))) {
            return res.status(409).json({ message: "An NGO with this PAN is already registered.", errors: { pan: "An NGO with this PAN is already registered." } });
        }

        user = await User.create({
            name: getAccountName(role, values),
            email,
            password: values.password,
            role,
            // Schools and NGOs must be verified by an admin before they can log in.
            accountStatus: role === "donor" ? "active" : "pending",
        });

        storedFiles = await storeUploads(user._id, accepted);

        const profile = { ...toProfileDocument(role, pickProfileValues(role, values)), userId: user._id };
        if (role !== "donor") profile.email = email; // School/NGO profiles keep their official email.
        for (const [field, doc] of Object.entries(storedFiles)) {
            const [first, second] = uploadRules[field].profilePath.split(".");
            if (second) profile[first] = { ...(profile[first] || {}), [second]: doc._id };
            else profile[first] = doc._id;
        }
        await PROFILE_MODELS[role].create(profile);

        return res.status(201).json({
            message: role === "donor" ? "Registration successful." : "Registration submitted. Your account is pending admin approval.",
            user: safeUser(user),
        });
    } catch (error) {
        // Roll back everything this request created so no half-registered account remains.
        await deleteUploadedFiles(Object.values(storedFiles));
        if (user?._id) await User.deleteOne({ _id: user._id }).catch(() => {});

        if (error.code === 11000) {
            const { field, message } = duplicateKeyError(error);
            return res.status(409).json({ message, errors: { [field]: message } });
        }
        return next(error);
    }
};

// A real bcrypt hash of a random string, compared against when the email is unknown
// so "unknown email" and "wrong password" take about the same time.
let dummyHashPromise;
const getDummyHash = () => (dummyHashPromise ||= bcrypt.hash(`no-user-${Math.random()}`, 12));

const findUserForLogin = async (identifier, portalRole) => {
    if (EMAIL_PATTERN.test(identifier)) return User.findOne({ email: identifier }).select("+password");
    // The school portal also accepts the 11-digit UDISE code.
    if (portalRole === "school" && UDISE_PATTERN.test(identifier)) {
        const profile = await SchoolProfile.findOne({ udise: identifier }).select("userId");
        return profile ? User.findById(profile.userId).select("+password") : null;
    }
    return undefined;
};

export const login = async (req, res, next) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const identifier = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    const portalRole = body.role === undefined ? undefined : body.role;

    if (portalRole !== undefined && !ROLES.includes(portalRole)) return badRequest(res, "Unknown login portal.");
    if (!identifier || !password) {
        return badRequest(res, portalRole === "school" ? "Email / UDISE code and password are required." : "Email and password are required.");
    }

    try {
        const user = await findUserForLogin(identifier, portalRole);
        if (user === undefined) {
            return badRequest(res, portalRole === "school" ? "Enter a valid email address or 11-digit UDISE code." : "Enter a valid email address.");
        }

        const passwordFits = Buffer.byteLength(password, "utf8") <= PASSWORD_MAX_BYTES;
        let passwordOk = false;
        if (user && passwordFits) {
            passwordOk = await user.verifyPassword(password);
        } else {
            await bcrypt.compare(password.slice(0, PASSWORD_MAX_BYTES), await getDummyHash());
        }
        if (!user || !passwordOk) {
            return res.status(401).json({ code: "INVALID_CREDENTIALS", message: "Invalid email or password." });
        }

        // The password was correct, so it is safe to explain why login cannot continue.
        if (portalRole && user.role !== portalRole) {
            return res.status(403).json({
                code: "WRONG_PORTAL",
                role: user.role,
                message: `This is a ${ROLE_LABELS[user.role]} account. Please use the ${ROLE_LABELS[user.role]} login page.`,
            });
        }
        if (user.accountStatus === "pending") {
            return res.status(403).json({ code: "ACCOUNT_PENDING", message: "Your account is pending admin approval. You can log in once it has been approved." });
        }
        if (user.accountStatus === "rejected") {
            return res.status(403).json({
                code: "ACCOUNT_REJECTED",
                reason: user.rejectionReason || null,
                message: `Your registration was rejected${user.rejectionReason ? `: ${user.rejectionReason}` : "."} Please contact VIDYADAAN support.`,
            });
        }

        setAuthCookie(res, user, body.remember === true);
        return res.status(200).json({ message: "Login successful.", user: safeUser(user) });
    } catch (error) {
        return next(error);
    }
};

export const me = (req, res) => res.status(200).json({ user: safeUser(req.user) });

export const logout = async (req, res, next) => {
    try {
        // Revoke the token server-side (signs this user out on every device), then clear the cookie.
        const payload = verifyToken(getTokenFromRequest(req));
        if (payload?.userId) {
            await User.updateOne({ _id: payload.userId }, { $inc: { tokenVersion: 1 } });
        }
        clearAuthCookie(res);
        return res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
        clearAuthCookie(res);
        return next(error);
    }
};
