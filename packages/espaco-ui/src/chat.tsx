import { useId, type ReactNode } from 'react';
import { Icon, type IconName } from './foundation';
export function ChatLayout({ title, mark, children, suggestions, recent }: { title: string; mark?: ReactNode; children: ReactNode; suggestions?: ReactNode; recent?: ReactNode }) {
  return <div className="es-chat-layout"><h1>{mark}{title}</h1><div className="es-chat-compose-region">{children}</div>{suggestions && <div className="es-chat-suggestions">{suggestions}</div>}{recent && <div className="es-chat-recent">{recent}</div>}</div>;
}
export function ChatComposer({ label, value, onChange, onSubmit, placeholder = 'Ask anything or @ to add context', context, tools, busy = false, disabled = false, onAttach, onCancel, error }: {
  label: string; value: string; onChange: (value: string) => void; onSubmit: () => void; placeholder?: string; context?: ReactNode; tools?: ReactNode; busy?: boolean; disabled?: boolean; onAttach?: () => void; onCancel?: () => void; error?: string;
}) {
  const id = useId();
  const canSend = Boolean(value.trim()) && !disabled && !busy;
  return <div className="es-composer" data-invalid={error ? '' : undefined}>
    {context && <div className="es-composer-context">{context}</div>}
    <form onSubmit={event => { event.preventDefault(); if (canSend) onSubmit(); }} aria-busy={busy}>
      <textarea id={id} aria-label={label} aria-invalid={Boolean(error)} aria-describedby={error ? id+'-error' : undefined} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled || busy} onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (canSend) onSubmit(); }
      }} />
      <div className="es-composer-toolbar"><div>{onAttach && <button type="button" className="es-composer-attach" aria-label="Add attachment or context" disabled={disabled || busy} onClick={onAttach}><Icon name="Plus" purpose="action" /></button>}</div><div>{tools}{busy && onCancel ? <button type="button" className="es-composer-send" aria-label="Stop response" onClick={onCancel}><Icon name="X" /></button> : <button type="submit" className="es-composer-send" aria-label="Send message" disabled={!canSend}><Icon name="ArrowUp" purpose="action" /></button>}</div></div>
    </form>{error && <p className="es-composer-error" id={id+'-error'} role="alert">{error}</p>}
  </div>;
}
export function SuggestionRow({ icon, title, description, onClick }: { icon: IconName; title: string; description?: string; onClick: () => void }) {
  return <button type="button" className="es-suggestion" onClick={onClick}><span><Icon name={icon} /></span><strong>{title}</strong>{description && <small>{description}</small>}</button>;
}
export function ChatMessage({ role, children, status = 'sent', onRetry }: { role: 'user' | 'assistant'; children: ReactNode; status?: 'sending' | 'sent' | 'error'; onRetry?: () => void }) {
  return <article className="es-chat-message" data-role={role} aria-label={role === 'user' ? 'Your message' : 'Assistant message'} aria-busy={status === 'sending'}><div>{children}</div>{status === 'sending' && <small role="status">Sending…</small>}{status === 'error' && <div className="es-chat-message-error" role="alert"><span>Message could not be sent.</span>{onRetry && <button type="button" onClick={onRetry}>Retry</button>}</div>}</article>;
}

