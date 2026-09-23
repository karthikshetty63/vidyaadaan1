// The same rules module is imported by the React forms and the server.
// These tests pin down the behaviour both sides rely on.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
    REGISTRATION_SCHEMAS,
    UPLOAD_RULES,
    getPasswordError,
    getUnexpectedFields,
    getUploadError,
    validateRegistration,
} from "../../shared/registrationRules.js";

describe("password rule", () => {
    test("min 8 characters, max 72 bytes, confirm must match", () => {
        assert.match(getPasswordError("1234567"), /at least 8/);
        assert.equal(getPasswordError("12345678"), "");
        assert.equal(getPasswordError("a".repeat(72)), "");
        assert.match(getPasswordError("a".repeat(73)), /too long/);
        assert.match(getPasswordError("€".repeat(25)), /too long/, "25 × 3-byte chars = 75 bytes");
        assert.equal(getPasswordError("Str0ng-pass", "Str0ng-pass"), "");
        assert.equal(getPasswordError("Str0ng-pass", "different1"), "Passwords do not match.");
        assert.match(getPasswordError(undefined), /at least 8/);
    });
});

describe("per-step validation used by the forms", () => {
    test("only fields on the requested step are checked", () => {
        const { errors } = validateRegistration("school", {}, { steps: [0] });
        assert.deepEqual(Object.keys(errors).sort(), ["address", "district", "schoolName", "state", "udise"]);
    });

    test("password step includes confirm-password", () => {
        const { errors } = validateRegistration("ngo", { password: "Str0ng-pass-8", confirm: "nope" }, { steps: [4] });
        assert.equal(errors.confirm, "Passwords do not match.");
    });

    test("firstErrorStep points to the earliest step with a problem", () => {
        const { firstErrorStep } = validateRegistration("donor", { name: "Ann Lee" });
        assert.equal(firstErrorStep, 0);
    });

    test("fields sit on the same step the form shows them (regression: donor password is on step 3 of the UI)", () => {
        assert.equal(REGISTRATION_SCHEMAS.donor.fields.password.step, 2, "donor: Personal, Address, *Password*");
        assert.equal(REGISTRATION_SCHEMAS.donor.fields.email.step, 0);
        assert.equal(REGISTRATION_SCHEMAS.school.fields.password.step, 1, "school: password on Principal step");
        assert.equal(REGISTRATION_SCHEMAS.ngo.fields.password.step, 4, "ngo: password on Contact step");
        // Completing the donor's first step must not demand a password.
        const firstStep = validateRegistration("donor", { name: "Ann Lee", email: "ann@example.com", phone: "9876543210" }, { steps: [0] });
        assert.deepEqual(firstStep.errors, {});
    });

    test("every schema field has a label, a step and a check", () => {
        for (const [role, schema] of Object.entries(REGISTRATION_SCHEMAS)) {
            for (const [name, rule] of Object.entries(schema.fields)) {
                assert.ok(rule.label && Number.isInteger(rule.step) && typeof rule.check === "function", `${role}.${name}`);
                assert.ok(rule.step < schema.steps.length, `${role}.${name} step in range`);
            }
        }
    });
});

describe("normalisation", () => {
    test("phone numbers are stored as +91XXXXXXXXXX", () => {
        for (const input of ["9876543210", "+91 98765 43210", "098765-43210", "0091 9876543210"]) {
            const { values, errors } = validateRegistration("donor", { phone: input }, { steps: [0] });
            assert.equal(errors.phone, undefined, input);
            assert.equal(values.phone, "+919876543210", input);
        }
        assert.ok(validateRegistration("donor", { phone: "12345" }, { steps: [0] }).errors.phone);
    });

    test("IFSC and PAN are upper-cased, UDISE spaces removed", () => {
        assert.equal(validateRegistration("school", { ifsc: "sbin0001234" }, { steps: [4] }).values.ifsc, "SBIN0001234");
        assert.equal(validateRegistration("ngo", { pan: "abcde1234f" }, { steps: [2] }).values.pan, "ABCDE1234F");
        assert.equal(validateRegistration("school", { udise: "2914 0112 801" }, { steps: [0] }).values.udise, "29140112801");
    });

    test("numbers from inputs become numbers; invalid ones error", () => {
        const ok = validateRegistration("school", { students: "438", teachers: "18" }, { steps: [1] });
        assert.equal(ok.values.students, 438);
        assert.ok(validateRegistration("school", { students: "-3" }, { steps: [1] }).errors.students);
    });
});

describe("mass assignment", () => {
    test("getUnexpectedFields flags anything not on the form", () => {
        assert.deepEqual(getUnexpectedFields("donor", { name: "a", confirm: "x", role: "donor", accountStatus: "active", $gt: 1 }), ["accountStatus", "$gt"]);
    });
});

describe("upload rules", () => {
    test("type and size checks", () => {
        const photo = UPLOAD_RULES.school.schoolPhoto;
        assert.equal(getUploadError(photo, { type: "image/png", size: 1000 }), "");
        assert.match(getUploadError(photo, { type: "application/pdf", size: 1000 }), /must be one of/);
        assert.match(getUploadError(photo, { type: "image/png", size: 6 * 1024 * 1024 }), /5 MB/);
        assert.match(getUploadError(photo, { type: "image/png", size: 0 }), /empty/);
        assert.equal(getUploadError(UPLOAD_RULES.ngo.panCard, { type: "application/pdf", size: 10 }), "");
    });
});
