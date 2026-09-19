import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydrationProbe } from './hydration-shared';

type HydrationWindow = Window & { __bedsHydrationMarkupReady?: boolean; __bedsHydrationComplete?: boolean };
function hydrate() {
  hydrateRoot(document.getElementById('hydration-root')!, React.createElement(HydrationProbe));
  (window as HydrationWindow).__bedsHydrationComplete = true;
}
if ((window as HydrationWindow).__bedsHydrationMarkupReady) hydrate();
else window.addEventListener('beds-hydration-markup-ready', hydrate, { once: true });
