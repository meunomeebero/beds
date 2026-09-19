import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { OtpHydrationProbe } from './otp-hydration-shared';

type HydrationWindow = Window & { __otpHydrationComplete?: boolean; __otpHydrationMarkupReady?: boolean };

function hydrate() {
  hydrateRoot(document.getElementById('otp-hydration-root')!, React.createElement(OtpHydrationProbe));
}

if ((window as HydrationWindow).__otpHydrationMarkupReady) hydrate();
else window.addEventListener('otp-hydration-markup-ready', hydrate, { once: true });
