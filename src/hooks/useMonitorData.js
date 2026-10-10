import { useCallback, useEffect, useRef, useState } from "react";
import { getMonitor } from "../api/monitor";

/** The Control Tower asks the server again this often while the page is open and visible. */
export const REFRESH_SECONDS = 30;
// No successful answer for this long: the page says its figures may be out of date.
const STALE_AFTER_MS = (REFRESH_SECONDS * 2 + 10) * 1000;

const isVisible = () => typeof document === "undefined" || document.visibilityState !== "hidden";

/**
 * One monitoring endpoint, refreshed every REFRESH_SECONDS while the tab is visible (paused while it's
 * hidden, refreshed as soon as it's shown again). This is periodic refreshing, not a live connection.
 * A failed refresh keeps the last good data on screen and says so.
 */
const useMonitorData = (path, params = {}) => {
  const paramsKey = JSON.stringify(params);
  const key = `${path}?${paramsKey}`;
  const [result, setResult] = useState({ key: null, data: null, error: "", updatedAt: null });
  const [visible, setVisible] = useState(isVisible);
  const [clock, setClock] = useState(() => Date.now());
  const [manual, setManual] = useState(false);
  const latest = useRef(0);

  const fetchNow = useCallback(() => {
    const id = (latest.current += 1);
    return getMonitor(path, JSON.parse(paramsKey)).then(
      (data) => {
        if (id === latest.current) setResult({ key, data, error: "", updatedAt: Date.now() });
      },
      (error) => {
        if (id !== latest.current) return;
        setResult((r) => ({ key, data: r.key === key ? r.data : null, updatedAt: r.key === key ? r.updatedAt : null, error: error.message || "Couldn't load this data." }));
      }
    );
  }, [path, paramsKey, key]);

  // First load, and again whenever the filters change.
  useEffect(() => {
    fetchNow();
  }, [fetchNow]);

  // Every REFRESH_SECONDS while visible.
  useEffect(() => {
    if (!visible) return undefined;
    const timer = setInterval(fetchNow, REFRESH_SECONDS * 1000);
    return () => clearInterval(timer);
  }, [visible, fetchNow]);

  // Pause in a background tab; refresh on return.
  useEffect(() => {
    const onChange = () => {
      const now = isVisible();
      setVisible(now);
      if (now) fetchNow();
    };
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, [fetchNow]);

  // Keeps "updated … ago" and the out-of-date warning current.
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 10 * 1000);
    return () => clearInterval(timer);
  }, []);

  /** The Refresh button: asks now and shows that it's asking. */
  const refresh = useCallback(() => {
    setManual(true);
    fetchNow().finally(() => setManual(false));
  }, [fetchNow]);

  const current = result.key === key;
  const data = current ? result.data : null;
  const error = current ? result.error : "";
  const updatedAt = current ? result.updatedAt : null;
  return {
    data,
    error,
    loading: !data && !error,
    updatedAt,
    stale: Boolean(updatedAt) && clock - updatedAt > STALE_AFTER_MS,
    visible,
    refreshing: manual,
    refresh,
  };
};

export default useMonitorData;
