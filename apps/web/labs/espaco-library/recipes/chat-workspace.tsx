/** Optional app-owned chat screen. Read the skills linked in docs/design/espaco-library/INTERFACE-QUALITY.md. */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useId, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Icon } from 'beds';
// Recipe-owned presentation motion; not an application-wide DS requirement.
const EASE_OUT = [.16, 1, .3, 1] as const;
const SPRING_LAYOUT = { type: 'spring', stiffness: 360, damping: 32, mass: .6 } as const;
const SPRING_PRESS = { type: 'spring', stiffness: 500, damping: 30, mass: .6 } as const;
import { clsx as cn } from 'clsx';

export type ChatWorkspaceMessage = {
  /** Stable host identifier. It anchors incremental transcript updates. */
  id: string;
  role: 'user' | 'assistant';
  /** Host-rendered content. This recipe does not parse Markdown, citations, or tools. */
  content: ReactNode;
  /** The current assistant turn may be updated in place while it streams. */
  state?: 'complete' | 'streaming';
  /** Replaces the role-based accessible label when the host has a clearer name. */
  label?: string;
};

export type ChatWorkspaceError = {
  /** A factual, recoverable host error. This recipe never manufactures a transport result. */
  message: string;
};

export type ChatWorkspaceProps = {
  /** Names the complete conversation for assistive technology. */
  label: string;
  /** Visible workspace heading. */
  title: string;
  /** Ordered, controlled transcript. Update an existing streaming item by its stable id. */
  messages: readonly ChatWorkspaceMessage[];
  /** Controlled composer draft. This recipe never clears it after a submit or failure. */
  draft: string;
  onDraftChange: (value: string) => void;
  /** Receives the trimmed draft only after a user submits it. */
  onSubmit: (draft: string) => void;
  /** Current turn state, supplied by the host rather than inferred from a request. */
  state?: 'ready' | 'streaming';
  /** Disables host input without fabricating a reason or a completion state. */
  disabled?: boolean;
  /** Optional terminal recovery supplied by the host. It must not start a hidden request. */
  error?: ChatWorkspaceError;
  onCancel?: () => void;
  onRetry?: () => void;
  /** Optional truthful first-use state. It is rendered only when the transcript is empty. */
  emptyState?: ReactNode;
  composerLabel?: string;
  placeholder?: string;
  sendLabel?: string;
  cancelLabel?: string;
  retryLabel?: string;
  streamingLabel?: string;
};

const MESSAGE_ENTER = {
  opacity: { duration: 0.18, ease: EASE_OUT },
  y: SPRING_LAYOUT,
} as const;

/**
 * Bounded beUI `chat-app` adaptation: a presentational transcript and composer
 * only. Session, identity, credit, streaming transport, persistence, and retry
 * policy remain with the caller.
 */
export function ChatWorkspace({
  label,
  title,
  messages,
  draft,
  onDraftChange,
  onSubmit,
  state = 'ready',
  disabled = false,
  error,
  onCancel,
  onRetry,
  emptyState,
  composerLabel = 'Message',
  placeholder = 'Write a message…',
  sendLabel = 'Send message',
  cancelLabel = 'Stop response',
  retryLabel = 'Try again',
  streamingLabel = 'Responding',
}: ChatWorkspaceProps) {
  const reduce = useReducedMotion() ?? false;
  const transcriptId = useId();
  const composerId = useId();
  const streaming = state === 'streaming';
  const canSubmit = Boolean(draft.trim()) && !disabled && !streaming;
  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const nextDraft = draft.trim();
    if (!nextDraft || disabled || streaming) return;
    onSubmit(nextDraft);
  };
  const onComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const composing = event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229;
    if (event.key !== 'Enter' || event.shiftKey || composing) return;
    event.preventDefault();
    submit();
  };

  return <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card text-card-foreground forced-colors:border-[CanvasText]" aria-labelledby={transcriptId}>
    <header className="border-b border-border px-4 py-3 sm:px-5"><h2 id={transcriptId} className="text-base font-medium tracking-snug text-foreground text-balance">{title}</h2></header>
    <div className="flex min-h-0 flex-col">
      <section aria-label={label} className="min-h-32 max-h-[min(58svh,680px)] overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
        <ol className="flex min-w-0 flex-col gap-4" aria-live="off">
          <AnimatePresence initial={false} mode="popLayout">
            {messages.map((message) => {
              const messageStreaming = message.role === 'assistant' && message.state === 'streaming';
              return <motion.li key={message.id} layout="position" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -3 }} transition={reduce ? { duration: 0 } : MESSAGE_ENTER} className={cn('flex min-w-0 flex-col', message.role === 'user' ? 'items-end' : 'items-start')}>
                <article aria-label={message.label ?? (message.role === 'user' ? 'Your message' : 'Assistant message')} className={cn('max-w-[88%] break-words rounded-2xl px-3.5 py-2.5 text-sm leading-6 text-pretty sm:max-w-[82%]', message.role === 'user' ? 'rounded-ee-md bg-primary text-primary-foreground' : 'rounded-es-md bg-muted text-foreground')}>
                  <div aria-live={messageStreaming ? 'polite' : 'off'} aria-atomic="false">{message.content}</div>
                </article>
                {messageStreaming && <span role="status" className="mt-2 inline-flex min-h-5 items-center gap-1 px-1 text-xs text-muted-foreground"><span className="sr-only">{streamingLabel}</span>{[0, 1, 2].map(index => <motion.span key={index} aria-hidden="true" className="size-1 rounded-full bg-current" animate={reduce ? { opacity: 0.55 } : { opacity: [0.25, 0.9, 0.25], y: [0, -2, 0] }} transition={reduce ? { duration: 0 } : { duration: 1.05, ease: EASE_OUT, repeat: Number.POSITIVE_INFINITY, delay: index * 0.14 }} />)}</span>}
              </motion.li>;
            })}
          </AnimatePresence>
          {!messages.length && emptyState && <li className="min-w-0 text-sm leading-6 text-muted-foreground text-pretty">{emptyState}</li>}
        </ol>
      </section>
      {error && <div role="alert" className="border-t border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-6 text-foreground forced-colors:border-[CanvasText] sm:px-5"><div className="flex flex-wrap items-center gap-3"><span className="min-w-0 flex-1 break-words">{error.message}</span>{onRetry && <motion.button type="button" disabled={disabled} onClick={onRetry} whileTap={reduce || disabled ? undefined : { scale: 0.97 }} transition={SPRING_PRESS} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-50 forced-colors:focus-visible:outline forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-[Highlight]"><Icon name="AlertCircle" purpose="small" /><span>{retryLabel}</span></motion.button>}</div></div>}
      <form onSubmit={submit} aria-busy={streaming} className="border-t border-border bg-background p-3 sm:p-4">
        <label htmlFor={composerId} className="mb-2 block text-sm font-medium text-foreground">{composerLabel}</label>
        <div className="rounded-xl border border-input bg-background p-2 shadow-xs transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 motion-reduce:transition-none forced-colors:focus-within:outline forced-colors:focus-within:outline-2 forced-colors:focus-within:outline-[Highlight]">
          <textarea id={composerId} value={draft} onChange={event => onDraftChange(event.target.value)} onKeyDown={onComposerKeyDown} disabled={disabled || streaming} placeholder={placeholder} rows={3} className="block w-full resize-y bg-transparent px-2 py-1.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/70 pointer-coarse:text-lg pointer-coarse:leading-6" />
          <div className="mt-2 flex min-h-9 items-center justify-end gap-2">
            {streaming && onCancel ? <motion.button type="button" disabled={disabled} onClick={onCancel} whileTap={reduce || disabled ? undefined : { scale: 0.97 }} transition={SPRING_PRESS} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background pointer-coarse:min-h-11 disabled:cursor-not-allowed disabled:opacity-50 forced-colors:focus-visible:outline forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-[Highlight]"><Icon name="X" purpose="small" /><span>{cancelLabel}</span></motion.button> : <motion.button type="submit" disabled={!canSubmit} whileTap={reduce || !canSubmit ? undefined : { scale: 0.97 }} transition={SPRING_PRESS} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground outline-none transition-colors motion-reduce:transition-none hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background pointer-coarse:min-h-11 disabled:cursor-not-allowed disabled:opacity-50 forced-colors:focus-visible:outline forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-[Highlight]"><span>{sendLabel}</span><Icon name="ArrowUp" purpose="small" /></motion.button>}
          </div>
        </div>
      </form>
    </div>
  </section>;
}
