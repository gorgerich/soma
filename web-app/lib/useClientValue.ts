"use client";

import { useRef, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Reads a browser-only value (e.g. localStorage) once after hydration.
 * Returns `null` during server rendering and the first client render, so
 * markup stays hydration-safe without setState-in-effect.
 */
export function useClientValue<T>(load: () => T, version: string | number = 0): T | null {
  const cache = useRef<{ version: string | number; value: T } | null>(null);
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      if (cache.current === null || cache.current.version !== version) {
        cache.current = { version, value: load() };
      }
      return cache.current.value;
    },
    () => null,
  );
}
