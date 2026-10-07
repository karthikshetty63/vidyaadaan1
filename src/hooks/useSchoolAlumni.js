import { useCallback, useEffect, useState } from "react";
import { getAlumniSummary, listAlumni } from "../api/alumni";

const fetchAlumni = () =>
  listAlumni().then(
    (data) => ({ alumni: data.alumni, error: "" }),
    (loadError) => ({ alumni: null, error: loadError.message || "Could not load your alumni." })
  );

/** The signed-in school's alumni from the server, with loading and error states. */
const useSchoolAlumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apply = useCallback((result) => {
    if (result.alumni) setAlumni(result.alumni);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    fetchAlumni().then((result) => active && apply(result));
    return () => {
      active = false;
    };
  }, [apply]);

  /** Load again (the "Try again" button). */
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    apply(await fetchAlumni());
  }, [apply]);

  /** Put an added or edited alum into the list without reloading: new ones first, edits in place. */
  const upsert = useCallback((alum) => {
    setAlumni((current) => (current.some((a) => a.id === alum.id) ? current.map((a) => (a.id === alum.id ? alum : a)) : [alum, ...current]));
  }, []);

  return { alumni, loading, error, reload, upsert };
};

/** Just the counts ({ active, inactive }), for the dashboard. Null until loaded or if loading failed. */
export const useAlumniSummary = () => {
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    let active = true;
    getAlumniSummary().then(
      (data) => active && setSummary(data),
      () => active && setSummary(null)
    );
    return () => {
      active = false;
    };
  }, []);
  return summary;
};

export default useSchoolAlumni;
