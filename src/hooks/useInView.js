import { useEffect, useState } from "react";

/** Whether the person asked their device for less motion. */
export const prefersReducedMotion = () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/**
 * True once the element in `ref` has scrolled into view, and from then on (animations play once).
 * Already true where IntersectionObserver isn't available or the person prefers reduced motion, so
 * nothing ever waits to appear.
 */
const useInView = (ref, { threshold = 0.2, rootMargin = "0px 0px -8% 0px" } = {}) => {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === "undefined" || prefersReducedMotion());

  useEffect(() => {
    const element = ref.current;
    if (inView || !element) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, inView, threshold, rootMargin]);

  return inView;
};

export default useInView;
