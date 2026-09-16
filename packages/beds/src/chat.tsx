import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon, type IconName } from './foundation';

export function Conversation({ label, children }: { label: string; children: ReactNode }) {
  return <section className="es-conversation" aria-label={label}>{children}</section>;
}

export function ConversationBubble({ role, children, sentAt, reactions }: {
  role: 'user' | 'assistant'; children: ReactNode; sentAt?: string; reactions?: ReactNode;
}) {
  return <article className="es-conversation-bubble" data-role={role} aria-label={role === 'user' ? 'Sua mensagem' : 'Mensagem da assistente'}>
    <div className="es-conversation-content">{children}</div>
    {(sentAt || reactions) && <footer className="es-conversation-meta">
      {reactions && <div className="es-conversation-reactions" role="group" aria-label="Reações">{reactions}</div>}
      {sentAt && <time>{sentAt}</time>}
    </footer>}
  </article>;
}
export function ChatLayout({ title, mark, children, suggestions, recent }: { title: string; mark?: ReactNode; children: ReactNode; suggestions?: ReactNode; recent?: ReactNode }) {
  return <div className="es-chat-layout"><h1>{mark}{title}</h1><div className="es-chat-compose-region">{children}</div>{suggestions && <div className="es-chat-suggestions">{suggestions}</div>}{recent && <div className="es-chat-recent">{recent}</div>}</div>;
}
export type ComposerAttachment = { id: string; name: string; kind: 'document' | 'image' | 'spreadsheet' | 'folder' | 'file'; removeLabel: string };
export type ComposerAttachmentPicker = { onSelect: (files: File[]) => void; accept?: string; multiple?: boolean };

const attachmentIcons: Record<ComposerAttachment['kind'], IconName> = {
  document: 'FileText', image: 'Image', spreadsheet: 'Table2', folder: 'Folder', file: 'Paperclip',
};

export function ChatComposer({ label, value, onChange, onSubmit, placeholder = 'Ask anything or @ to add context', context, tools, busy = false, disabled = false, onAttach, onCancel, error, purpose = 'default', sendLabel = 'Send message', attachLabel = 'Add attachment or context', cancelLabel = 'Stop response', attachments = [], attachmentsLabel = 'Attachments', onRemoveAttachment, attachmentPicker }: {
  label: string; value: string; onChange: (value: string) => void; onSubmit: () => void; placeholder?: string; context?: ReactNode; tools?: ReactNode; busy?: boolean; disabled?: boolean; onAttach?: () => void; onCancel?: () => void; error?: string; purpose?: 'default' | 'guided'; sendLabel?: string; attachLabel?: string; cancelLabel?: string;
  attachments?: readonly ComposerAttachment[]; attachmentsLabel?: string; onRemoveAttachment?: (id: string) => void; attachmentPicker?: ComposerAttachmentPicker;
}) {
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const attachmentList = useRef<HTMLUListElement>(null);
  useEffect(() => { if (purpose === 'guided' && error) input.current?.focus(); }, [error, purpose]);
  const canSend = (purpose === 'guided' || Boolean(value.trim()) || attachments.length > 0) && !disabled && !busy;
  function removeAttachment(attachmentId: string, index: number) {
    if (disabled || busy || !onRemoveAttachment) return;
    const buttons = attachmentList.current?.querySelectorAll<HTMLButtonElement>('button');
    const next = buttons?.[index + 1] ?? buttons?.[index - 1] ?? input.current;
    onRemoveAttachment(attachmentId);
    next?.focus();
  }
  return <div className="es-composer" data-purpose={purpose} data-has-attachments={attachments.length > 0 ? '' : undefined} data-invalid={error ? '' : undefined}>
    {context && <div className="es-composer-context">{context}</div>}
    {attachments.length > 0 && <ul ref={attachmentList} className="es-composer-attachments" aria-label={attachmentsLabel}>
      {attachments.map((attachment, index) => <li key={attachment.id} className="es-composer-attachment">
        <span className="es-composer-file-icon"><Icon name={attachmentIcons[attachment.kind]} purpose="action" /></span>
        <bdi>{attachment.name}</bdi>
        {onRemoveAttachment && <button type="button" aria-label={attachment.removeLabel} disabled={disabled || busy} onClick={() => removeAttachment(attachment.id, index)}><Icon name="X" purpose="action" /></button>}
      </li>)}
    </ul>}
    {attachmentPicker && <input ref={fileInput} type="file" hidden aria-label={attachLabel} accept={attachmentPicker.accept} multiple={attachmentPicker.multiple} disabled={disabled || busy} onChange={event => {
      const selected = Array.from(event.currentTarget.files ?? []);
      event.currentTarget.value = '';
      if (!disabled && !busy && selected.length) { attachmentPicker.onSelect(selected); input.current?.focus(); }
    }} />}
    <form onSubmit={event => { event.preventDefault(); if (canSend) onSubmit(); }} aria-busy={busy}>
      {purpose === 'guided' && <label htmlFor={id}>{label}</label>}
      <textarea ref={input} id={id} aria-label={label} aria-invalid={Boolean(error)} aria-describedby={error ? id+'-error' : undefined} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled || busy} onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (canSend) onSubmit(); }
      }} />
      <div className="es-composer-toolbar"><div>{(onAttach || attachmentPicker) && <button type="button" className="es-composer-attach" aria-label={attachLabel} disabled={disabled || busy} onClick={attachmentPicker ? () => fileInput.current?.click() : onAttach}><Icon name={attachmentPicker ? 'Paperclip' : 'Plus'} purpose="action" /></button>}</div><div>{tools}{busy && onCancel ? <button type="button" className="es-composer-send" aria-label={cancelLabel} onClick={onCancel}><Icon name="X" /></button> : <button type="submit" className="es-composer-send" aria-label={sendLabel} disabled={!canSend}><Icon name="ArrowUp" purpose="action" /></button>}</div></div>
    </form>{error && <p className="es-composer-error" id={id+'-error'} role="alert">{error}</p>}
  </div>;
}
export function SuggestionRow({ icon, title, description, onClick }: { icon: IconName; title: string; description?: string; onClick: () => void }) {
  return <button type="button" className="es-suggestion" onClick={onClick}><span><Icon name={icon} /></span><strong>{title}</strong>{description && <small>{description}</small>}</button>;
}
export function ChatMessage({ role, children, status = 'sent', onRetry, purpose = 'bubble', author, mark }: { role: 'user' | 'assistant'; children: ReactNode; status?: 'sending' | 'sent' | 'error'; onRetry?: () => void; purpose?: 'bubble' | 'thread'; author?: string; mark?: ReactNode }) {
  return <div className="es-chat-message" data-role={role} data-purpose={purpose} aria-busy={status === 'sending'}>{author && <div className="es-chat-author">{mark && <span aria-hidden="true">{mark}</span>}<strong>{author}</strong></div>}<ConversationBubble role={role}>{children}</ConversationBubble>{status === 'sending' && <small role="status">Enviando…</small>}{status === 'error' && <div className="es-chat-message-error" role="alert"><span>Não foi possível enviar. Verifique sua conexão e tente novamente.</span>{onRetry && <button type="button" onClick={onRetry}>Tentar novamente</button>}</div>}</div>;
}

export type ChatOption = { id: string; label: string; description?: string; icon: IconName; disabled?: boolean };

/** Immediate actions, not radio answers. Host owns each destination and outcome. */
export function ChatOptions({ title, options, onChoose, disabled = false }: {
  title: string; options: readonly ChatOption[]; onChoose: (id: string) => void; disabled?: boolean;
}) {
  const id = useId();
  return <section className="es-chat-options" aria-labelledby={id}>
    <h2 id={id}>{title}</h2>
    <ul>{options.map((option, index) => <li key={option.id}>
      <button type="button" disabled={disabled || option.disabled} aria-labelledby={`${id}-${index}-label`} aria-describedby={option.description ? `${id}-${index}-description` : undefined} onClick={() => onChoose(option.id)}>
        <span className="es-chat-option-icon"><Icon name={option.icon} purpose="action" /></span>
        <span className="es-chat-option-copy"><strong id={`${id}-${index}-label`}>{option.label}</strong>{option.description && <span id={`${id}-${index}-description`}>{option.description}</span>}</span>
        <Icon name="ChevronRight" purpose="small" />
      </button>
    </li>)}</ul>
  </section>;
}

/** Open transcript + in-flow next step. Changing stepKey restores focus to the new step. */
export function ChatThread({ title, children, interaction, stepKey, notice, announcement }: {
  title: string; children: ReactNode; interaction: ReactNode; stepKey: string; notice?: string; announcement?: string;
}) {
  const id = useId();
  const interactionRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(stepKey);
  useEffect(() => {
    if (previousStep.current === stepKey) return;
    previousStep.current = stepKey;
    const region = interactionRef.current;
    const target = region?.querySelector<HTMLElement>('textarea:not(:disabled),input:not([type="file"]):not(:disabled)')
      ?? region?.querySelector<HTMLElement>('.es-file-upload-browse:not(:disabled)')
      ?? region?.querySelector<HTMLElement>('button:not(:disabled),a[href]');
    target?.focus();
  }, [stepKey]);
  return <section className="es-chat-thread" aria-labelledby={id}>
    <h1 id={id} className="es-visually-hidden">{title}</h1>
    <div className="es-chat-transcript">{children}</div>
    <div className="es-chat-next" ref={interactionRef}>{interaction}{notice && <p className="es-chat-notice">{notice}</p>}</div>
    <p className="es-visually-hidden" role="status">{announcement}</p>
  </section>;
}
