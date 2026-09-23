import DonorProfile from "../models/DonorProfile.js";
import NGOProfile from "../models/NGOProfile.js";
import SchoolProfile from "../models/SchoolProfile.js";

export const PROFILE_MODELS = { donor: DonorProfile, school: SchoolProfile, ngo: NGOProfile };

/** Registration values (flat, from shared rules) → the shape stored on each profile model. */
export const toProfileDocument = (role, values) => {
    if (role === "donor") {
        const rest = { ...values };
        delete rest.name; // the donor's name lives on the User record
        return rest;
    }
    if (role !== "school") return { ...values };
    const { hasToilets, hasLibrary, hasComputers, hasDrinkingWater, ...rest } = values;
    return {
        ...rest,
        infrastructure: {
            hasToilets: hasToilets === true,
            hasLibrary: hasLibrary === true,
            hasComputers: hasComputers === true,
            hasDrinkingWater: hasDrinkingWater === true,
        },
    };
};

/** Human-readable messages for unique-index collisions (MongoDB error 11000). */
export const duplicateKeyError = (error) => {
    const key = Object.keys(error.keyPattern || error.keyValue || {})[0];
    if (key === "udise") return { field: "udise", message: "A school with this UDISE code is already registered." };
    if (key === "pan") return { field: "pan", message: "An NGO with this PAN is already registered." };
    return { field: "email", message: "An account with this email already exists." };
};
