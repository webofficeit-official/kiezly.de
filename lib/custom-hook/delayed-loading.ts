"use client";
import { useEffect, useState } from "react";

/**
 * Keeps loading true for at least a minimum duration (default 400ms)
 * to avoid skeleton flicker on fast queries.
 */
export function useDelayedLoading(isLoading: boolean, delay = 400) {
  const [visible, setVisible] = useState(isLoading);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (isLoading) {
      setVisible(true);
    } else {
      timeout = setTimeout(() => setVisible(false), delay);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, delay]);

  return visible;
}
