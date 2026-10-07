// VIDYADAAN — rules for a school's alumni list. Imported by BOTH the React form (instant feedback)
// and the Express API (the authoritative check). Keep it free of browser- and Node-only APIs.

import { normalizeEmail, EMAIL_PATTERN } from "./registrationRules.js";

export const ALUMNI_STATUSES = ["ACTIVE", "INACTIVE"];
// Plenty for any real school; stops a runaway script from filling the database.
export const ALUMNI_MAX = 5000;
export const ALUMNI_FIELDS = ["name", "registerNumber", "email", "graduationYear"];
export const GRADUATION_YEAR_MIN = 1930;

const LABELS = { name: "Full name", registerNumber: "Register number", email: "Email address", graduationYear: "Graduation year" };

const isBlank = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

/**
 * Register numbers are compared without regard to case or extra spaces, so "cs 042" and "CS 042"
 * are the same alum. Stored in this form.
 */
export const normalizeRegisterNumber = (value) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ").toUpperCase() : "");

const CHECKS = {
  name: (v, label) => {
    if (typeof v !== "string") return { error: `${label} must be text.` };
    const value = v.trim().replace(/\s+/g, " ");
    if (value.length < 2) return { error: `${label} must be at least 2 characters.` };
    if (value.length > 100) return { error: `${label} must be at most 100 characters.` };
    return { value };
  },
  registerNumber: (v, label) => {
    if (typeof v !== "string" && typeof v !== "number") return { error: `${label} must be text.` };
    const value = normalizeRegisterNumber(String(v));
    if (value.length > 40) return { error: `${label} must be at most 40 characters.` };
    if (!/^[A-Z0-9][A-Z0-9 /._-]*$/.test(value)) return { error: `${label} can use letters, numbers, spaces and / . _ - only.` };
    return { value };
  },
  email: (v, label) => {
    const value = normalizeEmail(v);
    if (!EMAIL_PATTERN.test(value) || value.length > 254) return { error: `Enter a valid ${label.toLowerCase()}.` };
    return { value };
  },
  graduationYear: (v, label) => {
    const text = typeof v === "number" ? String(v) : typeof v === "string" ? v.trim() : "";
    const max = new Date().getFullYear();
    if (!/^\d{4}$/.test(text) || Number(text) < GRADUATION_YEAR_MIN || Number(text) > max) {
      return { error: `${label} must be a year from ${GRADUATION_YEAR_MIN} to ${max}.` };
    }
    return { value: Number(text) };
  },
};
const REQUIRED = ["name", "registerNumber", "email"];

/** Keys a browser may not send (mass-assignment protection: never `school`, `status`…). */
export const getUnexpectedAlumniFields = (data) =>
  data && typeof data === "object" && !Array.isArray(data) ? Object.keys(data).filter((key) => !ALUMNI_FIELDS.includes(key)) : [];

/**
 * Validate a new alum (every field) or an edit (only the fields sent).
 * A blank graduation year comes back as null, meaning "not given".
 * @returns {{ errors: Record<string,string>, values: Record<string, unknown> }}
 */
export const validateAlumni = (data, { isUpdate = false } = {}) => {
  const input = data && typeof data === "object" && !Array.isArray(data) ? data : {};
  const fields = isUpdate ? ALUMNI_FIELDS.filter((f) => f in input) : ALUMNI_FIELDS;
  const errors = {};
  const values = {};
  for (const field of fields) {
    const raw = input[field];
    if (isBlank(raw)) {
      if (REQUIRED.includes(field)) errors[field] = `${LABELS[field]} is required.`;
      else values[field] = null;
      continue;
    }
    const result = CHECKS[field](raw, LABELS[field]);
    if (result.error) errors[field] = result.error;
    else values[field] = result.value;
  }
  return { errors, values };
};
