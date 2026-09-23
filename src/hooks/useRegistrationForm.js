import { useEffect, useRef, useState } from "react";
import { registerAccount } from "../api/auth";
import {
  REGISTRATION_SCHEMAS,
  UPLOAD_RULES,
  getMissingUploads,
  getUploadError,
  validateRegistration,
} from "../../shared/registrationRules.js";

// Never kept in the browser draft: secrets, bank details, consent.
const NEVER_SAVED = ["password", "confirm", "bankAccount", "ifsc", "upi", "agree"];

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
 * Validation rules come from shared/registrationRules.js — the same module the server uses.
 */
const useRegistrationForm = (role, initialForm) => {
  const schema = REGISTRATION_SCHEMAS[role];
  const uploadRules = UPLOAD_RULES[role];
  const reviewStep = schema.steps.length - 1;
  const successStep = schema.steps.length;

  const [form, setForm] = useState(() => ({ ...initialForm, ...readDraft(role, initialForm) }));
  const [files, setFiles] = useState({});
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key] || (key === "password" && errors.confirm)) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        if (key === "password") delete next.confirm;
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

  const stepOf = (field) => (field === "confirm" ? schema.fields.password.step : schema.fields[field]?.step ?? uploadRules[field]?.step ?? 0);

  const handleContinue = () => {
    const stepErrors = validateSteps([step]);
    if (Object.keys(stepErrors).length) return showErrors(stepErrors);
    clearErrors();
    setStep((s) => Math.min(s + 1, reviewStep));
  };

  const prev = () => {
    clearErrors();
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (submitting.current) return; // ignore double clicks
    const allSteps = schema.steps.map((_, i) => i);
    const allErrors = validateSteps(allSteps);
    if (Object.keys(allErrors).length) {
      setStep(Math.min(...Object.keys(allErrors).map(stepOf)));
      return showErrors(allErrors);
    }

    submitting.current = true;
    setLoading(true);
    clearErrors();
    try {
      await registerAccount(role, form, files);
      clearDraft(role);
      setStep(successStep);
    } catch (err) {
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

  return {
    form,
    set,
    files,
    setFile,
    step,
    errors,
    messages,
    loading,
    reviewStep,
    successStep,
    handleContinue,
    handleSubmit,
    prev,
    uploadRules,
  };
};

export default useRegistrationForm;
