import { useCallback, useEffect, useState } from "react";
import { getMyProfile } from "../api/profile";

/**
 * The logged-in user's registration profile from GET /api/profile/me.
 * `setProfile` lets a page update it locally after a successful change (e.g. new photo).
 */
const useMyProfile = () => {
  const [state, setState] = useState({ profile: null, loading: true, error: "" });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((res) => !cancelled && setState({ profile: res.profile, loading: false, error: "" }))
      .catch((err) => !cancelled && setState({ profile: null, loading: false, error: err.message }));
    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  const setProfile = useCallback((update) => {
    setState((s) => ({ ...s, profile: typeof update === "function" ? update(s.profile) : update }));
  }, []);

  const reload = useCallback(() => setReloadCount((n) => n + 1), []);

  return { ...state, setProfile, reload };
};

/**
 * Merge a real school profile into the display shape the existing school pages use
 * (INITIAL_SCHOOL_PROFILE). Fields not collected at registration keep their existing values.
 */
export const toSchoolDisplayProfile = (apiProfile, fallback) => {
  if (!apiProfile) return fallback;
  return {
    ...fallback,
    name: apiProfile.schoolName || fallback.name,
    udise: apiProfile.udise || fallback.udise,
    district: [apiProfile.district, apiProfile.state].filter(Boolean).join(", ") || fallback.district,
    studentsCount: apiProfile.students ?? "—",
    teachersCount: apiProfile.teachers ?? "—",
    principalName: apiProfile.principalName || fallback.principalName,
    phone: apiProfile.phone || fallback.phone,
    email: apiProfile.email || fallback.email,
    location: apiProfile.address || fallback.location,
    photo: apiProfile.photo || null,
  };
};

export default useMyProfile;
