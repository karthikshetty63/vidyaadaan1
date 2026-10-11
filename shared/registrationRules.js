// VIDYADAAN — single source of truth for registration, login and upload rules.
// Imported by BOTH the React registration forms (for instant feedback) and the
// Express server (the authoritative check). Change a rule here and both sides follow.
// Keep this file free of browser-only and Node-only APIs.

export const ROLES = ["donor", "school", "ngo", "admin"];
export const PUBLIC_ROLES = ["donor", "school", "ngo"];
export const ACCOUNT_STATUSES = ["active", "pending", "rejected"];
// Every public account is checked by an admin before it can sign in.
export const APPROVAL_ROLES = ["school", "ngo", "donor"];

export const PASSWORD_MIN_LENGTH = 8;
// bcrypt silently ignores everything after 72 bytes, so longer passwords are rejected.
export const PASSWORD_MAX_BYTES = 72;

// Password reset links carry 32 random bytes (64 hex characters), are single-use and expire quickly.
export const PASSWORD_RESET_TTL_MINUTES = 15;
export const PASSWORD_RESET_TOKEN_PATTERN = /^[a-f0-9]{64}$/;

// Option lists already shown by the existing registration forms.
export const SCHOOL_STATES = ["Karnataka", "Tamil Nadu", "Andhra Pradesh", "Telangana", "Kerala", "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh", "Bihar"];
export const NGO_STATES = ["Karnataka", "Tamil Nadu", "Andhra Pradesh", "Telangana", "Kerala", "Maharashtra", "Gujarat", "Rajasthan"];
export const DONOR_STATES = NGO_STATES;
export const DONOR_CAUSES = ["Libraries", "Toilets", "Classrooms", "Digital Labs", "Mid-day Meal", "School Uniforms", "Sports Equipment", "Water & Sanitation"];
export const DONOR_FREQUENCIES = ["One-time", "Monthly", "Quarterly", "Annually"];
export const NGO_TYPES = ["Trust", "Society", "Section 8 Company", "Others"];
export const NGO_FOCUS_AREAS = ["Education", "Literacy", "Health", "Nutrition", "WASH", "Digital Literacy", "Sports", "Vocational"];

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const UDISE_PATTERN = /^\d{11}$/;
export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const PAN_PATTERN = /^[A-Z]{5}\d{4}[A-Z]$/;

// Confirming the email address at registration: a code is emailed, and typed back on the form.
export const EMAIL_CODE_LENGTH = 6;
export const EMAIL_CODE_TTL_MINUTES = 10;
// How long before the same address can be sent another code.
export const EMAIL_CODE_RESEND_SECONDS = 60;
export const EMAIL_CODE_PATTERN = /^\d{6}$/;

// The most used passwords (worldwide, and those people in India pick most often). One of these, in any
// capitalisation, is refused: it is the first thing anyone guessing would try. Leaked passwords in
// general are checked too, by the server and the form (services/pwnedPasswords.js, utils/pwnedPassword.js).
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password12", "password123", "password@123", "password!", "passw0rd", "p@ssw0rd", "p@ssword",
  "pass@123", "pass@1234", "pass1234", "mypassword", "changeme", "letmein1", "trustno1", "welcome1", "welcome123",
  "welcome@123", "admin123", "admin@123", "administrator", "test1234", "test@123", "demo1234", "temp1234", "guest123",
  "login123", "hello123", "hello@123", "12345678", "123456789", "1234567890", "87654321", "12341234", "11223344",
  "12121212", "12344321", "qwerty12", "qwerty123", "qwerty@123", "qwertyuiop", "1q2w3e4r", "1qaz2wsx", "asdfghjk",
  "asdf1234", "zxcvbnm1", "zxcvbnm123", "abcd1234", "abcd@1234", "abc12345", "abcdefgh", "iloveyou", "iloveyou1",
  "sunshine", "princess", "football", "baseball", "cricket1", "cricket123", "sachin10", "india123", "india@123",
  "india2024", "india2025", "india2026", "bharat123", "jaihind1", "jaishriram", "krishna123", "ganesh123", "sairam123",
  "omsairam", "hanuman1", "mumbai123", "delhi123", "bangalore", "chennai123", "hyderabad", "kolkata1", "pune1234",
  "monkey12", "dragon12", "master123", "superman", "batman123", "starwars", "whatever", "computer", "internet",
  "samsung1", "google123", "facebook", "school123", "school@123", "student123", "teacher123", "education",
  "vidyadaan", "vidyadaan1", "vidyadaan123", "vidyadaan@123", "donate123",
]);

/** Words from a person's own details (name, email, organisation): 4 letters or more. */
const personalWords = (details) =>
  details.flatMap((value) => (typeof value === "string" ? value.toLowerCase().split(/[^a-z0-9]+/) : [])).filter((word) => word.length >= 4);

const utf8Length = (value) => new TextEncoder().encode(value).length;

export const normalizeEmail = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");

/**
 * What is wrong with a new password, or "". Length is the only "shape" rule (no forced symbols): instead,
 * the most used passwords, ones made of 3 or fewer different characters, and ones containing the person's
 * own name, email or organisation (`personal`: those values) are refused.
 */
export const getPasswordError = (password = "", confirm, personal = []) => {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (utf8Length(password) > PASSWORD_MAX_BYTES) return "Password is too long (maximum 72 bytes).";
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower) || new Set(lower).size < 4) {
    return "This password is too easy to guess. Try three random words, like “mango river lamp 42”.";
  }
  if (personalWords(personal).some((word) => lower.includes(word))) return "Don't use your name, email or organisation's name in your password.";
  if (confirm !== undefined && password !== confirm) return "Passwords do not match.";
  return "";
};

/** The part of an email address before the @ (for the password check above). */
export const emailName = (email) => (typeof email === "string" ? email.split("@")[0] : "");

// ─── Field type helpers ──────────────────────────────────────────────────────
// Each returns { value } on success or { error } on failure. `value` is the
// normalised value that gets stored. Empty optional values return { value: undefined }.

const isBlank = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

const text = ({ min = 1, max = 200 } = {}) => (v, label) => {
  if (typeof v !== "string") return { error: `${label} must be text.` };
  const value = v.trim().replace(/\s+/g, " ");
  if (value.length < min) return { error: `${label} must be at least ${min} characters.` };
  if (value.length > max) return { error: `${label} must be at most ${max} characters.` };
  return { value };
};

const multiline = ({ min = 1, max = 500 } = {}) => (v, label) => {
  if (typeof v !== "string") return { error: `${label} must be text.` };
  const value = v.trim();
  if (value.length < min) return { error: `${label} must be at least ${min} characters.` };
  if (value.length > max) return { error: `${label} must be at most ${max} characters.` };
  return { value };
};

const email = () => (v, label) => {
  const value = normalizeEmail(v);
  if (!EMAIL_PATTERN.test(value) || value.length > 254) return { error: `Enter a valid ${label.toLowerCase()}.` };
  return { value };
};

// Indian mobile/landline numbers. Stored as +91 followed by 10 digits.
const phone = () => (v, label) => {
  if (typeof v !== "string") return { error: `${label} must be text.` };
  let digits = v.replace(/[\s\-()]/g, "");
  if (digits.startsWith("+91")) digits = digits.slice(3);
  else if (digits.startsWith("0091")) digits = digits.slice(4);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (!/^[1-9]\d{9}$/.test(digits)) return { error: `${label} must be a valid 10-digit Indian phone number.` };
  return { value: `+91${digits}` };
};
/** The same phone check for other forms: (value, label) → { value } | { error }. */
export const checkIndianPhone = phone();

const pattern = (regex, message, transform = (s) => s.trim()) => (v, label) => {
  if (typeof v !== "string") return { error: `${label} must be text.` };
  const value = transform(v);
  if (!regex.test(value)) return { error: `${label} ${message}` };
  return { value };
};

// The 4th letter of a PAN says whose it is: P a person, H a Hindu undivided family; T a trust, C a
// company, A an association of persons (many societies), F a firm, and so on.
const PERSONAL_PAN_TYPES = ["P", "H"];
// Organisation types whose PAN always has one particular 4th letter.
export const PAN_TYPE_FOR_NGO_TYPE = { Trust: "T", "Section 8 Company": "C" };

/** An organisation's PAN: the usual shape, and never a person's own PAN. */
const organisationPan = () => (v, label) => {
  const result = pattern(PAN_PATTERN, "must look like AAATS1234K.", (s) => s.trim().toUpperCase())(v, label);
  if (result.error) return result;
  if (PERSONAL_PAN_TYPES.includes(result.value[3])) {
    return { error: "This is a personal PAN (its 4th letter is P or H). Enter your NGO's own PAN." };
  }
  return result;
};

const oneOf = (options) => (v, label) => {
  if (typeof v !== "string" || !options.includes(v)) return { error: `Select a valid ${label.toLowerCase()}.` };
  return { value: v };
};

const manyOf = (options, { max = options.length } = {}) => (v, label) => {
  if (!Array.isArray(v) || v.some((item) => typeof item !== "string" || !options.includes(item))) return { error: `${label} contains an invalid option.` };
  const value = [...new Set(v)];
  if (value.length > max) return { error: `${label} has too many options.` };
  return { value };
};

const integer = ({ min = 0, max = 1_000_000 } = {}) => (v, label) => {
  const n = typeof v === "number" ? v : typeof v === "string" && /^\d+$/.test(v.trim()) ? Number(v.trim()) : NaN;
  if (!Number.isInteger(n) || n < min || n > max) return { error: `${label} must be a whole number between ${min} and ${max}.` };
  return { value: n };
};

const boolean = () => (v, label) => {
  if (typeof v !== "boolean") return { error: `${label} must be true or false.` };
  return { value: v };
};

// Dates arrive as "YYYY-MM-DD" from <input type="date">.
const pastDate = ({ minYear = 1800 } = {}) => (v, label) => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return { error: `${label} must be a valid date.` };
  const date = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== v) return { error: `${label} must be a valid date.` };
  if (date.getUTCFullYear() < minYear || date.getTime() > Date.now()) return { error: `${label} cannot be in the future.` };
  return { value: v };
};

const year = () => (v, label) => {
  const result = integer({ min: 1800, max: new Date().getFullYear() })(v, label);
  return result.error ? { error: `${label} must be a year between 1800 and ${new Date().getFullYear()}.` } : result;
};

const url = () => (v, label) => {
  if (typeof v !== "string") return { error: `${label} must be text.` };
  const value = v.trim();
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol) || value.length > 300) throw new Error("bad");
  } catch {
    return { error: `${label} must be a valid http(s) link.` };
  }
  return { value };
};

const mustBeTrue = (message) => (v) => (v === true ? { value: true } : { error: message });

// ─── Registration schemas ────────────────────────────────────────────────────
// `step` = index of the form step that shows the field (used to jump back to it).
// `profile: false` = validated but not stored on the role profile.

// `passwordStep` differs from `step` on the donor form (password has its own step).
const accountFields = (step, { nameField = "name", nameLabel = "Full name", passwordStep = step } = {}) => ({
  [nameField]: { label: nameLabel, required: true, step, check: text({ min: 2, max: 120 }) },
  email: { label: "Email address", required: true, step, check: email(), profile: false },
  password: { label: "Password", required: true, step: passwordStep, profile: false, check: (v) => { const error = getPasswordError(v); return error ? { error } : { value: v }; } },
});

export const REGISTRATION_SCHEMAS = {
  donor: {
    steps: ["Personal", "Address", "Password", "Preferences", "Documents", "Review"],
    fields: {
      ...accountFields(0, { passwordStep: 2 }),
      phone: { label: "Phone number", required: true, step: 0, check: phone() },
      dob: { label: "Date of birth", required: false, step: 0, check: pastDate({ minYear: 1900 }) },
      address: { label: "Address", required: true, step: 1, check: multiline({ min: 5, max: 300 }) },
      city: { label: "City", required: true, step: 1, check: text({ min: 2, max: 80 }) },
      state: { label: "State", required: true, step: 1, check: oneOf(DONOR_STATES) },
      pin: { label: "PIN code", required: true, step: 1, check: pattern(/^[1-9]\d{5}$/, "must be a valid 6-digit PIN code.") },
      causes: { label: "Preferred causes", required: false, step: 3, check: manyOf(DONOR_CAUSES) },
      frequency: { label: "Donation frequency", required: false, step: 3, check: oneOf(DONOR_FREQUENCIES) },
      anonymous: { label: "Anonymous preference", required: false, step: 3, check: boolean() },
      agree: { label: "Terms", required: true, step: 5, profile: false, check: mustBeTrue("You must accept the Terms of Service and Privacy Policy.") },
    },
  },
  school: {
    steps: ["School Info", "Principal", "Infrastructure", "Documents", "Bank Details", "Review"],
    fields: {
      schoolName: { label: "School name", required: true, step: 0, check: text({ min: 3, max: 150 }) },
      udise: { label: "UDISE code", required: true, step: 0, check: pattern(UDISE_PATTERN, "must be exactly 11 digits.", (s) => s.replace(/\s/g, "")) },
      address: { label: "Full address", required: true, step: 0, check: multiline({ min: 5, max: 300 }) },
      district: { label: "District", required: true, step: 0, check: text({ min: 2, max: 80 }) },
      state: { label: "State", required: true, step: 0, check: oneOf(SCHOOL_STATES) },
      ...accountFields(1, { nameField: "principalName", nameLabel: "Principal name" }),
      phone: { label: "Phone number", required: true, step: 1, check: phone() },
      students: { label: "Total students", required: false, step: 1, check: integer({ min: 0, max: 100000 }) },
      teachers: { label: "Total teachers", required: false, step: 1, check: integer({ min: 0, max: 10000 }) },
      hasToilets: { label: "Functional toilets", required: false, step: 2, check: boolean() },
      hasLibrary: { label: "Library", required: false, step: 2, check: boolean() },
      hasComputers: { label: "Computer lab", required: false, step: 2, check: boolean() },
      hasDrinkingWater: { label: "Drinking water", required: false, step: 2, check: boolean() },
      bankAccount: { label: "Bank account number", required: true, step: 4, check: pattern(/^\d{9,18}$/, "must be 9 to 18 digits.", (s) => s.replace(/\s/g, "")) },
      // Typed twice: a mistake here would send an NGO's money to someone else's account.
      confirmBankAccount: { label: "Confirm bank account number", required: true, step: 4, profile: false, check: pattern(/^\d{9,18}$/, "must be 9 to 18 digits.", (s) => s.replace(/\s/g, "")) },
      ifsc: { label: "IFSC code", required: true, step: 4, check: pattern(IFSC_PATTERN, "must look like SBIN0001234.", (s) => s.trim().toUpperCase()) },
      upi: { label: "UPI ID", required: false, step: 4, check: pattern(/^[\w.-]{2,256}@[a-zA-Z]{2,64}$/, "must look like name@bank.") },
      agree: { label: "Declaration", required: true, step: 5, profile: false, check: mustBeTrue("You must accept the declaration, Terms of Service and Privacy Policy.") },
    },
  },
  ngo: {
    steps: ["Organisation", "Mission", "Registration", "Address", "Contact", "Documents", "Review"],
    fields: {
      ngoName: { label: "NGO name", required: true, step: 0, check: text({ min: 3, max: 150 }) },
      type: { label: "Organisation type", required: false, step: 0, check: oneOf(NGO_TYPES) },
      established: { label: "Year established", required: false, step: 0, check: year() },
      website: { label: "Website", required: false, step: 0, check: url() },
      mission: { label: "Mission statement", required: true, step: 1, check: multiline({ min: 20, max: 2000 }) },
      focus: { label: "Focus areas", required: false, step: 1, check: manyOf(NGO_FOCUS_AREAS) },
      regNumber: { label: "Registration number", required: true, step: 2, check: pattern(/^[A-Za-z0-9/\- ]{3,50}$/, "may only contain letters, numbers, / and -.") },
      regDate: { label: "Registration date", required: true, step: 2, check: pastDate() },
      pan: { label: "PAN number", required: true, step: 2, check: organisationPan() },
      address: { label: "Registered address", required: true, step: 3, check: multiline({ min: 5, max: 300 }) },
      district: { label: "District", required: true, step: 3, check: text({ min: 2, max: 80 }) },
      state: { label: "State", required: true, step: 3, check: oneOf(NGO_STATES) },
      ...accountFields(4, { nameField: "contactName", nameLabel: "Primary contact name" }),
      phone: { label: "Phone number", required: true, step: 4, check: phone() },
      altPhone: { label: "Alternate phone", required: false, step: 4, check: phone() },
      agree: { label: "Declaration", required: true, step: 6, profile: false, check: mustBeTrue("You must accept the declaration, Terms of Service and Privacy Policy.") },
    },
  },
};

// Keys the frontend sends that are validated elsewhere and never stored. `emailProof` shows the email
// address was confirmed with the emailed code (checked by the server).
export const CLIENT_ONLY_FIELDS = ["confirm", "role", "emailProof"];

// The person's own details that a password must not contain.
const PERSONAL_FIELDS = { donor: ["name"], school: ["principalName", "schoolName"], ngo: ["contactName", "ngoName"] };

/**
 * Validate registration data.
 * @param {"donor"|"school"|"ngo"} role
 * @param {object} data raw form values
 * @param {{ steps?: number[] }} [options] only validate fields on these steps (frontend per-step checks)
 * @returns {{ errors: Record<string,string>, values: Record<string,unknown>, firstErrorStep: number|null }}
 */
export const validateRegistration = (role, data, { steps } = {}) => {
  const schema = REGISTRATION_SCHEMAS[role];
  const errors = {};
  const values = {};
  if (!schema) return { errors: { role: "Role must be donor, school, or ngo." }, values, firstErrorStep: 0 };
  const input = data && typeof data === "object" && !Array.isArray(data) ? data : {};

  for (const [name, rule] of Object.entries(schema.fields)) {
    if (steps && !steps.includes(rule.step)) continue;
    const raw = input[name];
    if (isBlank(raw) || (Array.isArray(raw) && raw.length === 0 && !rule.required)) {
      if (rule.required) errors[name] = name === "agree" ? rule.check(raw).error : `${rule.label} is required.`;
      continue;
    }
    const result = rule.check(raw, rule.label);
    if (result.error) errors[name] = result.error;
    else values[name] = result.value;
  }

  // Confirm password lives on the same step as the password, and the password mustn't contain the
  // person's own details (from any step).
  const passwordStep = schema.fields.password.step;
  const onStep = (field) => !steps || steps.includes(schema.fields[field].step);
  if (onStep("password") && !errors.password && typeof input.password === "string") {
    const personal = [emailName(input.email), ...PERSONAL_FIELDS[role].map((field) => input[field])];
    const passwordError = getPasswordError(input.password, undefined, personal);
    if (passwordError) {
      delete values.password;
      errors.password = passwordError;
    }
  }
  if (onStep("password") && !errors.password && input.confirm !== input.password) {
    errors.confirm = "Passwords do not match.";
  }
  // Both bank account numbers must be the same.
  if (role === "school" && onStep("confirmBankAccount") && values.bankAccount && values.confirmBankAccount && values.bankAccount !== values.confirmBankAccount) {
    delete values.confirmBankAccount;
    errors.confirmBankAccount = "The two account numbers don't match. Check both against your passbook.";
  }
  // A trust's PAN has T as its 4th letter, a company's C (the organisation type is on another step).
  const panLetter = PAN_TYPE_FOR_NGO_TYPE[input.type];
  if (role === "ngo" && onStep("pan") && values.pan && panLetter && values.pan[3] !== panLetter) {
    delete values.pan;
    errors.pan = `A ${input.type === "Trust" ? "trust" : "company"}'s PAN has ${panLetter} as its 4th letter. Check the PAN, or the organisation type on the first step.`;
  }

  const errorSteps = Object.keys(errors).map((k) => (k === "confirm" ? passwordStep : schema.fields[k]?.step ?? 0));
  return { errors, values, firstErrorStep: errorSteps.length ? Math.min(...errorSteps) : null };
};

/** Keys in `data` that are not allowed for this role (mass-assignment protection). */
export const getUnexpectedFields = (role, data) => {
  const schema = REGISTRATION_SCHEMAS[role];
  if (!schema || !data || typeof data !== "object") return [];
  const allowed = new Set([...Object.keys(schema.fields), ...CLIENT_ONLY_FIELDS]);
  return Object.keys(data).filter((key) => !allowed.has(key));
};

/** Profile-only values (drops email/password/agree) ready to be stored. */
export const pickProfileValues = (role, values) => {
  const schema = REGISTRATION_SCHEMAS[role];
  return Object.fromEntries(Object.entries(values).filter(([name]) => schema.fields[name]?.profile !== false));
};

/** The display name stored on the User record for each role. */
export const getAccountName = (role, values) => ({ donor: values.name, school: values.principalName, ngo: values.contactName }[role]);

// ─── Editing a school profile after registration ─────────────────────────────
// What a school may change itself. Its identity (name, UDISE, district, state, email) and bank
// details were verified when the admin approved it, so they stay locked.
export const SCHOOL_PROFILE_EDITABLE = ["principalName", "phone", "address", "students", "teachers", "hasToilets", "hasLibrary", "hasComputers", "hasDrinkingWater"];
export const SCHOOL_FACILITY_FIELDS = ["hasToilets", "hasLibrary", "hasComputers", "hasDrinkingWater"];

// What an NGO may change itself: how to reach it and what it does. Its identity (name, type,
// registration number and date, PAN, district, state, email) was verified by the admin, so it stays locked.
export const NGO_PROFILE_EDITABLE = ["contactName", "phone", "altPhone", "website", "mission", "focus", "address"];
// What a donor may change: contact details and preferences. Name, email, date of birth and PAN stay locked.
export const DONOR_PROFILE_EDITABLE = ["phone", "address", "city", "state", "pin", "causes", "frequency", "anonymous"];
export const PROFILE_EDITABLE = { school: SCHOOL_PROFILE_EDITABLE, ngo: NGO_PROFILE_EDITABLE, donor: DONOR_PROFILE_EDITABLE };

/**
 * Validate an account's own profile edit (only the fields sent), with the registration rules.
 * @returns {{ errors: Record<string,string>, values: Record<string,unknown>, cleared: string[] }}
 *   `cleared` = optional fields sent empty, to be removed.
 */
export const validateProfileUpdate = (role, data) => {
  const input = data && typeof data === "object" && !Array.isArray(data) ? data : {};
  const fields = REGISTRATION_SCHEMAS[role].fields;
  const editable = PROFILE_EDITABLE[role];
  const errors = {};
  const values = {};
  const cleared = [];

  for (const key of Object.keys(input)) {
    if (!editable.includes(key)) errors[key] = "This field can't be changed here.";
  }
  for (const name of editable) {
    if (!(name in input)) continue;
    const rule = fields[name];
    if (isBlank(input[name])) {
      if (rule.required) errors[name] = `${rule.label} is required.`;
      else cleared.push(name);
      continue;
    }
    const result = rule.check(input[name], rule.label);
    if (result.error) errors[name] = result.error;
    else values[name] = result.value;
  }
  return { errors, values, cleared };
};

/** A school's profile edit (see validateProfileUpdate). */
export const validateSchoolProfileUpdate = (data) => validateProfileUpdate("school", data);

// ─── Uploads ─────────────────────────────────────────────────────────────────
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // matches "max 5MB" in the existing UI
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const DOCUMENT_TYPES = [...IMAGE_TYPES, "application/pdf"];

// `field` is the multipart field name; `profilePath` is where the file id is stored on the profile.
export const UPLOAD_RULES = {
  school: {
    schoolCertificate: { label: "School Registration Certificate", hint: "PDF or Image", types: DOCUMENT_TYPES, required: true, profilePath: "documents.registrationCertificate", step: 3 },
    principalIdProof: { label: "Principal ID Proof", hint: "Govt photo ID; if Aadhaar, mask the first 8 digits", types: DOCUMENT_TYPES, required: true, profilePath: "documents.principalIdProof", step: 3 },
    schoolPhoto: { label: "School Photograph", hint: "JPG/PNG/WebP, max 5MB", types: IMAGE_TYPES, required: false, profilePath: "photo", step: 3 },
  },
  ngo: {
    registrationCertificate: { label: "Registration Certificate", hint: "PDF or Image, max 5MB", types: DOCUMENT_TYPES, required: true, profilePath: "documents.registrationCertificate", step: 5 },
    certificate12A80G: { label: "12A / 80G Certificate", hint: "PDF or Image, max 5MB", types: DOCUMENT_TYPES, required: false, profilePath: "documents.certificate12A80G", step: 5 },
    annualReport: { label: "Annual Report (Last Year)", hint: "PDF or Image, max 5MB", types: DOCUMENT_TYPES, required: false, profilePath: "documents.annualReport", step: 5 },
    panCard: { label: "PAN Card", hint: "PDF or Image, max 5MB", types: DOCUMENT_TYPES, required: true, profilePath: "documents.panCard", step: 5 },
  },
  donor: {
    // Identity check: an admin looks at it before the account is activated.
    panCard: { label: "PAN Card", hint: "PDF or photo, max 5MB", types: DOCUMENT_TYPES, required: true, profilePath: "documents.panCard", step: 4 },
  },
};

const TYPE_LABELS = { "image/jpeg": "JPG", "image/png": "PNG", "image/webp": "WebP", "application/pdf": "PDF" };
export const describeTypes = (types) => types.map((t) => TYPE_LABELS[t] || t).join(", ");

/**
 * Check one file's declared type and size. The server additionally checks the
 * real file signature (magic bytes), which a browser cannot be trusted to do.
 */
export const getUploadError = (rule, { type, size }) => {
  if (!rule) return "This file is not expected here.";
  if (!rule.types.includes(type)) return `${rule.label} must be one of: ${describeTypes(rule.types)}.`;
  if (!Number.isFinite(size) || size <= 0) return `${rule.label} is empty.`;
  if (size > MAX_UPLOAD_BYTES) return `${rule.label} must be 5 MB or smaller.`;
  return "";
};

/** Missing required uploads for a role, given the set of provided field names. */
export const getMissingUploads = (role, providedFields, rules = UPLOAD_RULES[role] || {}) =>
  Object.entries(rules).filter(([field, rule]) => rule.required && !providedFields.includes(field)).map(([field, rule]) => ({ field, message: `${rule.label} is required.`, step: rule.step }));
