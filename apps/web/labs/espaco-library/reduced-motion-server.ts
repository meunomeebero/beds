import React from 'react';
import { renderToString } from 'react-dom/server';
import { ReducedMotionProbe } from './reduced-motion-shared';

export function renderReducedMotionProbe() {
  return renderToString(React.createElement(ReducedMotionProbe));
}
