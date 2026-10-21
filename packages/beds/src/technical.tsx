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

/** Measured connection-value presentation; copying starts only on a user click.
 *  `block` (default): bordered mono box. `pill`: a rounded value row with a leading link glyph and a filled copy pill,
 *  for a single address the person pastes elsewhere. `hideLabel` keeps the label for assistive tech only. */
export function CodeSnippet({ label, value, onCopy, messages = defaultMessages, variant = 'block', hideLabel = false }: {
  label: string;
  value: string;
  onCopy?: (value: string) => Promise<void>;
  messages?: CodeSnippetMessages;
  variant?: 'block' | 'pill';
  hideLabel?: boolean;
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
  const pill = variant === 'pill';
  const labelClass = hideLabel ? 'es-sr-only' : pill ? 'es-copy-pill-label' : 'es-code-label';
  return <div className={pill ? 'es-code-field es-copy-pill-field' : 'es-code-field'}>
    <span id={id} className={labelClass}>{label}</span>
    <div className={pill ? 'es-copy-pill' : 'es-code-snippet'}>
      {pill && <Icon name="Link2" purpose="feature" />}
      <code aria-labelledby={id} tabIndex={0}>{value}</code>
      <button type="button" aria-label={messages.copyLabel(label)} disabled={state === 'copying'} onClick={copy}>
        <Icon name={state === 'copied' ? 'Check' : 'Copy'} purpose={pill ? 'action' : undefined} />
        <span className={pill ? 'es-copy-pill-text' : undefined}>{state === 'copied' ? messages.copied : state === 'copying' ? messages.copying : messages.copy}</span>
      </button>
    </div>
    {state === 'error' && <p role="alert">{messages.error}</p>}
    <span className="es-sr-only" role="status">{state === 'copied' ? messages.success : state === 'copying' ? messages.copying : ''}</span>
  </div>;
}
