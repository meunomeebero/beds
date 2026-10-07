"use client";

import { useState } from "react";

/**
 * Runs `start` during the render in which `open` becomes true.
 *
 * Opening a list starts a fresh cursor session. Resolving that local state
 * during render prevents a key press from landing in the old session between
 * commit and a passive effect.
 *
 * Adapted from beUI's MIT-licensed hook. `start` must only update state owned
 * by the calling component; external callbacks and DOM writes belong in an
 * effect keyed to `open`.
 */
export function useOnOpen(open: boolean, start: () => void) {
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) start();
  }
}
