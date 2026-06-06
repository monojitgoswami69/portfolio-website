"use client";

import { useEffect, useState } from "react";

/**
 * Returns false on first render, then true once the browser has been idle
 * (or after `fallbackMs`). Use this to mount expensive components — WebGL
 * canvases, large interactive widgets — after the page has painted, so they
 * don't compete with LCP/FCP.
 */
export function useDeferredMount(fallbackMs = 600): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    const trigger = () => {
      if (!cancelled) setReady(true);
    };

    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (handle: number) => void;
      }
    ).requestIdleCallback;

    if (typeof ric === "function") {
      idleHandle = ric(trigger, { timeout: fallbackMs });
    } else {
      timeoutHandle = setTimeout(trigger, fallbackMs);
    }

    return () => {
      cancelled = true;
      const cic = (
        window as Window & { cancelIdleCallback?: (handle: number) => void }
      ).cancelIdleCallback;
      if (idleHandle !== undefined && typeof cic === "function") cic(idleHandle);
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
    };
  }, [fallbackMs]);

  return ready;
}
