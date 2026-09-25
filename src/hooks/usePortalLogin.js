import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// "Remember me" also keeps what was typed in the email / UDISE box on this device, per portal.
// Never the password. Storage can be unavailable (private mode), so every access is guarded.
const rememberedKey = (role) => `vidyadaan:remembered-login:${role}`;
const readRemembered = (role) => {
  try {
    return localStorage.getItem(rememberedKey(role)) || "";
  } catch {
    return "";
  }
};
const writeRemembered = (role, identifier) => {
  try {
    if (identifier) localStorage.setItem(rememberedKey(role), identifier);
    else localStorage.removeItem(rememberedKey(role));
  } catch {
    /* storage unavailable: nothing to remember */
  }
};

/**
 * Login behaviour shared by the School / NGO / Donor / Admin login pages (and the donor
 * "Sign up with Google" button). The portal role is sent to the server, which refuses (without
 * creating a session) if the account belongs to a different role, is pending, or is rejected.
 */
const usePortalLogin = (role) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [form, setForm] = useState(() => {
    const remembered = readRemembered(role);
    return { email: remembered, password: "", remember: Boolean(remembered) };
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [correctPortal, setCorrectPortal] = useState(null);
  const submitting = useRef(false);

  // Password and Google sign-in share one flow: one attempt at a time, the same errors, the same destination.
  const attempt = async (setBusy, signIn) => {
    if (submitting.current) return;
    submitting.current = true;
    setError("");
    setCorrectPortal(null);
    setBusy(true);
    try {
      const result = await signIn();
      // Ticked: keep what they typed (or, after Google, their account email). Unticked: forget it.
      writeRemembered(role, form.remember ? form.email.trim() || result?.user?.email || result?.email || "" : "");
      // Return to the protected page the user originally asked for, if it belongs to this portal.
      const from = location.state?.from?.pathname;
      navigate(from && from.startsWith(`/dashboard/${role}`) ? from : `/dashboard/${role}`, {
        replace: true,
        // The dashboard explains once that linking Google removed the old password.
        state: result?.linked ? { notice: "google-linked" } : undefined,
      });
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in. Please try again.");
      if (loginError.code === "WRONG_PORTAL" && ["school", "ngo", "donor", "admin"].includes(loginError.role)) {
        setCorrectPortal(loginError.role);
      }
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    return attempt(setLoading, () => login({ ...form, role }));
  };

  const handleGoogleCredential = (credential) =>
    attempt(setGoogleLoading, () => loginWithGoogle({ credential, role, remember: form.remember }));

  return { form, setForm, loading, googleLoading, error, correctPortal, handleSubmit, handleGoogleCredential };
};

export default usePortalLogin;
