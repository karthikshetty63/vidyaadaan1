import { useEffect, useRef, useState } from "react";
import { confirmEmailCode, lookupIfscBranch, registerAccount, requestEmailCode } from "../api/auth";
import { LEAKED_PASSWORD_MESSAGE, pwnedPasswordCount } from "../utils/pwnedPassword";
import {
  EMAIL_CODE_PATTERN,
  IFSC_PATTERN,
  REGISTRATION_SCHEMAS,
  UPLOAD_RULES,
  getMissingUploads,
  getUploadError,
  normalizeEmail,
  validateRegistration,
} from "../../shared/registrationRules.js";

// Never kept in the browser draft: secrets, bank details, consent.
const NEVER_SAVED = ["password", "confirm", "bankAccount", "confirmBankAccount", "ifsc", "upi", "agree"];
const NO_EMAIL_CHECK = { email: "", status: "idle", proof: "", resendAt: 0, message: "" };

const draftKey = (role) => `vidyadaan:registration-draft:${role}`;

const readDraft = (role, initialForm) => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(draftKey(role)) || "null");
    if (!saved || typeof saved !== "object") return {};
    // Only restore known keys with the same type as the initial value.
    return Object.fromEntries(
      Object.entries(saved).filter(([k, v]) => k in initialForm && !NEVER_SAVED.includes(k) && typeof v === typeof initialForm[k])
    );
  } catch {
    return {};
  }
};

const clearDraft = (role) => {
  try {
    sessionStorage.removeItem(draftKey(role));
  } catch {
    /* storage unavailable — nothing to clear */
  }
};

/**
 * Shared behaviour for the Donor / School / NGO multi-step registration forms.
 * Validation rules come from shared/registrationRules.js — the same module the server uses. On top of
 * them, before moving on from a step:
 *   - the password's step checks that the password hasn't appeared in a data breach;
 *   - the email's step emails a 6-digit code and waits for it (the registration sends the proof);
 *   - the school's bank step looks up the IFSC's branch, and won't go on with an IFSC that has none.
 * The server repeats every one of these checks.
 */
const useRegistrationForm = (role, initialForm) => {
  const schema = REGISTRATION_SCHEMAS[role];
  const uploadRules = UPLOAD_RULES[role];
  const reviewStep = schema.steps.length - 1;
  const successStep = schema.steps.length;
  const emailStep = schema.fields.email.step;
  const passwordStep = schema.fields.password.step;
  const bankStep = schema.fields.ifsc?.step;

  const [form, setForm] = useState(() => ({ ...initialForm, ...readDraft(role, initialForm) }));
  const [files, setFiles] = useState({});
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  // What the step's Continue is busy with: "password", "sending", "verifying" or "".
  const [busy, setBusy] = useState("");
  const [emailCheck, setEmailCheck] = useState(NO_EMAIL_CHECK);
  const [code, setCode] = useState("");
  const [cleanPassword, setCleanPassword] = useState(""); // the last password found in no data breach
  const [ifscResult, setIfscResult] = useState({ code: "", status: "idle", branch: null });
  const submitting = useRef(false);

  // Keep a draft so a refresh doesn't lose the user's work (files and secrets are never saved).
  useEffect(() => {
    if (step >= successStep) return;
    try {
      const draft = Object.fromEntries(Object.entries(form).filter(([k]) => !NEVER_SAVED.includes(k)));
      sessionStorage.setItem(draftKey(role), JSON.stringify(draft));
    } catch {
      /* storage unavailable (private mode) — the form still works */
    }
  }, [form, role, step, successStep]);

  // The bank branch of the IFSC typed (schools), looked up a moment after typing stops.
  const ifscCode = typeof form.ifsc === "string" ? form.ifsc.trim().toUpperCase() : "";
  const ifscLooksRight = bankStep !== undefined && IFSC_PATTERN.test(ifscCode);
  useEffect(() => {
    if (!ifscLooksRight) return undefined;
    let cancelled = false;
    const timer = setTimeout(() => {
      lookupIfscBranch(ifscCode).then(
        (branch) => !cancelled && setIfscResult({ code: ifscCode, status: "found", branch }),
        (err) => !cancelled && setIfscResult({ code: ifscCode, status: err.status === 404 ? "missing" : "unknown", branch: null })
      );
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ifscCode, ifscLooksRight]);
  let ifsc = { status: "idle", branch: null };
  if (ifscLooksRight) ifsc = ifscResult.code === ifscCode ? ifscResult : { status: "checking", branch: null };

  // The email check only counts for the address it was made for.
  const currentEmail = normalizeEmail(form.email);
  const emailState = emailCheck.email === currentEmail ? emailCheck.status : "idle";

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key] || (key === "password" && errors.confirm) || (key === "email" && errors.emailCode)) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        if (key === "password") delete next.confirm;
        if (key === "email") delete next.emailCode;
        return next;
      });
    }
  };

  const setFile = (field, file) => {
    setFiles((f) => ({ ...f, [field]: file || undefined }));
    setErrors((e) => {
      const next = { ...e };
      delete next[field];
      return next;
    });
  };

  const showErrors = (errs) => {
    setErrors(errs);
    setMessages(Object.values(errs));
  };

  const clearErrors = () => {
    setErrors({});
    setMessages([]);
  };

  const validateSteps = (steps) => {
    const { errors: fieldErrors } = validateRegistration(role, form, { steps });
    const all = { ...fieldErrors };
    for (const [field, file] of Object.entries(files)) {
      if (!file || !steps.includes(uploadRules[field]?.step)) continue;
      const uploadError = getUploadError(uploadRules[field], file);
      if (uploadError) all[field] = uploadError;
    }
    for (const missing of getMissingUploads(role, Object.keys(files).filter((f) => files[f]), uploadRules)) {
      if (steps.includes(missing.step)) all[missing.field] = missing.message;
    }
    return all;
  };

  const stepOf = (field) => {
    if (field === "confirm") return passwordStep;
    if (field === "emailCode") return emailStep;
    return schema.fields[field]?.step ?? uploadRules[field]?.step ?? 0;
  };

  const advance = () => {
    clearErrors();
    setStep((s) => Math.min(s + 1, reviewStep));
  };

  /** Emails a code to the address on the form (also "Send a new code"). */
  const sendCode = async () => {
    const email = currentEmail;
    setBusy("sending");
    clearErrors();
    setCode("");
    try {
      const data = await requestEmailCode(email, role);
      setEmailCheck({ email, status: "sent", proof: "", resendAt: Date.now() + data.resendAfterSeconds * 1000, message: data.message });
    } catch (err) {
      if (err.status === 429 && err.code === "WAIT") {
        // A code was sent a moment ago (it still works), or too many were: either way, wait.
        setEmailCheck({ email, status: "sent", proof: "", resendAt: Date.now() + (err.retryAfterSeconds || 60) * 1000, message: err.message });
      } else {
        showErrors(err.errors && Object.keys(err.errors).length ? err.errors : { email: err.message || "We couldn't send the code. Please try again." });
      }
    } finally {
      setBusy("");
    }
  };

  const verifyCode = async () => {
    const typed = code.replace(/\s/g, "");
    if (!EMAIL_CODE_PATTERN.test(typed)) return showErrors({ emailCode: "Enter the 6-digit code from the email." });
    setBusy("verifying");
    try {
      const data = await confirmEmailCode(emailCheck.email, typed);
      setEmailCheck((c) => ({ ...c, status: "verified", proof: data.emailProof, message: "" }));
      advance();
    } catch (err) {
      showErrors(err.errors && Object.keys(err.errors).length ? err.errors : { emailCode: err.message || "We couldn't check the code. Please try again." });
    } finally {
      setBusy("");
    }
    return undefined;
  };

  const handleContinue = async () => {
    if (busy) return undefined;
    const stepErrors = validateSteps([step]);
    if (Object.keys(stepErrors).length) return showErrors(stepErrors);

    if (step === passwordStep && form.password !== cleanPassword) {
      setBusy("password");
      const leaks = await pwnedPasswordCount(form.password);
      setBusy("");
      if (leaks > 0) return showErrors({ password: LEAKED_PASSWORD_MESSAGE });
      setCleanPassword(form.password);
    }
    if (step === emailStep && emailState !== "verified") return emailState === "sent" ? verifyCode() : sendCode();
    if (step === bankStep && ifsc.status === "missing") {
      return showErrors({ ifsc: "No bank branch has this IFSC code. Check it on your passbook or cheque book." });
    }
    return advance();
  };

  const prev = () => {
    clearErrors();
    setStep((s) => Math.max(s - 1, 0));
  };

  // Back to an earlier step (from the step list). Never forward: each step is checked on the way.
  const goTo = (target) => {
    if (!Number.isInteger(target) || target < 0 || target >= step) return;
    clearErrors();
    setStep(target);
  };

  const handleSubmit = async () => {
    if (submitting.current) return; // ignore double clicks
    const allSteps = schema.steps.map((_, i) => i);
    const allErrors = validateSteps(allSteps);
    if (emailState !== "verified") allErrors.email = "Confirm your email address with the code we email you.";
    if (Object.keys(allErrors).length) {
      setStep(Math.min(...Object.keys(allErrors).map(stepOf)));
      return showErrors(allErrors);
    }

    submitting.current = true;
    setLoading(true);
    clearErrors();
    try {
      await registerAccount(role, { ...form, emailProof: emailCheck.proof }, files);
      clearDraft(role);
      setStep(successStep);
    } catch (err) {
      // The proof expired (or was for another address): the email has to be confirmed again.
      if (err.code === "EMAIL_NOT_VERIFIED") setEmailCheck(NO_EMAIL_CHECK);
      if (err.errors && Object.keys(err.errors).length) {
        const firstStep = Number.isInteger(err.step) ? err.step : Math.min(...Object.keys(err.errors).map(stepOf));
        setStep(Math.min(firstStep, reviewStep));
        setErrors(err.errors);
        setMessages(Object.values(err.errors));
      } else {
        setMessages([err.message || "Registration failed. Please try again."]);
      }
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  // What the Continue button says while it works, or what it will do.
  let continueLabel = "Continue";
  if (busy === "password") continueLabel = "Checking password…";
  else if (busy === "sending") continueLabel = "Sending code…";
  else if (busy === "verifying") continueLabel = "Checking code…";
  else if (step === emailStep && emailState === "sent") continueLabel = "Verify and continue";

  return {
    form,
    set,
    files,
    setFile,
    step,
    errors,
    messages,
    loading,
    working: loading || Boolean(busy),
    continueLabel,
    reviewStep,
    successStep,
    handleContinue,
    handleSubmit,
    prev,
    goTo,
    uploadRules,
    ifsc,
    // For the email step's code box (EmailCodeBox).
    emailCode: {
      status: emailState,
      email: emailCheck.email,
      message: emailCheck.message,
      resendAt: emailCheck.resendAt,
      code,
      setCode: (value) => {
        setCode(value.replace(/[^\d]/g, "").slice(0, 6));
        if (errors.emailCode) {
          setErrors((e) => {
            const next = { ...e };
            delete next.emailCode;
            return next;
          });
        }
      },
      error: errors.emailCode,
      busy: busy === "sending" || busy === "verifying",
      resend: sendCode,
      verify: handleContinue,
      useAnotherEmail: () => {
        setEmailCheck(NO_EMAIL_CHECK);
        setCode("");
        clearErrors();
      },
    },
  };
};

export default useRegistrationForm;
