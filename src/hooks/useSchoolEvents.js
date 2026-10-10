import { useCallback } from "react";
import { listSchoolEvents } from "../api/events";
import useApiList from "./useApiList";

const load = () => listSchoolEvents().then((data) => data.events);

/** The signed-in school's events (newest first, with their offers), with loading and error states. */
const useSchoolEvents = () => {
  const { items: events, setItems, loading, error, reload, refresh } = useApiList(load, "Could not load your events.");

  /** Put a created or changed event into the list without reloading. */
  const upsert = useCallback(
    (event) => setItems((current) => (current.some((e) => e.id === event.id) ? current.map((e) => (e.id === event.id ? event : e)) : [event, ...current])),
    [setItems]
  );

  return { events, loading, error, reload, refresh, upsert };
};

export default useSchoolEvents;
