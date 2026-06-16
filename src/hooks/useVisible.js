import { useEffect, useRef, useState } from "react";

/**
 * Intersection Observer hook — returns [ref, isVisible].
 * Useful for lazy-rendering expensive components/sections.
 *
 * @param {string} rootMargin  - e.g. "200px"
 * @param {boolean} once       - stop observing after first intersection
 */
export function useVisible(rootMargin = "200px", once = true) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return [ref, isVisible];
}