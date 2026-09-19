import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydrationProbe } from './hydration-shared';

type HydrationWindow = Window & { __bedsHydrationMarkupReady?: boolean };
function hydrate() {
  hydrateRoot(document.getElementById('hydration-root')!, React.createElement(HydrationProbe));
}
if ((window as HydrationWindow).__bedsHydrationMarkupReady) hydrate();
else window.addEventListener('beds-hydration-markup-ready', hydrate, { once: true });
