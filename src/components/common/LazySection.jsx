"use client";

import React from "react";
import { useVisible } from "@/hooks/useVisible";

/**
 * Wraps children in an intersection-observer-triggered render.
 * Children only mount when the placeholder scrolls into view.
 * Great for heavy homepage sections.
 *
 * Props:
 *   fallback  — what to show before visible (default: same-height placeholder)
 *   rootMargin — how early to start loading
 *   minHeight  — placeholder height (default "200px")
 */
export default function LazySection({ children, fallback, rootMargin = "300px", minHeight = "200px" }) {
  const [ref, isVisible] = useVisible(rootMargin, true);

  return (
    <div ref={ref}>
      {isVisible
        ? children
        : fallback || <div style={{ minHeight }} aria-hidden="true" />}
    </div>
  );
}