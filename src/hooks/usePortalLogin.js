import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Login behaviour shared by the School / NGO / Donor / Admin login pages.
 * The portal role is sent to the server, which refuses (without creating a session)
 * if the account belongs to a different role, is pending, or is rejected.
 */
const usePortalLogin = (role) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [correctPortal, setCorrectPortal] = useState(null);
  const submitting = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setError("");
    setCorrectPortal(null);
    setLoading(true);
    try {
      await login({ ...form, role });
      // Return to the protected page the user originally asked for, if it belongs to this portal.
      const from = location.state?.from?.pathname;
      navigate(from && from.startsWith(`/dashboard/${role}`) ? from : `/dashboard/${role}`, { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in. Please try again.");
      if (loginError.code === "WRONG_PORTAL" && ["school", "ngo", "donor", "admin"].includes(loginError.role)) {
        setCorrectPortal(loginError.role);
      }
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return { form, setForm, loading, error, correctPortal, handleSubmit };
};

export default usePortalLogin;
