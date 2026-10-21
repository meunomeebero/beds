import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Button, TextField } from './controls';
import { Icon, Text } from './foundation';
import { Stack, Surface } from './layout';
import { EASE_OUT } from './lib/ease';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';
import './commerce.css';

const CODE_MAX_LENGTH = 20;
const APPLIED_ENTRY = { duration: 0.2, ease: EASE_OUT } as const;
const APPLIED_ENTRY_REDUCED = { duration: 0.15, ease: 'easeOut' } as const;
const NOTICE_ENTRY = { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] } as const;

export type CouponFieldPhase = 'closed' | 'open' | 'applied' | 'kept';

/** Caller-owned lifecycle. `applied`: the code was accepted. `kept`: the code is held without a check yet (neutral tint, no success). */
export type CouponFieldState = { phase: CouponFieldPhase; code?: string; error?: string; busy?: boolean };

/** Complete caller-owned copy; the component writes no text of its own. */
export type CouponFieldLabels = {
  toggle: string;
  field: string;
  apply: string;
  remove: string;
  /** Bold lead of the applied row, e.g. `${code} aplicado:`. */
  appliedTitle: (code: string) => string;
  appliedDescription: string;
  keptTitle: (code: string) => string;
  keptDescription: string;
  /** Secondary note after the applied description (e.g. it does not combine with another offer). */
  appliedNote?: string;
};

export type InlineSuggestionAction = { label: string; onClick: () => void; disabled?: boolean };

/** Quiet hint with one explicit secondary action under it. It never acts by itself. */
export function InlineSuggestion({ text, action }: { text: string; action: InlineSuggestionAction }) {
  return <div className="es-inline-suggestion">
    <p className="es-inline-suggestion-text">{text}</p>
    <Button label={action.label} variant="secondary" compact disabled={action.disabled} onClick={action.onClick} />
  </div>;
}

/**
 * Discount code entry: a quiet toggle → a 44px pill field with an inline apply pill → an applied row.
 * Its own form, so Enter applies the code and never submits a surrounding form. Focus follows the change:
 * opening → the field, an error → the field, applied → the applied sentence, removed → the toggle.
 */
export function CouponField({ state, labels, onOpen, onApply, onRemove, suggestion, disabled }: {
  state: CouponFieldState;
  labels: CouponFieldLabels;
  onOpen: () => void;
  onApply: (code: string) => void;
  onRemove: () => void;
  /** Shown in the polite live region under the open field, e.g. a minimum the code needs and the switch to reach it. */
  suggestion?: { text: string; action?: { label: string; onClick: () => void } };
  disabled?: boolean;
}) {
  const { phase, code = '', error, busy } = state;
  const reduce = useReducedMotionPreference();
  const [draft, setDraft] = useState(code);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const appliedRef = useRef<HTMLParagraphElement>(null);
  const previousPhase = useRef(phase);

  useEffect(() => {
    const previous = previousPhase.current;
    previousPhase.current = phase;
    if (previous === phase) return;

    const wasSettled = previous === 'applied' || previous === 'kept';
    const isSettled = phase === 'applied' || phase === 'kept';
    if (isSettled) {
      appliedRef.current?.focus();
      return;
    }

    if (phase === 'open') {
      inputRef.current?.focus();
      return;
    }

    if (phase === 'closed' && wasSettled) toggleRef.current?.querySelector('button')?.focus();
  }, [phase]);

  // TextField has no autocapitalize prop: phone keyboards start in capitals for codes.
  useEffect(() => {
    inputRef.current?.setAttribute('autocapitalize', 'characters');
  }, [phase]);

  const apply = () => {
    if (busy || disabled) return;
    onApply(draft.trim());
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    apply();
  };

  if (phase === 'applied' || phase === 'kept') {
    const applied = phase === 'applied';
    return <motion.div
      className="es-coupon-applied"
      data-kept={applied ? undefined : ''}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? APPLIED_ENTRY_REDUCED : APPLIED_ENTRY}
    >
      <Icon name="BadgePercent" />
      <p ref={appliedRef} tabIndex={-1}>
        <strong>{applied ? labels.appliedTitle(code) : labels.keptTitle(code)}</strong>{' '}
        {applied ? labels.appliedDescription : labels.keptDescription}
        {applied && labels.appliedNote && <span className="es-coupon-note"> {labels.appliedNote}</span>}
      </p>
      <Button label={labels.remove} variant="ghost" compact disabled={disabled} onClick={onRemove} />
    </motion.div>;
  }

  if (phase === 'closed') {
    return <div className="es-coupon-toggle" ref={toggleRef}>
      <Button label={labels.toggle} variant="ghost" compact disabled={disabled} onClick={onOpen} />
    </div>;
  }

  return <form className="es-coupon-form" noValidate onSubmit={submit}>
    <TextField
      ref={inputRef}
      label={labels.field}
      name="coupon"
      value={draft}
      onChange={setDraft}
      error={error}
      focusOnError
      autoComplete="off"
      spellCheck={false}
      maxLength={CODE_MAX_LENGTH}
      enterKeyHint="go"
      disabled={disabled}
      action={{ label: labels.apply, onClick: apply, busy }}
    />
    <div className="es-coupon-minimum" aria-live="polite">
      {suggestion && <>
        <p className="es-inline-suggestion-text">{suggestion.text}</p>
        {suggestion.action && <Button label={suggestion.action.label} variant="secondary" compact disabled={disabled} onClick={suggestion.action.onClick} />}
      </>}
    </div>
  </form>;
}

/**
 * Quiet first-run disclosure (no overlay, no blocking): a raised card with a short message, a ghost decline and a
 * secondary accept. `floating` sits at the bottom-start corner; `inline` stays in the page flow (use it on phone pages
 * where a fixed card would cover a primary step). The caller owns persistence of the choice.
 */
export function ConsentNotice({ open, message, acceptLabel, declineLabel, onAccept, onDecline, placement = 'floating' }: {
  open: boolean;
  message: ReactNode;
  acceptLabel: string;
  declineLabel: string;
  onAccept: () => void;
  onDecline: () => void;
  placement?: 'floating' | 'inline';
}) {
  const reduce = useReducedMotionPreference();
  if (!open) return null;

  return <motion.aside
    className="es-consent-notice"
    data-placement={placement}
    role="status"
    aria-live="polite"
    initial={reduce ? false : { opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={NOTICE_ENTRY}
  >
    <Surface role="raised">
      <div className="es-consent-content">
        <Text variant="body-small">{message}</Text>
        <div className="es-consent-actions">
          <Button label={declineLabel} variant="ghost" compact onClick={onDecline} />
          <Button label={acceptLabel} variant="secondary" compact onClick={onAccept} />
        </div>
      </div>
    </Surface>
  </motion.aside>;
}

export type InstructionStep = { id: string; text: string; content?: ReactNode };

/** Numbered setup steps; a step may embed one supporting element (e.g. a copyable value) under its text. */
export function InstructionSteps({ steps, note }: { steps: InstructionStep[]; note?: string }) {
  return <div className="es-instruction-steps">
    <ol>
      {steps.map(step => <li key={step.id}>
        {step.content
          ? <Stack gap="tight"><Text>{step.text}</Text>{step.content}</Stack>
          : <Text>{step.text}</Text>}
      </li>)}
    </ol>
    {note && <Text variant="caption" tone="secondary">{note}</Text>}
  </div>;
}
