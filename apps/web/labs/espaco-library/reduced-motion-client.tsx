import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { ReducedMotionProbe } from './reduced-motion-shared';

type ReducedMotionWindow = Window & { __reducedMotionMarkupReady?: boolean; __reducedMotionHydrated?: boolean };

function hydrate() {
  hydrateRoot(document.getElementById('reduced-motion-root')!, React.createElement(ReducedMotionProbe));
  (window as ReducedMotionWindow).__reducedMotionHydrated = true;
}

if ((window as ReducedMotionWindow).__reducedMotionMarkupReady) hydrate();
else window.addEventListener('reduced-motion-markup-ready', hydrate, { once: true });
