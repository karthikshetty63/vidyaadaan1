import SchoolProfile from "../models/SchoolProfile.js";
import { MAP_LOCATION_FIELDS, MAP_LOCATION_SOURCES, checkDeviceLocation } from "../../shared/mapLocationRules.js";
import { logActivity } from "../services/activityLog.js";
import { MapLinkError, resolveMapLink } from "../services/mapLinks.js";

// The signed-in school's own location on the map. Always the school's own profile (from the session),
// never one named in the request. Only the school and admins ever see it.

const badRequest = (res, message, field) => res.status(400).json({ message, ...(field ? { errors: { [field]: message } } : {}) });
const noProfile = (res) => res.status(404).json({ message: "School profile not found." });

/** A stored location (lean) → what the school's browser (and the admin) receives. */
export const mapLocationToClient = (m) =>
    m ? { lat: m.lat, lng: m.lng, source: m.source, accuracy: typeof m.accuracy === "number" ? m.accuracy : null, setAt: m.setAt } : null;

const linkFailed = (res, error, next) =>
    error instanceof MapLinkError ? res.status(error.status).json({ message: error.message, errors: { link: error.message } }) : next(error);

// POST /api/profile/map-location/resolve  { link } — where a Google Maps link points, to show it before saving.
export const previewMapLink = async (req, res, next) => {
    const link = req.body?.link;
    if (typeof link !== "string") return badRequest(res, "Paste a Google Maps link.", "link");
    try {
        return res.json({ location: await resolveMapLink(link) });
    } catch (error) {
        return linkFailed(res, error, next);
    }
};

// PUT /api/profile/map-location
//   { source: "LINK", link }                    the server reads the coordinates from the Google Maps link itself
//   { source: "DEVICE", lat, lng, accuracy }    "Use my current location" (must be precise to 1 km)
export const saveMapLocation = async (req, res, next) => {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) return badRequest(res, "Request body must be a JSON object.");
    if (!MAP_LOCATION_SOURCES.includes(body.source)) return badRequest(res, "Choose a Google Maps link or your current location.", "source");
    const unexpected = Object.keys(body).filter((key) => !MAP_LOCATION_FIELDS[body.source].includes(key));
    if (unexpected.length) return badRequest(res, `Unexpected field(s): ${unexpected.join(", ")}.`);

    let point;
    if (body.source === "LINK") {
        if (typeof body.link !== "string") return badRequest(res, "Paste a Google Maps link.", "link");
        try {
            point = await resolveMapLink(body.link);
        } catch (error) {
            return linkFailed(res, error, next);
        }
    } else {
        const checked = checkDeviceLocation(body);
        if (checked.error) return badRequest(res, checked.error, "location");
        point = checked.value;
    }

    try {
        const mapLocation = { lat: point.lat, lng: point.lng, source: body.source, ...(body.source === "DEVICE" ? { accuracy: point.accuracy } : {}), setAt: new Date() };
        const updated = await SchoolProfile.findOneAndUpdate({ userId: req.user._id }, { $set: { mapLocation } }, { returnDocument: "after", runValidators: true })
            .select("mapLocation")
            .lean();
        if (!updated) return noProfile(res);
        // How it was set, never the coordinates (they stay between the school and the admin's map view).
        logActivity(req, { action: "map_location.saved", target: { type: "profile", id: req.user._id, label: "School map location" }, details: { source: body.source } });
        return res.json({ message: "Your school's location on the map is saved.", mapLocation: mapLocationToClient(updated.mapLocation) });
    } catch (error) {
        return next(error);
    }
};

// DELETE /api/profile/map-location
export const removeMapLocation = async (req, res, next) => {
    try {
        const updated = await SchoolProfile.findOneAndUpdate({ userId: req.user._id }, { $unset: { mapLocation: "" } }, { returnDocument: "after" })
            .select("_id")
            .lean();
        if (!updated) return noProfile(res);
        logActivity(req, { action: "map_location.removed", target: { type: "profile", id: req.user._id, label: "School map location" } });
        return res.json({ message: "Your school's location on the map was removed.", mapLocation: null });
    } catch (error) {
        return next(error);
    }
};
