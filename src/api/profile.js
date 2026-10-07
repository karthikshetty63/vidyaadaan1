import { apiRequest } from "./auth";

export const getMyProfile = () => apiRequest("/api/profile/me");

export const uploadSchoolPhoto = (file) => {
    const form = new FormData();
    form.append("schoolPhoto", file);
    return apiRequest("/api/profile/photo", { method: "PUT", body: form });
};

export const removeSchoolPhoto = () => apiRequest("/api/profile/photo", { method: "DELETE" });

/** `link` is the text read from the school's UPI QR in the browser (the image is never uploaded). */
export const savePaymentQr = (link) => apiRequest("/api/profile/payment-qr", { method: "PUT", body: { link } });

export const removePaymentQr = () => apiRequest("/api/profile/payment-qr", { method: "DELETE" });

// ─── The school's location on the map (school and admins only) ─────────────────
/** Where a Google Maps link points ({ location: { lat, lng } }), to show it before saving. Short links are opened by the server. */
export const resolveMapLink = (link) => apiRequest("/api/profile/map-location/resolve", { method: "POST", body: { link } });

/** { source: "LINK", link } or { source: "DEVICE", lat, lng, accuracy }. Resolves with { message, mapLocation }. */
export const saveMapLocation = (location) => apiRequest("/api/profile/map-location", { method: "PUT", body: location });

export const removeMapLocation = () => apiRequest("/api/profile/map-location", { method: "DELETE" });

/** Only the fields in `changes` are updated (see SCHOOL_PROFILE_EDITABLE). */
export const updateSchoolProfile = (changes) => apiRequest("/api/profile/school", { method: "PATCH", body: changes });
