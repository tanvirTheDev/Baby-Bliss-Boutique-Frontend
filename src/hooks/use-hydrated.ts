"use client";

import { useEffect, useState } from "react";

/**
 * False during SSR and the first client render, true from the second onwards.
 *
 * Zustand's persist middleware reads localStorage after mount, so anything
 * derived from a persisted store is empty on the server and populated on the
 * client. Rendering that difference directly is a hydration mismatch, and React
 * responds by throwing away and regenerating the tree.
 *
 * Gate persisted state behind this so the first client render matches the
 * server, and the real value appears on the next paint.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
