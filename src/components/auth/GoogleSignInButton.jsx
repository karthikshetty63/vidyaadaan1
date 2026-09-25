import { useRef } from "react";
import useGoogleButton from "../../hooks/useGoogleButton";

/**
 * Google's official Sign in with Google button (Google requires its own button design).
 * Renders nothing when Google sign-in isn't configured (no VITE_GOOGLE_CLIENT_ID).
 * text: "continue_with" | "signin_with" | "signup_with"
 */
const GoogleSignInButton = ({ text, onCredential, busy = false }) => {
  const containerRef = useRef(null);
  const status = useGoogleButton(containerRef, { text, onCredential });
  if (status === "disabled") return null;

  return (
    <div>
      {/* Reserves the button's height so the page doesn't jump when Google's button appears. */}
      <div
        ref={containerRef}
        className={`flex justify-center min-h-10 transition-opacity ${busy ? "pointer-events-none opacity-60" : ""}`}
        aria-busy={status === "loading" || busy || undefined}
      />
      {status === "error" && (
        <p className="mt-2 text-center text-xs text-slate-500">Google sign-in couldn&apos;t load. Check your connection, or use your email and password.</p>
      )}
      {busy && <p role="status" className="mt-2 text-center text-xs text-slate-500">Signing you in with Google…</p>}
    </div>
  );
};

export default GoogleSignInButton;
