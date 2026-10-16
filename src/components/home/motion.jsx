import { useEffect, useRef, useState } from "react";
import useInView, { prefersReducedMotion } from "../../hooks/useInView";

// The home page's motion. Everything plays once, when it scrolls into view, using only opacity and
// transforms (smooth on cheap phones). With reduced motion, everything is simply shown.

/**
 * Rises (or slides, or zooms) into place when scrolled to. `from`: up | left | right | zoom.
 * `delay` (ms) staggers neighbours. The look lives in index.css (.reveal).
 */
export const Reveal = ({ as: Tag = "div", from = "up", delay = 0, className = "", style, children, ...rest }) => {
  const ref = useRef(null);
  const shown = useInView(ref);
  return (
    <Tag ref={ref} data-from={from} data-shown={shown ? "" : undefined} className={`reveal ${className}`} style={{ ...style, "--reveal-delay": `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
};

const easeOut = (t) => 1 - (1 - t) ** 3;

/**
 * A number that counts up to `value` when it comes into view. Screen readers get the final number
 * only (the counting itself is hidden from them).
 */
export const CountUp = ({ value, format = (n) => n.toLocaleString("en-IN"), duration = 1200, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.6 });
  const [current, setCurrent] = useState(0);
  const still = prefersReducedMotion();

  useEffect(() => {
    if (!inView || still) return undefined;
    let frame;
    const start = performance.now() + delay;
    const tick = (now) => {
      const progress = Math.min(1, Math.max(0, (now - start) / duration));
      setCurrent(Math.round(value * easeOut(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, still, value, duration, delay]);

  return (
    <span ref={ref}>
      <span aria-hidden="true">{format(still ? value : current)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
};

/** A progress bar that fills to `value`% when it comes into view (green once full). */
export const AnimatedBar = ({ value, label, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.5 });
  const percent = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  return (
    <div ref={ref} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label} className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-[1400ms] ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none ${percent >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-600 to-sky-400"}`}
        style={{ width: inView ? `${percent}%` : "0%", transitionDelay: `${delay}ms` }}
      />
    </div>
  );
};
