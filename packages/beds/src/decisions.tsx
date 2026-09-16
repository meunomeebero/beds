import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './controls';
import { Icon, type IconName } from './foundation';
import { RadioGroup, type RadioOption } from './form-fields';
import './decisions.css';

export type DecisionState = 'approval' | 'confirmation' | 'processing' | 'success' | 'skipped' | 'denied' | 'error';
export type DecisionStatusProps = { state: DecisionState; label: string };
export type DecisionAction = { label: string; onClick: () => void; disabled?: boolean };

const statusIcons: Record<DecisionState, IconName> = {
  approval: 'ShieldCheck', confirmation: 'CircleHelp', processing: 'Loader2',
  success: 'CheckCircle2', skipped: 'ArrowRight', denied: 'X', error: 'AlertCircle',
};

/** Passive operational label; callers announce meaningful updates separately. */
export function DecisionStatus({ state, label }: DecisionStatusProps) {
  return <span className="es-decision-status" data-state={state}><Icon name={statusIcons[state]} purpose="small" /><span>{label}</span></span>;
}

export type DecisionActionsProps = {
  primary: DecisionAction;
  secondary?: DecisionAction;
  alternative?: DecisionAction;
  disabled?: boolean;
};

/** Explicit choices only. No permission persistence, request or automatic success. */
export function DecisionActions({ primary, secondary, alternative, disabled }: DecisionActionsProps) {
  return <div className="es-decision-actions" data-alternative={Boolean(alternative && secondary) || undefined}>
    <Button label={primary.label} onClick={primary.onClick} disabled={disabled || primary.disabled} variant="primary" purpose="welcome" />
    {alternative && <Button label={alternative.label} onClick={alternative.onClick} disabled={disabled || alternative.disabled} purpose="welcome" />}
    {secondary && <Button label={secondary.label} onClick={secondary.onClick} disabled={disabled || secondary.disabled} purpose="welcome" />}
  </div>;
}

type CardCopy = {
  title: string;
  description?: string;
  status: DecisionStatusProps;
  feedback?: string;
};

function isLocked(state: DecisionState) {
  return state === 'processing' || state === 'success' || state === 'skipped' || state === 'denied';
}

function DecisionFrame({ title, description, status, feedback, children, question = false }: CardCopy & { children: ReactNode; question?: boolean }) {
  const id = useId();
  return <article className="es-decision-card" data-question={question || undefined} aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined}>
    <header className="es-decision-header"><h2 id={`${id}-title`}>{title}</h2><DecisionStatus state={status.state} label={status.label} /></header>
    {description && <p className="es-decision-description" id={`${id}-description`}>{description}</p>}
    {children}
    <p className="es-decision-feedback" role="status" aria-atomic="true">{feedback ?? ''}</p>
  </article>;
}

export type ApprovalCardProps = CardCopy & {
  primaryAction: DecisionAction;
  secondaryAction: DecisionAction;
  alternativeAction?: DecisionAction;
  details?: readonly { id: string; label: string; value: string; emphasis?: boolean }[];
  context?: { label: string; icon?: IconName };
};

export function ApprovalCard({ title, description, status, feedback, primaryAction, secondaryAction, alternativeAction, details, context }: ApprovalCardProps) {
  return <DecisionFrame title={title} description={description} status={status} feedback={feedback}>
    {details && details.length > 0 && <dl className="es-decision-details">{details.map(item => <div key={item.id} data-emphasis={item.emphasis || undefined}><dt>{item.label}</dt><dd><bdi>{item.value}</bdi></dd></div>)}</dl>}
    {context && <p className="es-decision-context">{context.icon && <Icon name={context.icon} purpose="action" />}<span>{context.label}</span></p>}
    <DecisionActions primary={primaryAction} secondary={secondaryAction} alternative={alternativeAction} disabled={isLocked(status.state)} />
  </DecisionFrame>;
}

export type QuestionCardProps = CardCopy & {
  options: readonly RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  onConfirm: (value: string | null) => void;
  confirmLabel: string;
  skipAction?: DecisionAction;
  error?: string;
};

/** Selection is not submission. Caller owns validation, answer storage and recovery. */
export function QuestionCard({ title, description, status, feedback, options, value, onChange, onConfirm, confirmLabel, skipAction, error }: QuestionCardProps) {
  const form = useRef<HTMLFormElement>(null);
  const locked = isLocked(status.state);
  const selected = options.find(option => option.id === value && !option.disabled);
  useEffect(() => {
    if (error && !locked) {
      const first = form.current?.querySelector<HTMLInputElement>('input:not(:disabled)');
      (first ?? form.current)?.focus();
    }
  }, [error, locked]);
  return <DecisionFrame title={title} description={description} status={status} feedback={feedback} question>
    <form ref={form} className="es-question-form" aria-label={title} tabIndex={-1} noValidate onSubmit={event => { event.preventDefault(); if (!locked) onConfirm(selected?.id ?? null); }}>
      <RadioGroup label={title} purpose="question" value={selected?.id ?? ''} options={options} onChange={onChange} error={error} disabled={locked} />
      <div className="es-decision-actions">
        <Button label={confirmLabel} type="submit" disabled={locked} variant="primary" purpose="welcome" />
        {skipAction && <Button label={skipAction.label} onClick={skipAction.onClick} disabled={locked || skipAction.disabled} purpose="welcome" />}
      </div>
    </form>
  </DecisionFrame>;
}
