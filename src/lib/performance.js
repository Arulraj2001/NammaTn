/**
 * Performance utilities — lazy loading, memoization helpers, caching.
 */
import { lazy } from "react";

/**
 * Lazy-load a page component with a built-in retry (handles network blips).
 * Usage: const AdminDashboard = lazyWithRetry(() => import('@/pages/admin/AdminDashboard'));
 */
export function lazyWithRetry(factory, retries = 2) {
  return lazy(() =>
    factory().catch((err) => {
      if (retries <= 0) throw err;
      return new Promise((resolve) => setTimeout(resolve, 300)).then(() =>
        lazyWithRetry(factory, retries - 1)
      );
    })
  );
}

/**
 * Debounce — returns a debounced version of fn.
 */
export function debounce(fn, ms = 300) {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/**
 * Throttle — ensures fn is called at most once per `ms`.
 */
export function throttle(fn, ms = 500) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      return fn(...args);
    }
  };
}

/**
 * Simple in-memory LRU-style cache for expensive computations.
 */
export function createMemCache(maxSize = 100) {
  const map = new Map();
  return {
    get(key) { return map.get(key); },
    set(key, value) {
      if (map.size >= maxSize) {
        map.delete(map.keys().next().value);
      }
      map.set(key, value);
    },
    has(key) { return map.has(key); },
    clear() { map.clear(); },
  };
}

/**
 * Intersection Observer wrapper for lazy rendering.
 * Returns a ref and a boolean `isVisible`.
 */
export function createVisibilityObserver(options = {}) {
  // Used in hooks — see useVisible hook
  return new IntersectionObserver(options.callback || (() => {}), {
    rootMargin: options.rootMargin || "200px",
    threshold: options.threshold || 0,
  });
}

/**
 * Chunk an array into pages.
 */
export function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}