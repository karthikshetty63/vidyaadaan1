import { useEffect, useRef, useState } from "react";

// Sign in with Google (Google Identity Services). The Client ID is public, not a secret;
// without a valid one the Google button simply isn't shown.
const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
export const GOOGLE_SIGN_IN_ENABLED = /^[\w.-]+\.apps\.googleusercontent\.com$/.test(CLIENT_ID);

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptPromise;
let initialized = false;
// Google's script accepts one callback per page; it forwards to whichever button is on screen.
let activeHandler = null;

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  scriptPromise ||= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.google?.accounts?.id ? resolve(window.google.accounts.id) : reject(new Error("unavailable")));
    script.onerror = () => {
      scriptPromise = undefined; // try again next time a button mounts
      script.remove();
      reject(new Error("unavailable"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
};

/**
 * Draws Google's official button inside `containerRef` and calls `onCredential(idToken)` once the
 * person picks their Google account. Returns "disabled" | "loading" | "ready" | "error".
 */
const useGoogleButton = (containerRef, { text = "continue_with", onCredential }) => {
  const [status, setStatus] = useState(GOOGLE_SIGN_IN_ENABLED ? "loading" : "disabled");
  const handlerRef = useRef(onCredential);

  useEffect(() => {
    handlerRef.current = onCredential;
  });

  useEffect(() => {
    if (!GOOGLE_SIGN_IN_ENABLED) return undefined;
    let cancelled = false;
    loadGoogleScript()
      .then((googleId) => {
        const container = containerRef.current;
        if (cancelled || !container) return;
        if (!initialized) {
          googleId.initialize({
            client_id: CLIENT_ID,
            callback: (response) => activeHandler?.(response.credential),
            ux_mode: "popup",
            auto_select: false,
          });
          initialized = true;
        }
        activeHandler = (credential) => handlerRef.current?.(credential);
        container.replaceChildren();
        googleId.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          logo_alignment: "center",
          // Google's button takes a fixed width (200–400px); match the form column.
          width: Math.min(400, Math.max(200, Math.floor(container.offsetWidth))),
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [containerRef, text]);

  return status;
};

export default useGoogleButton;
