import { useId, useRef, useState } from 'react';
import { Icon } from './foundation';

/** Measured connection-value presentation; copying starts only on a user click. */
export function CodeSnippet({ label, value, onCopy }: { label: string; value: string; onCopy?: (value: string) => Promise<void> }) {
  const id = useId();
  const attempt = useRef(0);
  const [result, setResult] = useState<{ value: string; state: 'idle' | 'copying' | 'copied' | 'error' }>({ value, state: 'idle' });
  const state = result.value === value ? result.state : 'idle';
  const copy = async () => {
    if (state === 'copying') return;
    const currentAttempt = ++attempt.current;
    setResult({ value, state: 'copying' });
    try {
      if (onCopy) await onCopy(value);
      else await navigator.clipboard.writeText(value);
      if (attempt.current === currentAttempt) setResult({ value, state: 'copied' });
    } catch {
      if (attempt.current === currentAttempt) setResult({ value, state: 'error' });
    }
  };
  return <div className="es-code-field"><span id={id} className="es-code-label">{label}</span><div className="es-code-snippet"><code aria-labelledby={id} tabIndex={0}>{value}</code><button type="button" aria-label={'Copy '+label} disabled={state === 'copying'} onClick={copy}><Icon name={state === 'copied' ? 'Check' : 'Copy'} /><span>{state === 'copied' ? 'Copied' : 'Copy'}</span></button></div>{state === 'error' ? <p role="alert">Copy failed. Select the value and copy it manually, or try again.</p> : <span className="es-sr-only" role="status">{state === 'copied' ? 'Copied to clipboard' : state === 'copying' ? 'Copying' : ''}</span>}</div>;
}
