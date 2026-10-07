import React from 'react';
import { renderToString } from 'react-dom/server';
import { OtpHydrationProbe } from './otp-hydration-shared';

export function renderOtpHydrationProbe() {
  return renderToString(React.createElement(OtpHydrationProbe));
}
