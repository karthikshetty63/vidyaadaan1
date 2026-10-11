import { useLayoutEffect } from "react";

const BOX = ".ui-box";
const STAGGER_MS = 45; // between boxes that appear together
const MAX_STEPS = 10; // so a long list never keeps the last box waiting

const lessMotion = () => typeof window === "undefined" || Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/**
 * Motion for every box (.ui-box) inside `rootRef` (the CSS is under "Dashboard hover and motion" in
 * index.css):
 *  - boxes that appear together rise in one after another (--enter-delay), whether they are on the page
 *    from the start or arrive later with their data;
 *  - boxes that start below the visible area wait (data-reveal) and rise in when scrolled to;
 *  - with a mouse, the soft light inside a box follows the pointer (--mx, --my).
 * Nothing here runs for people whose device asks for less motion.
 */
const useDashboardMotion = (rootRef) => {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || lessMotion()) return undefined;
    const seen = new WeakSet();

    const reveal =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            (entries) => {
              let step = 0;
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.style.setProperty("--enter-delay", `${Math.min(step, MAX_STEPS) * STAGGER_MS}ms`);
                entry.target.removeAttribute("data-reveal");
                reveal.unobserve(entry.target);
                step += 1;
              }
            },
            { rootMargin: "0px 0px -24px 0px" }
          )
        : null;

    /** New boxes: stagger the ones in view, hold back the ones below it. */
    const arrive = (boxes) => {
      const fresh = boxes.filter((box) => !seen.has(box));
      if (!fresh.length) return;
      // Read every position first, then write: one layout pass, however many boxes.
      const fold = window.innerHeight;
      const tops = fresh.map((box) => box.getBoundingClientRect().top);
      let step = 0;
      fresh.forEach((box, i) => {
        seen.add(box);
        if (reveal && tops[i] > fold) {
          box.setAttribute("data-reveal", "");
          reveal.observe(box);
        } else {
          box.style.setProperty("--enter-delay", `${Math.min(step, MAX_STEPS) * STAGGER_MS}ms`);
          step += 1;
        }
      });
    };

    arrive([...root.querySelectorAll(BOX)]);
    // Runs before the browser paints the new boxes, so none of them flashes in at full strength.
    const added = new MutationObserver((records) => {
      const boxes = [];
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.matches(BOX)) boxes.push(node);
          boxes.push(...node.querySelectorAll(BOX));
        }
      }
      arrive(boxes);
    });
    added.observe(root, { childList: true, subtree: true });

    // The light follows the mouse, once per frame, in the box under it (and any box around that one).
    let frame = 0;
    let pointer = null;
    const paint = () => {
      frame = 0;
      for (let box = pointer.target.closest(BOX); box; box = box.parentElement?.closest(BOX)) {
        const rect = box.getBoundingClientRect();
        box.style.setProperty("--mx", `${Math.round(pointer.x - rect.left)}px`);
        box.style.setProperty("--my", `${Math.round(pointer.y - rect.top)}px`);
      }
    };
    const onMove = (event) => {
      if (event.pointerType !== "mouse" || !(event.target instanceof Element)) return;
      pointer = { target: event.target, x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    };
    root.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      added.disconnect();
      reveal?.disconnect();
      root.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [rootRef]);
};

export default useDashboardMotion;
