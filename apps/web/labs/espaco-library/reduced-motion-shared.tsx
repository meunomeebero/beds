import { useState } from 'react';
import { useReducedMotionPreference } from '../../../../packages/beds/src/lib/hooks/use-reduced-motion';

function ReducedMotionValue() {
  const reduced = useReducedMotionPreference();
  return <output data-testid="reduced-motion-value">{String(reduced)}</output>;
}

export function ReducedMotionProbe() {
  const [mounted, setMounted] = useState(true);
  return <main>
    <p data-testid="probe-state">{mounted ? 'mounted' : 'unmounted'}</p>
    {mounted && <ReducedMotionValue />}
    <button type="button" onClick={() => setMounted(false)}>Unmount probe</button>
  </main>;
}
