import { useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { Check, Plus } from 'lucide-react';
import { Button } from './controls';
import { Icon, type IconName } from './foundation';
import { EASE_OUT } from './lib/ease';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';
import './editing.css';

/* Editing primitives for a page with one in-place edit mode: the sticky mode bar, section cards that open where they
   stand, the dashed tile that adds an empty section, a one-at-a-time checklist / progress list, a two-version compare,
   a tinted prompt card and a drawn success mark. Motion = motion/react only (height eases 0 → auto, opacity under
   reduced motion). */

const BODY_EASE: Transition = { duration: .26, ease: EASE_OUT };
const FADE: Transition = { duration: .12 };
const INTERACTIVE = 'a,button,input,textarea,select,label,[role=button],[contenteditable=true]';

/** Height 0 → auto while it mounts/unmounts; clips only while easing so focus rings stay visible at rest. */
function EasedBody({ show, className, children }: { show: boolean; className: string; children: ReactNode }) {
  const reduce = useReducedMotionPreference();
  const [easing, setEasing] = useState(false);
  const hidden = reduce ? { opacity: 0 } : { height: 0, opacity: 0 };
  const shown = reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 };
  return <AnimatePresence initial={false}>
    {show && <motion.div
      key="body"
      className={className}
      data-easing={easing || undefined}
      initial={hidden}
      animate={shown}
      exit={hidden}
      transition={reduce ? FADE : BODY_EASE}
      onAnimationStart={() => setEasing(true)}
      onAnimationComplete={() => setEasing(false)}
    >{children}</motion.div>}
  </AnimatePresence>;
}

export type EditModeBarProps = {
  /** What this mode is, e.g. "Editando o perfil". Visible label and the region's name unless `accessibleLabel` is set. */
  label: string;
  /** The one way out of the mode, e.g. "Concluir edição". */
  actionLabel: string;
  onAction: () => void;
  accessibleLabel?: string;
  /** One instruction for the whole mode, under the bar. */
  hint?: string;
  /** Moves focus to the bar when the mode starts. Default true. */
  focusOnMount?: boolean;
};

/** Sticky pill shown while a page is in its single edit mode: what mode this is + its one way out. */
export function EditModeBar({ label, actionLabel, onAction, accessibleLabel, hint, focusOnMount = true }: EditModeBarProps) {
  const reduce = useReducedMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusOnMount) ref.current?.focus({ preventScroll: true });
  }, [focusOnMount]);
  return <>
    <motion.div
      ref={ref}
      role="region"
      tabIndex={-1}
      aria-label={accessibleLabel ?? label}
      className="es-edit-bar"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: .98 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: .26, ease: EASE_OUT }}
    >
      <span className="es-edit-bar__dot" aria-hidden="true" />
      <span className="es-edit-bar__label">{label}</span>
      <Button label={actionLabel} onClick={onAction} variant="secondary" compact />
    </motion.div>
    {hint && <p className="es-edit-bar__hint">{hint}</p>}
  </>;
}

export type EditableSectionProps = {
  title: string;
  /** Quiet tally beside the title, e.g. "3". */
  count?: string;
  /** Shown under the title while open. */
  hint?: string;
  open: boolean;
  onOpen: () => void;
  /** Visible cue word on a closed card ("Editar"); the title button's name is `${editLabel} ${title}`. */
  editLabel: string;
  disabled?: boolean;
  /** Read-only content while closed. */
  preview?: ReactNode;
  /** The open body. */
  children?: ReactNode;
  /** Sticky decision footer while open (usually an `EditFooter`). */
  footer?: ReactNode;
};

/** In-place section card of the edit mode: closed it reads; anywhere on it opens it; open it holds its form. */
export function EditableSection({ title, count, hint, open, onOpen, editLabel, disabled = false, preview, children, footer }: EditableSectionProps) {
  const reduce = useReducedMotionPreference();
  const hintId = useId();
  const openable = !open && !disabled;
  const openFromCard = (event: MouseEvent<HTMLElement>) => {
    const insideControl = (event.target as HTMLElement).closest(INTERACTIVE);
    if (!openable || insideControl) return;
    onOpen();
  };
  const name = <span className="es-editable__name">
    <span>{title}</span>
    {count && <span className="es-editable__count">{count}</span>}
  </span>;
  return <section className="es-editable" data-active={open || undefined} data-disabled={disabled || undefined} onClick={openFromCard}>
    {open
      ? <div className="es-editable__heading">
          <h2 className="es-editable__title" aria-describedby={hint ? hintId : undefined}>{name}</h2>
          {hint && <p id={hintId} className="es-editable__hint">{hint}</p>}
        </div>
      : <h2 className="es-editable__title">
          <button type="button" className="es-editable__open" aria-label={`${editLabel} ${title}`} aria-expanded={false} disabled={disabled} onClick={onOpen}>
            {name}
            <span className="es-editable__cue" aria-hidden="true">{editLabel}</span>
          </button>
        </h2>}
    <EasedBody show={!open && Boolean(preview)} className="es-editable__body">{preview}</EasedBody>
    <EasedBody show={open} className="es-editable__body">{children}</EasedBody>
    <AnimatePresence initial={false}>
      {open && footer && <motion.div
        key="footer"
        className="es-editable__footer"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={reduce ? FADE : { duration: .24, ease: EASE_OUT }}
      >{footer}</motion.div>}
    </AnimatePresence>
  </section>;
}

export type EditFooterProps = {
  /** What deciding changes, or why it cannot be decided yet. */
  note?: string;
  tone?: 'neutral' | 'error';
  /** The decision buttons, e.g. Cancelar + Salvar alterações. */
  actions: ReactNode;
};

/** Note + decision actions; the actions stack (primary on top) when the footer is narrow. */
export function EditFooter({ note, tone = 'neutral', actions }: EditFooterProps) {
  return <div className="es-edit-footer-frame">
    <div className="es-edit-footer">
      {note && <p className="es-edit-footer__note" data-tone={tone === 'error' ? 'error' : undefined} role={tone === 'error' ? 'alert' : undefined}>{note}</p>}
      <div className="es-edit-footer__actions">{actions}</div>
    </div>
  </div>;
}

export type AddSectionTileProps = {
  title: string;
  hint?: string;
  /** Trailing action word, e.g. "Adicionar". The button's name is `${title}: ${actionLabel}`. */
  actionLabel: string;
  onClick: () => void;
  disabled?: boolean;
};

/** An empty section, in its own place: one dashed tile that adds it. */
export function AddSectionTile({ title, hint, actionLabel, onClick, disabled = false }: AddSectionTileProps) {
  const reduce = useReducedMotionPreference();
  return <motion.button
    type="button"
    className="es-add-tile"
    aria-label={`${title}: ${actionLabel}`}
    disabled={disabled}
    onClick={onClick}
    whileTap={reduce || disabled ? undefined : { scale: .99 }}
    transition={{ duration: .16, ease: EASE_OUT }}
  >
    <span className="es-add-tile__text">
      <span className="es-add-tile__title">{title}</span>
      {hint && <span className="es-add-tile__hint">{hint}</span>}
    </span>
    <span className="es-add-tile__action" aria-hidden="true"><Plus className="es-add-tile__plus" strokeWidth={2} focusable="false" />{actionLabel}</span>
  </motion.button>;
}

export type StepState = 'pending' | 'current' | 'done';
export type StepItem = { id: string; label: string; state: StepState };

export type StepListProps = {
  items: StepItem[];
  /** `checklist`: a card asking one item at a time · `progress`: a live list of the steps a task goes through. */
  purpose?: 'checklist' | 'progress';
  /** Checklist card title. */
  title?: string;
  /** Checklist tally, e.g. "2 de 4". */
  count?: string;
  /** Checklist: pending rows open their item. */
  onSelect?: (id: string) => void;
  /** Checklist: accessible prefix of a pending row, e.g. "Responder". */
  selectLabel?: string;
  /** Spoken after a done row's label, e.g. "concluído". */
  doneLabel?: string;
  /** Checklist: the open body of the current item. */
  currentContent?: ReactNode;
  /** Checklist: shown once every item is done. */
  doneMessage?: string;
  /** Progress: one quiet line under the list. */
  note?: string;
};

function StepMark({ state, size }: { state: StepState; size: 'md' | 'sm' }) {
  const reduce = useReducedMotionPreference();
  return <span className="es-steps__mark" data-size={size} aria-hidden="true">
    <AnimatePresence initial={false}>
      {state === 'done' && <motion.span
        key="check"
        className="es-steps__check"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: .6 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={reduce ? FADE : { type: 'spring', duration: .35, bounce: .3 }}
      ><Check className="es-steps__check-icon" strokeWidth={3} focusable="false" /></motion.span>}
    </AnimatePresence>
  </span>;
}

/** One list, two uses: a checklist that asks one item at a time, or the live progress of a task's steps. */
export function StepList({ items, purpose = 'checklist', title, count, onSelect, selectLabel, doneLabel, currentContent, doneMessage, note }: StepListProps) {
  if (purpose === 'progress') {
    return <div className="es-steps-progress">
      <ol className="es-steps-progress__list" aria-live="polite">
        {items.map(item => <li key={item.id} className="es-steps-progress__step" data-state={item.state} aria-current={item.state === 'current' ? 'step' : undefined}>
          <StepMark state={item.state} size="sm" />
          <span>{item.label}{item.state === 'done' && doneLabel && <span className="es-sr-only">, {doneLabel}</span>}</span>
        </li>)}
      </ol>
      {note && <p className="es-steps-progress__note">{note}</p>}
    </div>;
  }
  const allDone = items.length > 0 && items.every(item => item.state === 'done');
  return <div className="es-steps">
    {(title || count) && <div className="es-steps__head">
      {title && <h2 className="es-steps__title">{title}</h2>}
      {count && <span className="es-steps__count">{count}</span>}
    </div>}
    <ol className="es-steps__list">
      {items.map(item => {
        const selectable = item.state === 'pending' && Boolean(onSelect);
        const label = <span className="es-steps__label">{item.label}{item.state === 'done' && doneLabel && <span className="es-sr-only">, {doneLabel}</span>}</span>;
        return <li key={item.id} className="es-steps__item" data-state={item.state} aria-current={item.state === 'current' ? 'step' : undefined}>
          {selectable
            ? <button type="button" className="es-steps__row" aria-label={selectLabel ? `${selectLabel}: ${item.label}` : item.label} onClick={() => onSelect?.(item.id)}>
                <StepMark state={item.state} size="md" />{label}
              </button>
            : <div className="es-steps__row"><StepMark state={item.state} size="md" />{label}</div>}
          <EasedBody show={item.state === 'current' && Boolean(currentContent)} className="es-steps__body">
            <div className="es-steps__ask">{currentContent}</div>
          </EasedBody>
        </li>;
      })}
    </ol>
    {allDone && doneMessage && <p className="es-steps__done" role="status">{doneMessage}</p>}
  </div>;
}

export type VersionCompareRow = {
  id: string;
  label: string;
  value: string;
  /** `stays` reads strongest · `unused` quiet · `goes` quiet and struck through. */
  state: 'stays' | 'unused' | 'goes';
  /** Clamp the value to this many lines. */
  clampLines?: number;
};
export type VersionCompareProps = { rows: VersionCompareRow[] };

/** Two (or more) versions of one value, as they would be saved; the one that stays reads strongest. */
export function VersionCompare({ rows }: VersionCompareProps) {
  return <dl className="es-versions">
    {rows.map(row => <div key={row.id} className="es-versions__row" data-state={row.state}>
      <dt>{row.label}</dt>
      <dd>
        <span className="es-versions__value" data-clamped={row.clampLines ? '' : undefined} style={row.clampLines ? { '--es-versions-lines': row.clampLines } as CSSProperties : undefined}>{row.value}</span>
      </dd>
    </div>)}
  </dl>;
}

export type PromptCardProps = {
  icon: IconName;
  title: string;
  body?: string;
  /** Buttons at the end (under the text when narrow). */
  actions?: ReactNode;
  /** Extra content under the text, e.g. a `VersionCompare`. */
  children?: ReactNode;
  /** Collapses the card away when false. Default true. */
  open?: boolean;
};

/** A prompt with a soft brand tile as its one accent: tile, text, then its actions. */
export function PromptCard({ icon, title, body, actions, children, open = true }: PromptCardProps) {
  const reduce = useReducedMotionPreference();
  return <AnimatePresence initial={false}>
    {open && <motion.div
      key="prompt"
      className="es-prompt-slot"
      initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
      animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1, transition: { duration: .32, ease: EASE_OUT } }}
      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0, transition: { duration: .2, ease: EASE_OUT } }}
      transition={reduce ? FADE : undefined}
    >
      <div className="es-prompt" data-extra={children ? '' : undefined}>
        <span className="es-prompt__tile" aria-hidden="true"><Icon name={icon} /></span>
        <div className="es-prompt__text">
          <p className="es-prompt__title">{title}</p>
          {body && <p className="es-prompt__body">{body}</p>}
        </div>
        {children && <div className="es-prompt__extra">{children}</div>}
        {actions && <div className="es-prompt__actions">{actions}</div>}
      </div>
    </motion.div>}
  </AnimatePresence>;
}

export type SuccessMarkProps = { compact?: boolean };

/** Drawn confirmation for a real, completed outcome: circle, then check. Decorative; reduced motion shows it finished. */
export function SuccessMark({ compact = false }: SuccessMarkProps) {
  const reduce = useReducedMotionPreference();
  return <span className="es-success-mark" data-compact={compact || undefined} aria-hidden="true">
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <motion.circle cx="24" cy="24" r="22" strokeWidth={2} initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .5, ease: EASE_OUT }} />
      <motion.path d="M15 24.5l6 6 12-13" strokeWidth={2.5} initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .35, delay: reduce ? 0 : .35, ease: EASE_OUT }} />
    </svg>
  </span>;
}
