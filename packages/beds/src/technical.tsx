import { useId, useRef, useState } from 'react';
import { Icon } from './foundation';

/** Complete caller-owned copy; BEDS supplies a PT-BR fallback without detecting host locale. */
export type CodeSnippetMessages = {
  copy: string;
  copying: string;
  copied: string;
  copyLabel: (label: string) => string;
  success: string;
  error: string;
};

const defaultMessages: CodeSnippetMessages = {
  copy: 'Copiar',
  copying: 'Copiando',
  copied: 'Copiado',
  copyLabel: label => `Copiar ${label}`,
  success: 'Copiado para a área de transferência',
  error: 'Não foi possível copiar. Selecione o valor e copie manualmente ou tente novamente.',
};

/** Measured connection-value presentation; copying starts only on a user click. */
export function CodeSnippet({ label, value, onCopy, messages = defaultMessages }: {
  label: string;
  value: string;
  onCopy?: (value: string) => Promise<void>;
  messages?: CodeSnippetMessages;
}) {
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
  return <div className="es-code-field">
    <span id={id} className="es-code-label">{label}</span>
    <div className="es-code-snippet">
      <code aria-labelledby={id} tabIndex={0}>{value}</code>
      <button type="button" aria-label={messages.copyLabel(label)} disabled={state === 'copying'} onClick={copy}>
        <Icon name={state === 'copied' ? 'Check' : 'Copy'} />
        <span>{state === 'copied' ? messages.copied : state === 'copying' ? messages.copying : messages.copy}</span>
      </button>
    </div>
    {state === 'error' && <p role="alert">{messages.error}</p>}
    <span className="es-sr-only" role="status">{state === 'copied' ? messages.success : state === 'copying' ? messages.copying : ''}</span>
  </div>;
}
