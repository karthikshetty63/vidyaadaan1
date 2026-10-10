import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { countNotifications, listNotifications, markNotificationsSeen } from "../api/notifications";
import { useAuth } from "../context/AuthContext";

/** Both ask the server again this often while the tab is visible. Periodic refreshing, not a live connection. */
const REFRESH_MS = 60 * 1000;
// Sent on `window` when the Notifications page has marked its list as seen, so the bell asks again.
const CHANGED = "vidyadaan:notifications-changed";

const isVisible = () => typeof document === "undefined" || document.visibilityState !== "hidden";

const NO_COUNTS = { unread: 0, waiting: 0 };
// Each account's last numbers. Every page puts up its own top bar: starting from these, the bell
// doesn't blink back to empty while the new page asks the server again.
const lastCounts = new Map();

/** Runs `load` every minute while the tab is visible, and as soon as a hidden tab is shown again. */
const useKeepFresh = (load, enabled = true) => {
  useEffect(() => {
    if (!enabled) return undefined;
    const whenVisible = () => {
      if (isVisible()) load();
    };
    const timer = setInterval(whenVisible, REFRESH_MS);
    document.addEventListener("visibilitychange", whenVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", whenVisible);
    };
  }, [load, enabled]);
};

/**
 * The numbers for the bell: `unread` (new since the account last opened Notifications) and `waiting`
 * (things that need its action). Asked again on every page or view change. A failed request keeps the
 * last numbers: the bell never shows an error.
 */
export const useNotificationCount = (enabled = true) => {
  const { user } = useAuth();
  const account = user?.email || "";
  const { pathname, hash } = useLocation();
  const [result, setResult] = useState(() => ({ account, counts: lastCounts.get(account) || NO_COUNTS }));
  const latest = useRef(0);

  const load = useCallback(() => {
    const id = (latest.current += 1);
    countNotifications().then(
      (data) => {
        if (id !== latest.current) return;
        const counts = { unread: data.unread || 0, waiting: data.waiting || 0 };
        lastCounts.set(account, counts);
        setResult({ account, counts });
      },
      () => {}
    );
  }, [account]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load, pathname, hash]);
  useKeepFresh(load, enabled);
  useEffect(() => {
    if (!enabled) return undefined;
    window.addEventListener(CHANGED, load);
    return () => window.removeEventListener(CHANGED, load);
  }, [enabled, load]);

  return result.account === account ? result.counts : NO_COUNTS;
};

/**
 * The Notifications page: what needs the account's action, and the news. Showing the list marks it as
 * seen (which clears the number on the bell), but whatever was new during this visit stays marked
 * “New” on the page until it is left.
 */
const useNotifications = () => {
  const [result, setResult] = useState({ data: null, error: "" });
  const [fresh, setFresh] = useState(() => new Set());
  const latest = useRef(0);

  const load = useCallback(() => {
    const id = (latest.current += 1);
    return listNotifications().then(
      (data) => {
        if (id !== latest.current) return;
        setResult({ data, error: "" });
        const newIds = [...data.actions, ...data.news].filter((item) => item.isNew).map((item) => item.id);
        if (newIds.length) setFresh((known) => new Set([...known, ...newIds]));
        // Only a list someone could actually see counts as seen.
        if (data.unread > 0 && isVisible()) {
          markNotificationsSeen(data.asOf).then(
            () => window.dispatchEvent(new Event(CHANGED)),
            () => {}
          );
        }
      },
      (error) => {
        if (id === latest.current) setResult((r) => ({ data: r.data, error: error.message || "Couldn't load your notifications." }));
      }
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useKeepFresh(load);

  const { data, error } = result;
  return {
    actions: data?.actions || [],
    news: data?.news || [],
    isNew: (item) => fresh.has(item.id),
    loading: !data && !error,
    error,
    reload: load,
  };
};

export default useNotifications;
