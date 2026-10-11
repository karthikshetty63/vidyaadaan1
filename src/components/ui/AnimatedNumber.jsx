import { useLayoutEffect, useRef } from "react";

const DURATION_MS = 900;
const AFTER_BOX_MS = 150; // start once the figure's box has begun to rise in
const WAIT_MS = 150; // how often a figure in a box that is still below the visible area checks again
// A whole number, alone or with a prefix and suffix: "42", "₹1,00,000", "75%". Anything else
// ("—", "3 of 5", "4.5", a date) is shown exactly as it is, without counting.
const NUMBER = /^(\D*?)(\d{1,3}(?:,\d{2,3})+|\d+)(\D*)$/;

const parse = (text) => {
  const match = NUMBER.exec(text);
  return match ? { prefix: match[1], value: Number(match[2].replace(/,/g, "")), suffix: match[3], grouped: match[2].includes(",") } : null;
};
const easeOut = (t) => 1 - (1 - t) ** 3;
const lessMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/**
 * A figure that counts up to its value when it first appears, and glides from the old value to the new
 * one when it changes. It only ever shows real figures: the text it ends on is exactly `value`.
 * Other kinds of values (an element, "—", a date) are shown as they are.
 */
const AnimatedNumber = ({ value }) => {
  const countable = typeof value === "number" || typeof value === "string";
  const text = countable ? String(value) : "";
  const ref = useRef(null);
  const shown = useRef(null); // the number on screen, between renders

  useLayoutEffect(() => {
    const element = ref.current;
    const node = element?.firstChild;
    const target = parse(text);
    const first = shown.current === null;
    const from = first ? 0 : shown.current;
    if (!node || node.nodeType !== 3 || !target || target.value === from || lessMotion()) {
      shown.current = target ? target.value : null;
      return undefined;
    }

    // React owns this text node; only its value changes here, and it always ends on `text`.
    const format = (n) => `${target.prefix}${target.grouped ? Math.round(n).toLocaleString("en-IN") : Math.round(n)}${target.suffix}`;
    let current = from;
    let start = 0;
    let frame = 0;
    let timer = 0;
    node.nodeValue = format(from);

    const tick = (now) => {
      if (!start) {
        // A box still waiting below the visible area: show the real figure until it is scrolled to.
        if (element.closest("[data-reveal]")) {
          node.nodeValue = text;
          timer = setTimeout(() => {
            frame = requestAnimationFrame(tick);
          }, WAIT_MS);
          return;
        }
        node.nodeValue = format(from);
        const boxDelay = parseFloat(getComputedStyle(element).getPropertyValue("--enter-delay")) || 0;
        start = now + (first ? boxDelay + AFTER_BOX_MS : 0);
      }
      const t = Math.min(1, Math.max(0, (now - start) / DURATION_MS));
      current = from + (target.value - from) * easeOut(t);
      if (t < 1) {
        node.nodeValue = format(current);
        frame = requestAnimationFrame(tick);
      } else {
        node.nodeValue = text;
        current = target.value;
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      shown.current = Math.round(current);
    };
  }, [text]);

  return countable ? <span ref={ref}>{text}</span> : value;
};

export default AnimatedNumber;
