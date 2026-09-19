import { forwardRef, useEffect, useId, useRef, useState, type ForwardedRef, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, animate, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { Icon, type IconName } from './foundation';
import { cn } from './lib/utils';
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from './lib/ease';
import { useHoverCapable } from './lib/hooks/use-hover-capable';
import './controls.css';

type ButtonProps = {
  label: string; onClick?: () => void; type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'; compact?: boolean; icon?: IconName;
  purpose?: 'default' | 'welcome' | 'connection'; disabled?: boolean; busy?: boolean; 'aria-describedby'?: string;
  /** Disclosure toggles: expose the expanded state of the controlled region. */
  'aria-expanded'?: boolean; 'aria-controls'?: string;
};

const BUTTON_VARIANT: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  ghost: 'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
};

/** Geometry is owned by BEDS: 32px default / 28px compact / 40px welcome / 40px connection (preserved on touch).
 *  `box-border` + `h-*` (exact height, not min-height) — matches the legacy CSS where the visible button height was 40px regardless of text content.
 *  Pointer-coarse (mobile) bumps the default size to 44px while keeping welcome/connection at 40px per FOUNDATIONS. */
const BUTTON_SIZE: Record<'compact' | 'default' | 'welcome' | 'connection', string> = {
  compact: 'min-h-7 rounded-md px-2.5',
  default: 'min-h-8 min-w-0 rounded-lg px-2.5 pointer-coarse:min-h-11',
  welcome: 'min-h-[40px] rounded-[12px] px-3.5', // arbitrary radius: BEDS welcome has r=12px (no token match); preserved on touch (FOUNDATIONS)
  connection: 'min-h-[40px] rounded-xl px-4', // connection keeps 40px on touch (FOUNDATIONS)
};

const BUTTON_GAP: Record<string, string> = {
  compact: 'gap-1',
  default: 'gap-1',
  welcome: 'gap-1.5',
  connection: 'gap-1.5',
};

// Press feedback lives on an inert child: the measured button box never scales (BEDS owns geometry; keyboard Enter also triggers whileTap).
const TAP_PRESS = { tap: { scale: 0.97 } };

export function Button({ label, onClick, type = 'button', variant = 'secondary', compact = false, purpose = 'default', icon, disabled, busy, 'aria-describedby': describedBy, 'aria-expanded': ariaExpanded, 'aria-controls': ariaControls }: ButtonProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const sizeKey = purpose === 'default' && compact ? 'compact' : purpose;
  // hover stays non-geometric (BEDS owns the measured box): filled variants lift via brightness, ghost keeps its hover:bg-accent token veil
  const hover = variant === 'ghost' ? undefined : { filter: 'brightness(1.06)' };
  return <motion.button
    type={type}
    onClick={onClick}
    disabled={disabled || busy}
    aria-busy={busy || undefined}
    aria-describedby={describedBy}
    aria-expanded={ariaExpanded}
    aria-controls={ariaControls}
    data-variant={variant}
    data-purpose={purpose}
    data-compact={purpose === 'default' && compact || undefined}
    whileTap={reduce || disabled || busy ? undefined : 'tap'}
    whileHover={reduce || !canHover || disabled || busy ? undefined : hover}
    transition={{ duration: 0.12, ease: EASE_OUT }}
    className={cn(
      'es-button box-border inline-flex items-center justify-center max-w-full text-sm font-medium tracking-normal',
      'border-0 transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      BUTTON_VARIANT[variant],
      BUTTON_SIZE[sizeKey],
    )}
  >
    <motion.span className={cn('inline-flex items-center justify-center max-w-full', BUTTON_GAP[sizeKey])} variants={TAP_PRESS} transition={{ duration: 0.12, ease: EASE_OUT }}>
      {(busy || icon) && <motion.span aria-hidden className="inline-flex shrink-0" animate={busy && !reduce ? { rotate: 360 } : undefined} transition={busy && !reduce ? { repeat: Infinity, duration: 0.9, ease: 'linear' } : undefined}><Icon name={busy ? 'Loader2' : icon!} purpose="action" /></motion.span>}
      <span className="min-w-0 break-words">{label}</span>
    </motion.span>
  </motion.button>;
}

export function IconButton({ label, icon, onClick, disabled, 'aria-describedby': describedBy }: {
  label: string; icon: IconName; onClick: () => void; disabled?: boolean; 'aria-describedby'?: string;
}) {
  const reduce = useReducedMotion();
  return <motion.button
    type="button"
    aria-label={label}
    aria-describedby={describedBy}
    onClick={onClick}
    disabled={disabled}
    whileTap={reduce || disabled ? undefined : 'tap'}
    transition={{ duration: 0.12, ease: EASE_OUT }}
    className={cn(
      'es-icon-button box-border inline-flex items-center justify-center shrink-0 border-0',
      'min-h-8 min-w-8 rounded-lg bg-transparent text-muted-foreground cursor-pointer',
      'transition-colors hover:text-foreground hover:bg-accent',
      'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      'pointer-coarse:min-h-11 pointer-coarse:min-w-11',
    )}
  ><motion.span className="inline-flex" variants={TAP_PRESS} transition={{ duration: 0.12, ease: EASE_OUT }}><Icon name={icon} purpose="action" /></motion.span></motion.button>;
}

/** Controlled compact toggle with a native pressed state and persistent accessible name. */
export function IconToggleButton({ label, icon, pressed, onPressedChange, disabled, 'aria-describedby': describedBy }: {
  label: string; icon: IconName; pressed: boolean; onPressedChange: (pressed: boolean) => void; disabled?: boolean; 'aria-describedby'?: string;
}) {
  const reduce = useReducedMotion();
  return <motion.button
    type="button"
    aria-label={label}
    aria-pressed={pressed}
    aria-describedby={describedBy}
    onClick={() => onPressedChange(!pressed)}
    disabled={disabled}
    whileTap={reduce || disabled ? undefined : 'tap'}
    transition={{ duration: 0.12, ease: EASE_OUT }}
    className={cn(
      'es-icon-toggle-button box-border inline-flex items-center justify-center shrink-0 border-0',
      'min-h-8 min-w-8 rounded-lg bg-transparent text-muted-foreground cursor-pointer',
      'transition-colors hover:text-foreground hover:bg-accent',
      'aria-pressed:bg-accent aria-pressed:text-foreground aria-pressed:[&_svg]:fill-current',
      'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      'pointer-coarse:min-h-11 pointer-coarse:min-w-11',
    )}
  ><motion.span className="inline-flex" variants={TAP_PRESS} transition={{ duration: 0.12, ease: EASE_OUT }}><Icon name={icon} purpose="action" /></motion.span></motion.button>;
}

type FieldProps = {
  label: string; value: string; onChange: (value: string) => void; description?: string;
  error?: string; placeholder?: string; disabled?: boolean; readOnly?: boolean;
  name?: string; autoComplete?: string; inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']; spellCheck?: boolean; focusOnError?: boolean;
  /** Keep the error slot occupied while there is no error, so appearing errors never shift the layout below. */
  reserveErrorLine?: boolean;
};

type TextFieldProps = FieldProps & { purpose?: 'settings' | 'connection'; type?: 'text' | 'email' | 'url' | 'tel' | 'password' };

function setForwardedRef<T>(ref: ForwardedRef<T>, node: T | null) {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }
  if (ref) ref.current = node;
}

function useErrorFocus<T extends HTMLElement>(error?: string, focusOnError?: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (error && focusOnError) ref.current?.focus();
  }, [error, focusOnError]);
  return ref;
}

function useFieldIds(description?: string, error?: string) {
  const id = useId();
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return { id, describedBy };
}

function FieldNotes({ id, description, error, reserveErrorLine }: { id: string; description?: string; error?: string; reserveErrorLine?: boolean }) {
  const reduce = useReducedMotion();
  const showError = Boolean(error) || Boolean(reserveErrorLine);
  return <>
    {description && <p id={`${id}-description`} className="text-xs leading-[18px] text-muted-foreground">{description}</p>}
    <div className={cn(reserveErrorLine ? 'min-h-4' : 'contents')}>
      <AnimatePresence initial={false}>
        {error ? <motion.p
          id={`${id}-error`}
          role="alert"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -2, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -2, filter: 'blur(4px)' }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
          className="flex items-baseline gap-1 text-xs leading-[18px] text-[color:var(--es-error-text)]"
        ><Icon name="AlertCircle" purpose="small" />{error}</motion.p> : null}
      </AnimatePresence>
    </div>
  </>;
}

const TEXT_INPUT_BASE = 'box-border w-full min-w-0 px-2.5 text-sm leading-[20px] tracking-normal border border-input rounded-lg bg-field text-input-text placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed read-only:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-transparent focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_var(--es-focus-ring)] aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:border-destructive aria-[invalid=true]:focus-visible:shadow-[0_0_0_3px_var(--es-error-ring)]';
const TEXT_INPUT_SETTINGS = 'h-9 py-1 pointer-coarse:h-11 pointer-coarse:py-0 pointer-coarse:text-lg pointer-coarse:leading-6';
const TEXT_INPUT_CONNECTION = 'h-10 py-1 px-4 text-[14px] leading-4 rounded-xl pointer-coarse:h-10 pointer-coarse:text-lg pointer-coarse:leading-6';

/** Shake the field once when a new error appears — adopted from beUI `input` (state intent + reduce-motion guard). */
function useErrorShake<T extends HTMLElement>(error?: string) {
  const ref = useRef<T>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!ref.current || reduce || !error) return;
    animate(ref.current, { x: [0, -3, 3, -2, 2, 0] }, { duration: 0.28, ease: [0.36, 0.07, 0.19, 0.97] });
  }, [error, reduce]);
  return ref;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({ label, value, onChange, description, error, placeholder, disabled, readOnly, name, autoComplete, inputMode, spellCheck, focusOnError, reserveErrorLine, purpose = 'settings', type = 'text' }, forwardedRef) {
  const { id, describedBy } = useFieldIds(description, error);
  const inputRef = useErrorFocus<HTMLInputElement>(error, focusOnError);
  const shakeRef = useErrorShake<HTMLDivElement>(error);
  const sizeClass = purpose === 'connection' ? TEXT_INPUT_CONNECTION : TEXT_INPUT_SETTINGS;
  return <div className="grid gap-2 min-w-0" ref={shakeRef}>
    <label htmlFor={id} className="text-sm font-medium leading-4 tracking-normal text-foreground">{label}</label>
    <input ref={node => { inputRef.current = node; setForwardedRef(forwardedRef, node); }} id={id} type={type} name={name} autoComplete={autoComplete} inputMode={inputMode} spellCheck={spellCheck} data-purpose={purpose} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} readOnly={readOnly} aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy} className={cn(TEXT_INPUT_BASE, sizeClass)} />
    <FieldNotes id={id} description={description} error={error} reserveErrorLine={reserveErrorLine} />
  </div>;
});
TextField.displayName = 'TextField';

export const TextAreaField = forwardRef<HTMLTextAreaElement, FieldProps>(function TextAreaField({ label, value, onChange, description, error, placeholder, disabled, readOnly, name, autoComplete, inputMode, spellCheck, focusOnError, reserveErrorLine }, forwardedRef) {
  const { id, describedBy } = useFieldIds(description, error);
  const inputRef = useErrorFocus<HTMLTextAreaElement>(error, focusOnError);
  const shakeRef = useErrorShake<HTMLDivElement>(error);
  return <div className="grid gap-2 min-w-0" ref={shakeRef}>
    <label htmlFor={id} className="text-sm font-medium leading-4 tracking-normal text-foreground">{label}</label>
    <textarea ref={node => { inputRef.current = node; setForwardedRef(forwardedRef, node); }} id={id} name={name} autoComplete={autoComplete} inputMode={inputMode} spellCheck={spellCheck} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} readOnly={readOnly} aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy} className={cn(TEXT_INPUT_BASE, 'min-h-25 py-2 resize-y align-top')} />
    <FieldNotes id={id} description={description} error={error} reserveErrorLine={reserveErrorLine} />
  </div>;
});
TextAreaField.displayName = 'TextAreaField';

export const SearchField = forwardRef<HTMLInputElement, {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean;
  name?: string; autoComplete?: string; inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']; spellCheck?: boolean;
}>(function SearchField({ label, value, onChange, placeholder, disabled, name, autoComplete, inputMode, spellCheck }, forwardedRef) {
  const id = useId();
  return <label htmlFor={id} className={cn('box-border flex items-center gap-2 h-8 min-w-0 px-2.5 border border-input rounded-lg bg-surface text-sm leading-5 tracking-normal', 'transition-colors focus-within:border-ring focus-within:shadow-[0_0_0_3px_var(--es-focus-ring)] focus-within:outline-transparent', 'has-[input:disabled]:opacity-50 pointer-coarse:h-11')}>
    <span aria-hidden className="flex items-center text-muted-foreground"><Icon name="Search" purpose="action" /></span>
    <span className="sr-only">{label}</span>
    <input ref={forwardedRef} id={id} type="search" name={name} autoComplete={autoComplete} inputMode={inputMode} spellCheck={spellCheck} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} className="min-w-0 w-full h-full p-0 border-0 bg-transparent text-sm leading-5 text-foreground placeholder:text-muted-foreground focus:outline-none" />
  </label>;
});
SearchField.displayName = 'SearchField';

type ToggleProps = { label: string; checked: boolean; onChange: (checked: boolean) => void; description?: string; disabled?: boolean };

const TOGGLE_LABEL = 'text-sm leading-[20px] tracking-normal text-foreground flex flex-col gap-1 min-w-0 break-words';
const TOGGLE_DESCRIPTION = 'text-xs leading-[18px] text-muted-foreground';
const TOGGLE_WRAPPER = 'relative box-border inline-flex items-center gap-2 min-h-8 cursor-pointer max-w-full pointer-coarse:min-h-11 data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed';

export function Checkbox({ label, checked, onChange, description, disabled }: ToggleProps) {
  const id = useId();
  const reduce = useReducedMotion();
  return <label data-disabled={disabled || undefined} className={cn('es-checkbox', TOGGLE_WRAPPER)}>
    <input type="checkbox" className="peer absolute inset-0 z-10 w-full h-full p-0 m-0 opacity-0" checked={checked} onChange={event => onChange(event.target.checked)} disabled={disabled} aria-describedby={description ? id : undefined} />
    <span aria-hidden className={cn('es-checkbox-box peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ring relative inline-flex shrink-0 items-center justify-center h-4 w-4 rounded-md border', 'border-input bg-surface text-bg', checked && 'border-foreground bg-foreground text-background')}>
      <AnimatePresence initial={false}>
        {checked ? <motion.span
          key="check"
          initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
          transition={reduce ? { duration: 0 } : { duration: 0.16, ease: EASE_OUT }}
          className="inline-flex"
        ><Icon name="Check" purpose="small" /></motion.span> : null}
      </AnimatePresence>
    </span>
    <span className={TOGGLE_LABEL}><span>{label}</span>{description && <small id={id} className={TOGGLE_DESCRIPTION}>{description}</small>}</span>
  </label>;
}

export function Switch({ label, checked, onChange, description, disabled }: ToggleProps) {
  const id = useId();
  const reduce = useReducedMotion();
  return <label data-disabled={disabled || undefined} className={cn('es-switch', TOGGLE_WRAPPER, 'justify-between gap-4 py-2.5')}>
    <span className={cn(TOGGLE_LABEL, 'font-medium')}><span id={`${id}-label`}>{label}</span>{description && <small id={id} className={cn(TOGGLE_DESCRIPTION, 'text-xs leading-4')}>{description}</small>}</span>
    <input type="checkbox" role="switch" className="peer absolute inset-0 z-10 w-full h-full p-0 m-0 opacity-0" checked={checked} onChange={event => onChange(event.target.checked)} disabled={disabled} aria-labelledby={`${id}-label`} aria-describedby={description ? id : undefined} />
    <span aria-hidden className={cn('peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ring relative inline-flex shrink-0 items-center w-8 h-[18.4px] px-0 rounded-full border', 'border-input bg-switch-off', checked && 'border-info bg-info')}>
      <motion.span
        aria-hidden
        animate={{ x: reduce || !checked ? 0 : 14 }}
        transition={reduce ? { duration: 0 } : { duration: 0.18, ease: EASE_OUT }}
        className="block h-4 w-4 rounded-full bg-switch-thumb"
      />
    </span>
  </label>;
}

type Choice = { id: string; label: string; disabled?: boolean };

/** Pill: 22px span (24px container incl. padding) · 13px label · joined: 36px row · label maintained as radiogroup with Arrow nav.
 *  Legacy class hooks (.es-segmented-choice, .es-segmented-choice-span) preserved for theme CSS like
 *  patterns.css `.es-account-appearance .es-segmented-choice > span { min-height: 20px }`. */
const SEGMENTED_PILL = 'box-border inline-flex items-stretch min-w-0 max-w-full overflow-x-auto overscroll-x-contain [scroll-padding-inline:4px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-0.5 p-px rounded-full bg-subtle';
const SEGMENTED_JOINED = 'box-border inline-flex items-stretch min-w-0 max-w-full overflow-x-auto overscroll-x-contain [scroll-padding-inline:4px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-0 h-9 rounded-lg bg-transparent shadow-[inset_0_0_0_1px_var(--es-border)]';
const SEGMENTED_CHOICE = 'es-segmented-choice relative min-w-0 flex-none cursor-pointer';
const SEGMENTED_SPAN_PILL = 'es-segmented-choice-span relative flex items-center justify-center min-h-[22px] px-2 rounded-full text-muted-foreground text-xs leading-4 tracking-normal font-medium whitespace-nowrap transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[-2px] peer-focus-visible:outline-ring';
const SEGMENTED_SPAN_JOINED = 'es-segmented-choice-span relative flex items-center justify-center h-9 rounded-none bg-sidebar text-xs leading-4 tracking-normal font-medium whitespace-nowrap first:rounded-l-lg last:rounded-r-lg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[-2px] peer-focus-visible:outline-ring';
const SEGMENTED_SPAN_CHECKED = 'text-foreground';
const SEGMENTED_INDICATOR = 'pointer-events-none absolute inset-0 rounded-[inherit] bg-surface shadow-[0_1px_2px_var(--es-border)]';

function getScrollBounds(group: HTMLDivElement, rtl: boolean) {
  const maxScroll = Math.max(0, group.scrollWidth - group.clientWidth);
  if (!rtl || maxScroll === 0) return { min: 0, max: maxScroll };
  const initial = group.scrollLeft;
  group.scrollLeft = maxScroll;
  const positive = group.scrollLeft;
  group.scrollLeft = -maxScroll;
  const negative = group.scrollLeft;
  group.scrollLeft = initial;
  return { min: Math.min(positive, negative), max: Math.max(positive, negative) };
}

export function SegmentedControl({ label, value, options, onChange, variant = 'pill' }: {
  label: string; value: string; options: Choice[]; onChange: (value: string) => void; variant?: 'pill' | 'joined';
}) {
  const name = useId();
  const reduce = useReducedMotion() ?? false;
  const groupRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [keyboardTarget, setKeyboardTarget] = useState<string | null>(null);
  useEffect(() => {
    if (keyboardTarget === value) setKeyboardTarget(null);
  }, [keyboardTarget, value]);
  const navigate = (event: KeyboardEvent<HTMLInputElement>, current: string) => {
    const allowed = variant === 'pill' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!allowed.includes(event.key)) return;
    event.preventDefault();
    const enabled = options.filter(option => !option.disabled);
    if (!enabled.length) return;
    const index = enabled.findIndex(option => option.id === current);
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : ((index + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + enabled.length) % enabled.length);
    const next = enabled[nextIndex];
    if (!next) return;
    setKeyboardTarget(next.id);
    onChange(next.id);
    const input = inputRefs.current[next.id];
    input?.focus({ preventScroll: true });
    const group = groupRef.current;
    const choice = input?.parentElement;
    if (group && choice) {
      const groupRect = group.getBoundingClientRect();
      const choiceRect = choice.getBoundingClientRect();
      const padding = 4;
      const rtl = getComputedStyle(group).direction === 'rtl';
      const leadingOverflow = rtl
        ? choiceRect.right > groupRect.right - padding
        : choiceRect.left < groupRect.left + padding;
      const trailingOverflow = rtl
        ? choiceRect.left < groupRect.left + padding
        : choiceRect.right > groupRect.right - padding;
      const delta = leadingOverflow
        ? rtl ? choiceRect.right - (groupRect.right - padding) : choiceRect.left - (groupRect.left + padding)
        : trailingOverflow
          ? rtl ? choiceRect.left - (groupRect.left + padding) : choiceRect.right - (groupRect.right - padding)
          : 0;
      const bounds = getScrollBounds(group, rtl);
      const nextScroll = Math.max(bounds.min, Math.min(bounds.max, group.scrollLeft + delta));
      if (nextScroll !== group.scrollLeft) group.scrollTo({ left: nextScroll, behavior: 'auto' });
    }
  };
  const listCls = variant === 'joined' ? SEGMENTED_JOINED : SEGMENTED_PILL;
  const spanCls = variant === 'joined' ? SEGMENTED_SPAN_JOINED : SEGMENTED_SPAN_PILL;
  return <LayoutGroup id={`${name}-layout`}><div ref={groupRef} className={cn('es-segmented-control', listCls)} data-variant={variant} role="radiogroup" aria-label={label}>{options.map(option => {
    const selected = value === option.id;
    return <label key={option.id} className={SEGMENTED_CHOICE}><input ref={input => { inputRefs.current[option.id] = input; }} type="radio" name={name} value={option.id} checked={selected} disabled={option.disabled} onChange={() => onChange(option.id)} onKeyDown={event => navigate(event, option.id)} className="absolute w-px h-px p-0 m-0 opacity-0 peer" /><motion.span whileTap={reduce || option.disabled ? undefined : { scale: 0.92 }} transition={SPRING_PRESS} className={cn(spanCls, selected && SEGMENTED_SPAN_CHECKED)}>{selected && <motion.span layoutId={`${name}-indicator`} initial={false} transition={reduce || keyboardTarget === value ? { duration: 0 } : SPRING_LAYOUT} className={SEGMENTED_INDICATOR} aria-hidden="true" data-segmented-indicator /> }<span className="relative z-10">{option.label}</span></motion.span></label>;
  })}</div></LayoutGroup>;
}

const TABS_LIST_ACTIVITY = 'inline-flex items-center gap-0.5 max-w-full min-h-[30px] p-0.5 border border-border-subtle rounded-lg bg-subtle pointer-coarse:min-h-11';
const TABS_TAB_ACTIVITY = 'flex-1 min-w-0 min-h-6 px-2 border-0 rounded-md bg-transparent text-secondary text-xs leading-4 font-medium whitespace-nowrap cursor-pointer pointer-coarse:min-h-11 transition-colors motion-reduce:transition-none';
const TABS_TAB_CONNECTION = 'min-h-7 px-2 border border-transparent rounded-lg text-sm leading-4 transition-colors motion-reduce:transition-none';
const TABS_TAB_SELECTED = 'bg-surface text-foreground shadow-[0_1px_2px_var(--es-border)]';

export function Tabs({ label, value, items, onChange, variant = 'activity' }: {
  label: string; value: string; items: (Choice & { content: ReactNode })[]; onChange: (value: string) => void; variant?: 'activity' | 'connection' | 'settings';
}) {
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const selected = items.find(item => item.id === value && !item.disabled) ?? items.find(item => !item.disabled);
  const navigate = (event: KeyboardEvent<HTMLButtonElement>, current: string) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const enabled = items.filter(item => !item.disabled);
    const index = enabled.findIndex(item => item.id === current);
    const rtl = variant === 'settings' && list.current && getComputedStyle(list.current).direction === 'rtl';
    const direction = (event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1);
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : (index + direction + enabled.length) % enabled.length;
    const next = enabled[nextIndex];
    if (!next) return;
    onChange(next.id);
    list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[items.indexOf(next)]?.focus();
  };
  const connectionListStyle = variant === 'connection' ? { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`, minWidth: '560px' } : undefined;
  const tabList = <div ref={list} className={cn(variant === 'connection' && 'grid items-center gap-0 w-full min-h-9 p-1 border-0 rounded-xl bg-subtle', variant === 'activity' && TABS_LIST_ACTIVITY, variant === 'settings' && 'es-tabs-list flex items-stretch gap-1 w-full min-w-0 px-1 pt-1 pb-0 border-0 border-b border-border rounded-none bg-transparent overflow-x-auto overscroll-x-contain [scrollbar-width:thin] [scroll-padding-inline:4px]')} role="tablist" aria-label={label} style={connectionListStyle}>{items.map((item, index) => {
    const active = selected?.id === item.id;
    return <button key={item.id} id={`${id}-tab-${index}`} type="button" role="tab" aria-controls={`${id}-panel-${index}`} aria-selected={active} tabIndex={active ? 0 : -1} disabled={item.disabled} onClick={() => onChange(item.id)} onKeyDown={event => navigate(event, item.id)} className={cn(variant === 'connection' && TABS_TAB_CONNECTION, variant === 'activity' && TABS_TAB_ACTIVITY, variant === 'settings' && 'es-settings-tab relative flex-none min-h-12 border-none px-0 pb-2 pt-0.5 rounded-md bg-transparent shadow-none text-sm leading-5 font-normal', active && (variant !== 'settings') && TABS_TAB_SELECTED)}>{variant === 'settings' ? <><span className="es-settings-tab-label block px-2.5 py-2 rounded-md">{item.label}</span>{active && <motion.span layoutId={`${id}-settings-indicator`} initial={false} transition={reduce ? { duration: 0 } : SPRING_LAYOUT} className="es-settings-tab-indicator" data-tabs-indicator aria-hidden="true" />}</> : item.label}</button>;
  })}</div>;
  // `rounded-[16px]` is an arbitrary value: BEDS tokens only ship --radius (8px) and the Tailwind scale
  // (rounded-xl = 10px, rounded-2xl = 14px). 16px has no token, so the connection Tabs radius stays as an
  // explicit arbitrary value. Same convention as `rounded-[12px]` on the welcome variant.
  return <LayoutGroup id={id}><div className={cn('es-tabs min-w-0', variant === 'connection' && 'rounded-[16px] overflow-hidden border border-border-subtle shadow-[0_1px_2px_var(--es-border-subtle)]')} data-variant={variant}>{variant === 'connection' ? <div className="es-tabs-connection-strip contain-inline-size w-full max-w-full min-w-0 overflow-x-auto p-2 border-b border-border-subtle">{tabList}</div> : tabList}{items.map((item, index) => <div key={item.id} id={`${id}-panel-${index}`} className={cn(variant === 'connection' ? 'es-tab-panel m-0 px-8 pt-4 pb-8 border-0 min-w-0' : variant === 'settings' ? 'mt-6 min-w-0' : 'mt-4 min-w-0', variant !== 'connection' && 'es-tab-panel')} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} hidden={selected?.id !== item.id} tabIndex={0}>{item.content}</div>)}</div></LayoutGroup>;
}
