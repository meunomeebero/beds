import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const getSnapshot = () => typeof window === 'undefined' || typeof window.matchMedia !== 'function'
  ? false
  : window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerSnapshot = () => false;

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  if (media.addEventListener) media.addEventListener('change', onChange);
  else media.addListener?.(onChange);
  return () => {
    if (media.removeEventListener) media.removeEventListener('change', onChange);
    else media.removeListener?.(onChange);
  };
}

/** Live, SSR-safe preference used by modal lifecycles that must not deadlock. */
export function useReducedMotionPreference() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
