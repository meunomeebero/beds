import React from 'react';
import { renderToString } from 'react-dom/server';
import { HydrationProbe } from './hydration-shared';

export function renderHydrationProbe() {
  return renderToString(React.createElement(HydrationProbe));
}
