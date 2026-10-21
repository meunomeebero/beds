import { AnimatePresence, motion } from 'motion/react';
import { useId, type ReactNode } from 'react';
import { Icon, LinkButton } from './foundation';
import { EASE_OUT } from './lib/ease';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';

export type ChoiceStatus = {
  phase: 'idle' | 'saving' | 'saved' | 'error';
  /** One line answering the last tap; empty in `idle`. */
  text?: string;
  /** e.g. "Try again" after an error, "Undo" after a save. */
  action?: { label: string; onClick: () => void };
};

function StatusLine({ status, frozen }: { status?: ChoiceStatus; frozen: boolean }) {
  const phase = status?.phase ?? 'idle';
  const icon = phase === 'saving' ? 'Loader2' : phase === 'saved' ? 'Check' : phase === 'error' ? 'AlertCircle' : null;
  return <div className="es-choice-status" data-phase={phase} aria-live="polite">
    {phase !== 'idle' && status?.text && <>
      {icon && <Icon name={icon} purpose="small" />}
      <p>{status.text}</p>
      {status.action && <LinkButton label={status.action.label} onClick={status.action.onClick} disabled={frozen} />}
    </>}
  </div>;
}

function useEntrance(order: number, base: number, step: number, from: { opacity: number; scale?: number; y?: number }) {
  const reduce = useReducedMotionPreference();
  if (reduce) return {};
  return { initial: from, animate: { opacity: 1, scale: 1, y: 0 }, transition: { duration: .36, delay: base + order * step, ease: EASE_OUT } };
}

export type ChipChecklistOption = {
  id: string;
  label: string;
  /** Already true elsewhere: shown checked and not removable. */
  locked?: boolean;
};

export type ChipChecklistProps = {
  title: string;
  description?: string;
  /** Visually hidden note read after a locked chip, e.g. "already in your profile". */
  lockedNote?: string;
  options: ChipChecklistOption[];
  value: string[];
  onChange: (next: string[]) => void;
  /** A dependent action is running: every chip waits with the disabled look. */
  frozen?: boolean;
  status?: ChoiceStatus;
};

/**
 * A card of pressable chips the person confirms one by one: dashed until checked, then a solid brand
 * hairline and tint with a check. Each tap is the answer (no submit); the status line answers it.
 * Native checkboxes cover each pill, so Space toggles and the group names them.
 */
export function ChipChecklist({ title, description, lockedNote, options, value, onChange, frozen = false, status }: ChipChecklistProps) {
  const id = useId();
  const reduce = useReducedMotionPreference();
  const chosen = new Set(value);
  const card = useEntrance(0, 0, 0, { opacity: 0, y: 10 });
  return <motion.section className="es-choice-card" data-frozen={frozen || undefined} aria-labelledby={`${id}-title`} {...card} transition={reduce ? undefined : { duration: .5, ease: EASE_OUT }}>
    <div className="es-choice-card-text"><h2 id={`${id}-title`}>{title}</h2>{description && <p id={`${id}-help`}>{description}</p>}</div>
    <div className="es-chip-checklist" role="group" aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-help` : undefined}>
      {options.map((option, index) => <Chip key={option.id} option={option} index={index} checked={option.locked || chosen.has(option.id)} frozen={frozen} lockedNote={lockedNote} onToggle={() => {
        const next = new Set(chosen);
        if (next.has(option.id)) next.delete(option.id); else next.add(option.id);
        onChange([...next]);
      }} />)}
    </div>
    <StatusLine status={status} frozen={frozen} />
  </motion.section>;
}

function Chip({ option, index, checked, frozen, lockedNote, onToggle }: { option: ChipChecklistOption; index: number; checked: boolean; frozen: boolean; lockedNote?: string; onToggle: () => void }) {
  const reduce = useReducedMotionPreference();
  const disabled = frozen || option.locked;
  const entrance = useEntrance(index, .15, .035, { opacity: 0, scale: .85 });
  return <motion.label className="es-choice-chip" data-checked={checked || undefined} data-disabled={disabled || undefined} data-locked={option.locked || undefined} {...entrance}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={onToggle} />
    <span className="es-choice-chip-mark" aria-hidden="true"><AnimatePresence initial={false} mode="popLayout">
      <motion.span key={checked ? 'on' : 'off'} initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .6 }} transition={{ duration: reduce ? 0 : .16, ease: EASE_OUT }}><Icon name={checked ? 'Check' : 'Plus'} purpose="small" /></motion.span>
    </AnimatePresence></span>
    <span className="es-choice-chip-label">{option.label}{option.locked && lockedNote && <span className="es-sr-only"> · {lockedNote}</span>}</span>
  </motion.label>;
}

export type BinaryQuestion = {
  id: string;
  /** The question; may bold the term it asks about. */
  prompt: ReactNode;
  answer: 'yes' | 'no' | null;
  locked?: boolean;
};

export type BinaryQuestionListProps = {
  title: string;
  description?: string;
  /** Optional portrait or artwork beside the title (48px). */
  media?: ReactNode;
  questions: BinaryQuestion[];
  yesLabel: string;
  noLabel: string;
  onAnswer: (id: string, answer: 'yes' | 'no') => void;
  /** Shared guidance under the list, e.g. "answer yes only to what you could explain". */
  help?: string;
  frozen?: boolean;
  status?: ChoiceStatus;
};

/**
 * Up to a few yes/no questions in one card: each row is a fieldset with its question beside a Yes/No pill
 * pair. A tap saves the answer (no submit). Yes takes the brand tint; No stays neutral.
 */
export function BinaryQuestionList({ title, description, media, questions, yesLabel, noLabel, onAnswer, help, frozen = false, status }: BinaryQuestionListProps) {
  const id = useId();
  const reduce = useReducedMotionPreference();
  const card = useEntrance(0, 0, 0, { opacity: 0, y: 10 });
  return <motion.section className="es-choice-card" data-frozen={frozen || undefined} aria-labelledby={`${id}-title`} {...card} transition={reduce ? undefined : { duration: .5, ease: EASE_OUT }}>
    <header className="es-binary-head">{media}<div className="es-choice-card-text"><h2 id={`${id}-title`}>{title}</h2>{description && <p>{description}</p>}</div></header>
    <div className="es-binary-list">
      {questions.map((question, index) => <Question key={question.id} question={question} index={index} name={`${id}-${question.id}`} helpId={help ? `${id}-help` : undefined} yesLabel={yesLabel} noLabel={noLabel} frozen={frozen} onAnswer={onAnswer} />)}
    </div>
    {help && <p className="es-binary-help" id={`${id}-help`}>{help}</p>}
    <StatusLine status={status} frozen={frozen} />
  </motion.section>;
}

function Question({ question, index, name, helpId, yesLabel, noLabel, frozen, onAnswer }: { question: BinaryQuestion; index: number; name: string; helpId?: string; yesLabel: string; noLabel: string; frozen: boolean; onAnswer: (id: string, answer: 'yes' | 'no') => void }) {
  const entrance = useEntrance(index, .15, .06, { opacity: 0, y: 10 });
  const disabled = frozen || question.locked;
  return <motion.fieldset className="es-binary-question" aria-describedby={helpId} {...entrance}>
    <legend>{question.prompt}</legend>
    <div className="es-binary-answers">
      {(['yes', 'no'] as const).map(answer => {
        const checked = question.answer === answer;
        return <label key={answer} className="es-choice-chip es-binary-answer" data-answer={answer} data-checked={checked || undefined} data-disabled={disabled || undefined}>
          <input type="radio" name={name} checked={checked} disabled={disabled} onChange={() => onAnswer(question.id, answer)} />
          {answer === 'yes' && checked && <span className="es-choice-chip-mark" aria-hidden="true"><Icon name="Check" purpose="small" /></span>}
          <span className="es-choice-chip-label">{answer === 'yes' ? yesLabel : noLabel}</span>
        </label>;
      })}
    </div>
  </motion.fieldset>;
}
