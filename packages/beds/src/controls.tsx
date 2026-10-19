import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ForwardedRef, type InputHTMLAttributes, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from 'react';
import { AnimatePresence, animate, cancelFrame, frame, LayoutGroup, motion } from 'motion/react';
import { Icon, type IconName } from './foundation';
import { cn } from './lib/utils';
import { EASE_OUT } from './lib/ease';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';
import './controls.css';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

type ButtonProps = {
  label: string; onClick?: () => void; type?: 'button' | 'submit' | 'reset';
  /** `secondary` bordered surface (default) · `primary` neutral fill · `outline` transparent pill with a hairline: the focal call to action, usually with `icon="ArrowRight" iconPosition="end"` · `ghost` quiet text action · `destructive` error outline, never a red fill. */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  /** Small pill (32px). Default is the medium pill (40px, 44px on coarse pointers). */
  compact?: boolean;
  icon?: IconName;
  /** Side of the label the icon sits on; status glyphs (spinner, check, cross) take the same slot. */
  iconPosition?: 'start' | 'end';
  /** @deprecated Accepted for compatibility. Every button shares one geometry since 0.3. */
  purpose?: 'default' | 'welcome' | 'connection';
  disabled?: boolean;
  /** Shorthand for `state="loading"`: the spinner takes the icon slot and the button is inactive. */
  busy?: boolean;
  /** Async lifecycle. Loading disables the button; success and error swap the glyph. A changed label rolls letter by letter. */
  state?: ButtonState;
  loadingLabel?: string; successLabel?: string; errorLabel?: string;
  /** Accessible name when the visible label needs more context. */
  accessibleLabel?: string;
  'aria-describedby'?: string;
  /** Disclosure toggles: expose the expanded state of the controlled region. */
  'aria-expanded'?: boolean; 'aria-controls'?: string;
};

/* beUI Button + StatefulButton (https://beui.dev/r/button-stateful, MIT), as ported and tuned in the reference app:
   pill md 40 (44 on touch) / sm 32, 14/12px medium, pointer-only .97 press with a short spring release,
   no hover lift, a fixed 24px status slot and a letter roll capped at 60ms. Colors resolve through BEDS tokens. */
const BUTTON_BASE = 'es-button relative box-border inline-flex shrink-0 items-center justify-center max-w-full m-0 border border-solid border-transparent font-medium tracking-normal text-center no-underline cursor-pointer select-none [-webkit-tap-highlight-color:transparent] transition-[color,background-color,border-color] duration-150 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

const BUTTON_VARIANT: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'border-border bg-surface text-[color:var(--es-heading)]',
  outline: 'border-border bg-transparent text-[color:var(--es-heading)] hover:bg-[var(--es-hover-soft)]',
  ghost: 'bg-transparent text-muted-foreground hover:bg-[var(--es-hover-soft)] hover:text-[color:var(--es-heading)]',
  destructive: 'border-[color:var(--es-destructive-border)] bg-transparent text-[color:var(--es-error-text)] hover:bg-[var(--es-error-subtle)]',
};

/** md grows to the 44px touch target; sm keeps its 32px pill and pads its hit area vertically (no horizontal overflow). */
const BUTTON_SIZE = {
  md: 'min-h-10 px-5 py-1.5 gap-2 rounded-full text-[14px] leading-5 pointer-coarse:min-h-11',
  sm: 'min-h-8 px-3 py-0 gap-1.5 rounded-full text-[12px] leading-4 pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-1.5 pointer-coarse:before:content-[""]',
} as const;

const PRESS_IN = { duration: 0.12, ease: EASE_OUT } as const;
const PRESS_RELEASE = { type: 'spring', duration: 0.16, bounce: 0.15 } as const;
const LETTER_IN = { duration: 0.14, ease: EASE_OUT } as const;
const LETTER_OUT = { duration: 0.1, ease: EASE_OUT } as const;
const ROLL_SETTLE_MS = 260;
const GLYPH_IN = { duration: 0.18, ease: EASE_OUT } as const;
const GLYPH_OUT = { duration: 0.1, ease: EASE_OUT } as const;

function letterDelay(index: number, length: number) {
  return index * 0.06 / Math.max(1, length - 1);
}

/** Steady state is plain text that can wrap when a narrow container demands it; the roll only lives for one transition. */
function ButtonLabel({ text, instant }: { text: string; instant: boolean }) {
  const [shown, setShown] = useState(text);
  const [roll, setRoll] = useState<{ from: string; to: string; key: number } | null>(null);
  if (text !== shown) {
    setShown(text);
    setRoll(instant ? null : { from: shown, to: text, key: (roll?.key ?? 0) + 1 });
  }
  useEffect(() => {
    if (!roll) return;
    const timer = window.setTimeout(() => setRoll(null), ROLL_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [roll]);
  if (!roll) return <span className="es-button-label min-w-0 [overflow-wrap:anywhere] [text-wrap:balance]">{text}</span>;
  const letters = (value: string) => value.split('');
  return <span className="es-button-label relative inline-block min-w-0 overflow-hidden whitespace-nowrap align-bottom">
    <span aria-hidden className="invisible inline-block whitespace-nowrap">{letters(roll.to).map((char, index) => <span key={index} className="inline-block whitespace-pre">{char}</span>)}</span>
    <span className="sr-only">{roll.to}</span>
    <span key={`from-${roll.key}`} aria-hidden className="absolute start-0 top-0 inline-block whitespace-pre">{letters(roll.from).map((char, index) => <motion.span key={index} className="inline-block whitespace-pre" initial={{ opacity: 1, y: '0%' }} animate={{ opacity: 0, y: '-105%' }} transition={{ ...LETTER_OUT, delay: letterDelay(index, roll.from.length) * 0.5 }}>{char}</motion.span>)}</span>
    <span key={`to-${roll.key}`} aria-hidden className="absolute start-0 top-0 inline-block whitespace-pre">{letters(roll.to).map((char, index) => <motion.span key={index} className="inline-block whitespace-pre" initial={{ opacity: 0, y: '105%' }} animate={{ opacity: 1, y: '0%' }} transition={{ ...LETTER_IN, delay: letterDelay(index, roll.to.length) }}>{char}</motion.span>)}</span>
  </span>;
}

function ButtonGlyph({ name, spin, reduce }: { name: IconName; spin: boolean; reduce: boolean }) {
  if (!spin || reduce) return <Icon name={name} purpose="action" />;
  return <motion.span className="inline-flex" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Icon name={name} purpose="action" /></motion.span>;
}

export function Button(props: ButtonProps) {
  return <ButtonFrame {...props} />;
}

/** Internal frame shared with ExpandingButton: `mark` adds a decorative leading brand glyph (provider logos) that is never part of the public Button API. */
export function ButtonFrame({ label, onClick, type = 'button', variant = 'secondary', compact = false, icon, iconPosition = 'start', mark, disabled, busy, state: stateProp, loadingLabel, successLabel, errorLabel, accessibleLabel, 'aria-describedby': describedBy, 'aria-expanded': ariaExpanded, 'aria-controls': ariaControls }: ButtonProps & { mark?: ReactNode }) {
  const reduce = useReducedMotionPreference();
  const state: ButtonState = stateProp ?? (busy ? 'loading' : 'idle');
  const loading = state === 'loading';
  const [pressed, setPressed] = useState(false);
  // Keyboard activation and reduced motion change state instantly: no roll, no glyph crossfade.
  const [keyboard, setKeyboard] = useState(false);
  const instant = reduce || keyboard;
  const pressable = !disabled && !loading && !reduce;
  const text = state === 'loading' ? loadingLabel ?? label : state === 'success' ? successLabel ?? label : state === 'error' ? errorLabel ?? label : label;
  // The letter roll marks status changes only: a new caller label (copy, locale) swaps in place, so long copy never rolls on one line past a narrow container.
  const lastState = useRef(state);
  const statusChange = lastState.current !== state;
  useEffect(() => { lastState.current = state; }, [state]);
  const glyph: IconName | undefined = state === 'loading' ? 'Loader2' : state === 'success' ? 'Check' : state === 'error' ? 'X' : icon;
  const release = () => setPressed(false);
  const slot = glyph && <span aria-hidden className="es-button-glyph relative inline-grid size-6 shrink-0 place-items-center overflow-hidden">
    {instant ? <span className="absolute inset-0 grid place-items-center"><ButtonGlyph name={glyph} spin={loading} reduce={reduce} /></span> : <AnimatePresence initial={false}>
      <motion.span key={state === 'idle' ? `icon-${glyph}` : state} className="absolute inset-0 grid place-items-center" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1, transition: GLYPH_IN }} exit={{ opacity: 0, scale: 0.96, transition: GLYPH_OUT }}><ButtonGlyph name={glyph} spin={loading} reduce={reduce} /></motion.span>
    </AnimatePresence>}
  </span>;
  return <motion.button
    type={type}
    onClick={event => {
      // Loading keeps the button focusable (focus never drops to the body) but inert: no repeat action or form submit.
      if (loading) { event.preventDefault(); return; }
      setKeyboard(event.detail === 0); onClick?.();
    }}
    onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setKeyboard(true); }}
    onPointerDown={event => { setKeyboard(false); if (event.isPrimary && event.button === 0 && pressable) setPressed(true); }}
    onPointerUp={release}
    onPointerLeave={release}
    onPointerCancel={release}
    disabled={disabled}
    aria-disabled={loading || undefined}
    aria-busy={loading || undefined}
    aria-label={accessibleLabel}
    aria-describedby={describedBy}
    aria-expanded={ariaExpanded}
    aria-controls={ariaControls}
    data-variant={variant}
    data-compact={compact || undefined}
    data-state={state === 'idle' ? undefined : state}
    initial={false}
    animate={{ scale: pressed && pressable ? 0.97 : 1 }}
    transition={reduce ? { duration: 0 } : pressed ? PRESS_IN : PRESS_RELEASE}
    className={cn(BUTTON_BASE, BUTTON_VARIANT[variant], BUTTON_SIZE[compact ? 'sm' : 'md'])}
  >
    <span aria-live="polite" className="es-button-row relative inline-flex min-w-0 max-w-full items-center justify-center">
      {mark && <span aria-hidden className="es-button-mark inline-grid size-6 shrink-0 place-items-center [&_svg]:size-4">{mark}</span>}
      {iconPosition === 'start' && slot}
      <ButtonLabel text={text} instant={instant || !statusChange} />
      {iconPosition === 'end' && slot}
    </span>
  </motion.button>;
}

// Press feedback for icon controls lives on an inert child: the measured box never scales and keyboard activation stays instant.
function usePointerPress() {
  const [pointerPressed, setPointerPressed] = useState(false);
  const stop = () => setPointerPressed(false);
  const start = (event: PointerEvent<HTMLButtonElement>) => {
    setPointerPressed(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  return {
    pointerPressed,
    'data-pointer-pressed': pointerPressed || undefined,
    onPointerDown: start,
    onPointerUp: stop,
    onPointerCancel: stop,
    onLostPointerCapture: stop,
  };
}

export function IconButton({ label, icon, onClick, disabled, ref, onKeyDown, 'aria-describedby': describedBy, 'aria-haspopup': hasPopup, 'aria-expanded': expanded, 'aria-controls': controls }: {
  label: string; icon: IconName; onClick: () => void; disabled?: boolean; 'aria-describedby'?: string;
  /** Semantic composition for anchored menus and dialogs; never a styling escape. */
  ref?: ForwardedRef<HTMLButtonElement>; onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  'aria-haspopup'?: 'menu' | 'dialog' | 'listbox'; 'aria-expanded'?: boolean; 'aria-controls'?: string;
}) {
  const reduce = useReducedMotionPreference();
  const { pointerPressed, ...pointerPress } = usePointerPress();
  return <motion.button
    type="button"
    aria-label={label}
    aria-describedby={describedBy}
    ref={ref}
    onKeyDown={onKeyDown}
    aria-haspopup={hasPopup}
    aria-expanded={expanded}
    aria-controls={controls}
    onClick={onClick}
    disabled={disabled}
    {...pointerPress}
    transition={{ duration: 0.12, ease: EASE_OUT }}
    className={cn(
      'es-icon-button box-border inline-flex items-center justify-center shrink-0 border-0',
      'min-h-8 min-w-8 rounded-lg bg-transparent text-muted-foreground cursor-pointer',
      'transition-colors hover:text-[color:var(--es-heading)] hover:bg-[var(--es-hover-soft)]',
      'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      'pointer-coarse:min-h-11 pointer-coarse:min-w-11',
    )}
  ><motion.span className="inline-flex" animate={{ scale: pointerPressed && !reduce ? 0.97 : 1 }} transition={{ duration: reduce ? 0 : 0.12, ease: EASE_OUT }}><Icon name={icon} purpose="action" /></motion.span></motion.button>;
}

/** Controlled compact toggle with a native pressed state and persistent accessible name. */
export function IconToggleButton({ label, icon, pressed, onPressedChange, disabled, 'aria-describedby': describedBy }: {
  label: string; icon: IconName; pressed: boolean; onPressedChange: (pressed: boolean) => void; disabled?: boolean; 'aria-describedby'?: string;
}) {
  const reduce = useReducedMotionPreference();
  const { pointerPressed, ...pointerPress } = usePointerPress();
  return <motion.button
    type="button"
    aria-label={label}
    aria-pressed={pressed}
    aria-describedby={describedBy}
    onClick={() => onPressedChange(!pressed)}
    disabled={disabled}
    {...pointerPress}
    transition={{ duration: 0.12, ease: EASE_OUT }}
    className={cn(
      'es-icon-toggle-button box-border inline-flex items-center justify-center shrink-0 border-0',
      'min-h-8 min-w-8 rounded-lg bg-transparent text-muted-foreground cursor-pointer',
      'transition-colors hover:text-[color:var(--es-heading)] hover:bg-[var(--es-hover-soft)]',
      'aria-pressed:bg-accent aria-pressed:text-foreground aria-pressed:[&_svg]:fill-current',
      'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      'pointer-coarse:min-h-11 pointer-coarse:min-w-11',
    )}
  ><motion.span className="inline-flex" animate={{ scale: pointerPressed && !reduce ? 0.97 : 1 }} transition={{ duration: reduce ? 0 : 0.12, ease: EASE_OUT }}><Icon name={icon} purpose="action" /></motion.span></motion.button>;
}

type FieldProps = {
  label: string; value: string; onChange: (value: string) => void; description?: string;
  /** A gentle note under the field (amber glyph) asking the person to check the value; it never blocks anything. */
  warning?: string;
  error?: string; placeholder?: string; disabled?: boolean; readOnly?: boolean;
  name?: string; autoComplete?: string; inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']; spellCheck?: boolean; focusOnError?: boolean;
  /** Keep the error slot occupied while there is no error, so appearing errors never shift the layout below. */
  reserveErrorLine?: boolean;
  /** Native length limit; the caller still owns validation copy. */
  maxLength?: number;
};

/** `field` (default) = product form field with the beUI `input` anatomy (44px pill, 16px text, label inset 4px);
 *  `settings` = dense admin and settings rows (36px); `connection` = measured connection flows. */
type TextFieldProps = FieldProps & {
  purpose?: 'field' | 'settings' | 'connection'; type?: 'text' | 'email' | 'url' | 'tel' | 'password' | 'search';
  enterKeyHint?: InputHTMLAttributes<HTMLInputElement>['enterKeyHint'];
  /** One small action inside the pill, at its trailing edge (the reference app's coupon "Aplicar"): the sm secondary `Button`,
   *  disabled with the field. Wrap the field in a form whose submit runs the same action so Enter applies it. The caller owns the request. */
  action?: { label: string; onClick: () => void; busy?: boolean };
};
type TextAreaFieldProps = FieldProps & { purpose?: 'field' | 'settings' };

type DateFieldProps = Omit<FieldProps, 'placeholder' | 'inputMode' | 'spellCheck' | 'maxLength'> & {
  /** Inclusive ISO-8601 calendar-date bounds delegated to the native date input. */
  min?: string;
  max?: string;
  /** Native required semantics; validation and recovery remain caller-owned. */
  required?: boolean;
  purpose?: 'field' | 'settings';
};

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

function useFieldIds(description?: string, error?: string, warning?: string) {
  const id = useId();
  const describedBy = [description && `${id}-description`, warning && `${id}-warning`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return { id, describedBy };
}

/** Product fields (beUI input): 12px notes inset 4px, error settles in from a 4px blur. Dense settings rows keep the leading alert glyph.
 *  A warning is the description line led by an amber glyph (the reference app's Field): it enters and leaves like the error. */
function FieldNotes({ id, description, warning, error, reserveErrorLine, product }: { id: string; description?: string; warning?: string; error?: string; reserveErrorLine?: boolean; product: boolean }) {
  const reduce = useReducedMotionPreference();
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: 'blur(4px)' };
  return <>
    {description && <p id={`${id}-description`} className={cn('text-xs text-muted-foreground [text-wrap:pretty]', product ? 'px-1 leading-4' : 'leading-[18px]')}>{description}</p>}
    <AnimatePresence initial={false}>
      {warning ? <motion.p
        key="warning"
        id={`${id}-warning`}
        role="status"
        initial={hidden}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={hidden}
        transition={{ duration: 0.2, ease: EASE_OUT }}
        className={cn('es-field-warning flex items-start gap-1.5 text-xs text-muted-foreground [text-wrap:pretty] [&_svg]:mt-px [&_svg]:size-3.5 [&_svg]:flex-none [&_svg]:text-warning', product ? 'px-1 leading-4' : 'leading-[18px]')}
      ><Icon name="AlertCircle" purpose="small" />{warning}</motion.p> : null}
    </AnimatePresence>
    <div className={cn(reserveErrorLine ? 'min-h-4' : 'contents')}>
      <AnimatePresence initial={false}>
        {error ? <motion.p
          id={`${id}-error`}
          role="alert"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: 'blur(4px)' }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className={cn('text-xs text-[color:var(--es-error-text)]', product ? 'px-1 leading-4' : 'flex items-baseline gap-1 leading-[18px]')}
        >{!product && <Icon name="AlertCircle" purpose="small" />}{error}</motion.p> : null}
      </AnimatePresence>
    </div>
  </>;
}

/* Text entry: soft structural border (fieldBorder="soft" default) and, on focus, a heading-tinted border plus a 2px soft ring
   (beUI input, adopted from the reference app). The transparent outline keeps a visible Highlight ring in forced-colors mode. */
const TEXT_INPUT_BASE = 'box-border w-full min-w-0 tracking-normal border border-solid border-field-border bg-field text-input-text placeholder:text-[color:var(--es-placeholder-soft)] transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none disabled:opacity-60 disabled:cursor-not-allowed read-only:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-transparent focus-visible:border-[color:var(--es-field-focus-border)] focus-visible:shadow-[0_0_0_2px_var(--es-focus-ring)] aria-[invalid=true]:border-[color:var(--es-error-text)] aria-[invalid=true]:shadow-[0_0_0_2px_var(--es-error-ring)] aria-[invalid=true]:focus-visible:border-[color:var(--es-error-text)] aria-[invalid=true]:focus-visible:shadow-[0_0_0_2px_var(--es-error-ring)]';
const TEXT_INPUT_SETTINGS = 'h-9 py-1 px-2.5 text-sm leading-[20px] rounded-lg pointer-coarse:h-11 pointer-coarse:py-0 pointer-coarse:text-[16px] pointer-coarse:leading-6';
const TEXT_INPUT_CONNECTION = 'h-10 py-1 px-4 text-[14px] leading-4 rounded-xl pointer-coarse:h-10 pointer-coarse:text-[16px] pointer-coarse:leading-6';
/** beUI `input` anatomy (https://beui.dev/r/input): 44px pill, 14px inline padding, 16px text on every pointer. */
const TEXT_INPUT_FIELD = 'h-11 py-0 px-3.5 text-[16px] leading-6 rounded-full';
/** Product text area: grows with what is written from a 96px floor (`field-sizing: content` in controls.css; the page scrolls, never the field). */
const TEXT_AREA_FIELD = 'min-h-24 py-2.5 px-3.5 text-[16px] leading-6 rounded-[20px]';
const TEXT_AREA_SETTINGS = 'min-h-25 py-2 px-2.5 text-sm leading-[20px] rounded-lg pointer-coarse:text-[16px] pointer-coarse:leading-6';
/* A field with an inline action draws the pill on a wrapper so typed text never runs under the button: the ring follows the input's
   own focus (never the button's), and an error paints the wrapper. Same soft border, focus and error idiom as TEXT_INPUT_BASE. */
const ACTION_PILL_BASE = 'es-field-pill box-border flex items-center w-full min-w-0 gap-2 tracking-normal border border-solid border-field-border bg-field transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none has-[input:focus-visible]:border-[color:var(--es-field-focus-border)] has-[input:focus-visible]:shadow-[0_0_0_2px_var(--es-focus-ring)] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-0 has-[input:focus-visible]:outline-transparent data-[invalid]:border-[color:var(--es-error-text)] data-[invalid]:shadow-[0_0_0_2px_var(--es-error-ring)] data-[invalid]:has-[input:focus-visible]:border-[color:var(--es-error-text)] data-[invalid]:has-[input:focus-visible]:shadow-[0_0_0_2px_var(--es-error-ring)] has-[input:disabled]:opacity-60';
const ACTION_PILL_SIZE = {
  field: 'h-11 ps-3.5 pe-1.5 rounded-full text-[16px] leading-6',
  settings: 'h-9 ps-2.5 pe-0.5 rounded-lg text-sm leading-[20px] pointer-coarse:h-11 pointer-coarse:text-[16px] pointer-coarse:leading-6',
  connection: 'h-10 ps-4 pe-1 rounded-xl text-[14px] leading-4 pointer-coarse:text-[16px] pointer-coarse:leading-6',
} as const;
const ACTION_PILL_INPUT = 'min-w-0 flex-1 self-stretch m-0 p-0 border-0 bg-transparent text-input-text [font:inherit] tracking-normal placeholder:text-[color:var(--es-placeholder-soft)] focus:outline-none disabled:cursor-not-allowed read-only:text-muted-foreground';
const FIELD_STACK_PRODUCT = 'grid gap-1.5 min-w-0';
const FIELD_STACK_SETTINGS = 'grid gap-2 min-w-0';
const FIELD_LABEL_PRODUCT = 'px-1 text-[14px] leading-5 font-medium tracking-normal text-[color:var(--es-heading)]';
const FIELD_LABEL_SETTINGS = 'text-sm font-medium leading-4 tracking-normal text-foreground';

/** Shake the field once when a new error appears — beUI `input` values (6px, 450ms) with a reduce-motion guard. */
function useErrorShake<T extends HTMLElement>(error?: string) {
  const ref = useRef<T>(null);
  const reduce = useReducedMotionPreference();
  useEffect(() => {
    if (!ref.current || reduce || !error) return;
    animate(ref.current, { x: [0, -6, 6, -4, 4, -2, 0] }, { duration: 0.45 });
  }, [error, reduce]);
  return ref;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({ label, value, onChange, description, warning, error, placeholder, disabled, readOnly, name, autoComplete, inputMode, spellCheck, focusOnError, reserveErrorLine, maxLength, enterKeyHint, action, purpose = 'field', type = 'text' }, forwardedRef) {
  const { id, describedBy } = useFieldIds(description, error, warning);
  const inputRef = useErrorFocus<HTMLInputElement>(error, focusOnError);
  const shakeRef = useErrorShake<HTMLDivElement>(error);
  const product = purpose === 'field';
  const sizeClass = purpose === 'connection' ? TEXT_INPUT_CONNECTION : product ? TEXT_INPUT_FIELD : TEXT_INPUT_SETTINGS;
  const input = <input ref={node => { inputRef.current = node; setForwardedRef(forwardedRef, node); }} id={id} type={type} name={name} autoComplete={autoComplete} inputMode={inputMode} spellCheck={spellCheck} maxLength={maxLength} enterKeyHint={enterKeyHint} data-purpose={purpose} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} readOnly={readOnly} aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy} className={action ? ACTION_PILL_INPUT : cn(TEXT_INPUT_BASE, sizeClass)} />;
  return <div className={product ? FIELD_STACK_PRODUCT : FIELD_STACK_SETTINGS} ref={shakeRef}>
    <label htmlFor={id} className={product ? FIELD_LABEL_PRODUCT : FIELD_LABEL_SETTINGS}>{label}</label>
    {action ? <div className={cn(ACTION_PILL_BASE, ACTION_PILL_SIZE[purpose])} data-purpose={purpose} data-invalid={error ? '' : undefined}>
      {input}
      <span className="es-field-action inline-flex flex-none"><Button label={action.label} onClick={action.onClick} busy={action.busy} disabled={disabled} compact /></span>
    </div> : input}
    <FieldNotes id={id} description={description} warning={warning} error={error} reserveErrorLine={reserveErrorLine} product={product} />
  </div>;
});
TextField.displayName = 'TextField';

/**
 * A labelled native calendar-date field. It intentionally has no picker, locale
 * formatter or date arithmetic: browsers provide the platform date control while
 * callers retain ISO values, bounds, validation and any business-date policy.
 *
 * The visual/error anatomy is the beUI `input` adaptation already used by
 * TextField; beUI's wheel-picker was a no-fit for this native form control.
 */
export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(function DateField({ label, value, onChange, description, warning, error, disabled, readOnly, name, autoComplete, focusOnError, reserveErrorLine, min, max, required, purpose = 'field' }, forwardedRef) {
  const { id, describedBy } = useFieldIds(description, error, warning);
  const inputRef = useErrorFocus<HTMLInputElement>(error, focusOnError);
  const shakeRef = useErrorShake<HTMLDivElement>(error);
  const product = purpose === 'field';
  return <div className={product ? FIELD_STACK_PRODUCT : FIELD_STACK_SETTINGS} ref={shakeRef}>
    <label htmlFor={id} className={product ? FIELD_LABEL_PRODUCT : FIELD_LABEL_SETTINGS}>{label}</label>
    <input ref={node => { inputRef.current = node; setForwardedRef(forwardedRef, node); }} id={id} type="date" name={name} autoComplete={autoComplete} value={value} onChange={event => onChange(event.target.value)} min={min} max={max} required={required} disabled={disabled} readOnly={readOnly} aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy} className={cn(TEXT_INPUT_BASE, product ? TEXT_INPUT_FIELD : TEXT_INPUT_SETTINGS)} />
    <FieldNotes id={id} description={description} warning={warning} error={error} reserveErrorLine={reserveErrorLine} product={product} />
  </div>;
});
DateField.displayName = 'DateField';

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField({ label, value, onChange, description, warning, error, placeholder, disabled, readOnly, name, autoComplete, inputMode, spellCheck, focusOnError, reserveErrorLine, maxLength, purpose = 'field' }, forwardedRef) {
  const { id, describedBy } = useFieldIds(description, error, warning);
  const inputRef = useErrorFocus<HTMLTextAreaElement>(error, focusOnError);
  const shakeRef = useErrorShake<HTMLDivElement>(error);
  const product = purpose === 'field';
  return <div className={product ? FIELD_STACK_PRODUCT : FIELD_STACK_SETTINGS} ref={shakeRef}>
    <label htmlFor={id} className={product ? FIELD_LABEL_PRODUCT : FIELD_LABEL_SETTINGS}>{label}</label>
    <textarea ref={node => { inputRef.current = node; setForwardedRef(forwardedRef, node); }} id={id} name={name} autoComplete={autoComplete} inputMode={inputMode} spellCheck={spellCheck} maxLength={maxLength} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} readOnly={readOnly} aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy} data-purpose={purpose} className={cn('es-textarea', TEXT_INPUT_BASE, product ? TEXT_AREA_FIELD : TEXT_AREA_SETTINGS, 'resize-y align-top')} />
    <FieldNotes id={id} description={description} warning={warning} error={error} reserveErrorLine={reserveErrorLine} product={product} />
  </div>;
});
TextAreaField.displayName = 'TextAreaField';

/** `field` (default) = the product search pill (44px, leading glyph, 16px text); `settings` = the dense 32px toolbar search. */
export const SearchField = forwardRef<HTMLInputElement, {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean;
  name?: string; autoComplete?: string; inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']; spellCheck?: boolean;
  maxLength?: number; purpose?: 'field' | 'settings';
}>(function SearchField({ label, value, onChange, placeholder, disabled, name, autoComplete, inputMode, spellCheck, maxLength, purpose = 'field' }, forwardedRef) {
  const id = useId();
  const product = purpose === 'field';
  return <label htmlFor={id} data-purpose={purpose} className={cn(
    'es-search-field box-border flex items-center min-w-0 border border-solid border-field-border bg-field tracking-normal',
    'transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none',
    'focus-within:border-[color:var(--es-field-focus-border)] focus-within:shadow-[0_0_0_2px_var(--es-focus-ring)] focus-within:outline-2 focus-within:outline-offset-0 focus-within:outline-transparent',
    'has-[input:disabled]:opacity-60',
    product ? 'h-11 gap-2 ps-3 pe-3.5 rounded-full text-[16px] leading-6' : 'h-8 gap-2 px-2.5 rounded-lg text-sm leading-5 pointer-coarse:h-11',
  )}>
    <span aria-hidden className="flex items-center text-muted-foreground"><Icon name="Search" purpose="action" /></span>
    <span className="sr-only">{label}</span>
    <input ref={forwardedRef} id={id} type="search" name={name} autoComplete={autoComplete} inputMode={inputMode} spellCheck={spellCheck} maxLength={maxLength} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} className={cn('min-w-0 w-full h-full p-0 border-0 bg-transparent text-input-text placeholder:text-[color:var(--es-placeholder-soft)] focus:outline-none', product ? 'text-[16px] leading-6' : 'text-sm leading-5')} />
  </label>;
});
SearchField.displayName = 'SearchField';

type ToggleProps = { label: string; checked: boolean; onChange: (checked: boolean) => void; description?: string; disabled?: boolean };

const TOGGLE_LABEL = 'text-sm leading-[20px] tracking-normal text-foreground flex flex-col gap-1 min-w-0 break-words';
const TOGGLE_DESCRIPTION = 'text-xs leading-[18px] text-muted-foreground';
const TOGGLE_WRAPPER = 'relative box-border inline-flex items-center gap-2 min-h-8 cursor-pointer max-w-full pointer-coarse:min-h-11 data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed';

export function Checkbox({ label, checked, onChange, description, disabled }: ToggleProps) {
  const id = useId();
  const reduce = useReducedMotionPreference();
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
  const reduce = useReducedMotionPreference();
  return <label data-disabled={disabled || undefined} className={cn('es-switch', TOGGLE_WRAPPER, 'justify-between gap-4 py-2.5')}>
    <span className={cn(TOGGLE_LABEL, 'font-medium')}><span id={`${id}-label`}>{label}</span>{description && <small id={id} className={cn(TOGGLE_DESCRIPTION, 'text-xs leading-4')}>{description}</small>}</span>
    <input type="checkbox" role="switch" className="peer absolute inset-0 z-10 w-full h-full p-0 m-0 opacity-0" checked={checked} onChange={event => onChange(event.target.checked)} disabled={disabled} aria-labelledby={`${id}-label`} aria-describedby={description ? id : undefined} />
    <span aria-hidden className={cn('peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ring relative inline-flex shrink-0 items-center w-8 h-[18.4px] px-0 rounded-full border', 'border-input bg-switch-off', checked && 'border-info bg-info')}>
      <motion.span
        aria-hidden
        animate={{ insetInlineStart: checked ? 14 : 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.18, ease: EASE_OUT }}
        className={cn('relative block h-4 w-4 rounded-full', checked ? 'bg-switch-thumb-on' : 'bg-switch-thumb')}
      />
    </span>
  </label>;
}

type Choice = { id: string; label: string; disabled?: boolean };

/* One tab pill for SegmentedControl and Tabs: beUI Tabs `pill` (https://beui.dev/r/tabs, MIT) as the reference app ships it
   in SlidingChoices. 40px track (4px inset, 4px gap), 32px options at 14/20 medium, a primary pill gliding on
   245/36/1.2 without overshoot, and the selected label drawn as an on-primary copy clipped to the pill every frame,
   so the text colour flips exactly under it. Touch grows each option to 44px. */
const PILL_GLIDE = { type: 'spring', stiffness: 245, damping: 36, mass: 1.2 } as const;
const PILL_TRACK = 'es-pill-track box-border inline-flex w-fit items-center min-w-0 max-w-full overflow-x-auto overscroll-x-contain [scroll-padding-inline:4px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1 p-1 rounded-full bg-surface';
const PILL_OPTION = 'es-pill-option relative flex flex-none items-center justify-center min-h-8 px-3.5 py-1.5 rounded-full text-[14px] leading-5 tracking-normal font-medium whitespace-nowrap text-muted-foreground transition-colors duration-150 motion-reduce:transition-none motion-reduce:duration-0 pointer-coarse:min-h-11';
const PILL_OVERLAY = 'es-pill-overlay pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-3.5 py-1.5 rounded-full text-[14px] leading-5 tracking-normal font-medium whitespace-nowrap text-primary-foreground';
const PILL_INDICATOR = 'es-pill-indicator pointer-events-none absolute inset-0 z-0 rounded-full bg-primary';

/** Clip every on-primary label copy to the pill's projected box: one shared pass per frame until the glide settles. */
function usePillLabelClip(list: RefObject<HTMLElement | null>, selectedKey: string | undefined, count: number, reduce: boolean) {
  useLayoutEffect(() => {
    const root = list.current;
    if (!root) return;
    const labels = Array.from(root.querySelectorAll<HTMLElement>('[data-pill-overlay]'));
    const indicator = root.querySelector<HTMLElement>('[data-pill-indicator]');
    const target = root.querySelector<HTMLElement>('[data-pill-option][data-selected]');
    if (!indicator || !target) {
      for (const label of labels) label.style.clipPath = 'inset(0 100% 0 0)';
      return;
    }
    let frames = 0;
    let stillFrames = 0;
    let previous: { left: number; right: number } | undefined;
    const sync = () => {
      const pill = (reduce ? target : indicator).getBoundingClientRect();
      // Hidden panels and closed dialogs keep children mounted: wait for measurable geometry.
      if (!pill.width) { cancelFrame(sync); return; }
      // Read every box before writing any mask.
      const clips = labels.map(label => {
        const bounds = label.getBoundingClientRect();
        const left = Math.max(0, Math.min(bounds.width, pill.left - bounds.left));
        const right = Math.max(0, Math.min(bounds.width, bounds.right - pill.right));
        return left + right >= bounds.width ? 'inset(0 100% 0 0)' : `inset(0 ${right}px 0 ${left}px)`;
      });
      labels.forEach((label, index) => { if (label.style.clipPath !== clips[index]) label.style.clipPath = clips[index]; });
      frames += 1;
      stillFrames = previous && Math.abs(pill.left - previous.left) < 0.01 && Math.abs(pill.right - previous.right) < 0.01 ? stillFrames + 1 : 0;
      previous = { left: pill.left, right: pill.right };
      if (reduce || (frames > 2 && stillFrames >= 2)) cancelFrame(sync);
    };
    const restart = () => {
      cancelFrame(sync);
      frames = 0;
      stillFrames = 0;
      previous = undefined;
      frame.postRender(sync, true);
    };
    const observer = new ResizeObserver(restart);
    observer.observe(root);
    restart();
    return () => { observer.disconnect(); cancelFrame(sync); };
  }, [list, selectedKey, count, reduce]);
}

const SEGMENTED_CHOICE = 'es-segmented-choice relative min-w-0 flex-none cursor-pointer';

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
  label: string; value: string; options: Choice[]; onChange: (value: string) => void;
  /** Both render the shared tab pill. `joined` (legacy name) keeps its extra Up/Down/Home/End keyboard support. */
  variant?: 'pill' | 'joined';
}) {
  const name = useId();
  const reduce = useReducedMotionPreference();
  const groupRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [keyboardTarget, setKeyboardTarget] = useState<string | null>(null);
  const keyboardTargetRef = useRef<string | null>(null);
  const pendingKeyboardCommit = useRef<string | null>(null);
  const pill = variant === 'pill';
  usePillLabelClip(groupRef, value, options.length, reduce);
  const markKeyboardTarget = (target: string) => {
    keyboardTargetRef.current = target;
    pendingKeyboardCommit.current = target === value ? null : target;
    setKeyboardTarget(target);
  };
  const clearKeyboardTarget = () => {
    keyboardTargetRef.current = null;
    pendingKeyboardCommit.current = null;
    setKeyboardTarget(null);
  };
  useEffect(() => {
    if (!keyboardTarget || pendingKeyboardCommit.current !== keyboardTarget || value !== keyboardTarget) return;
    const acceptedTarget = keyboardTarget;
    const frameId = window.requestAnimationFrame(() => {
      if (keyboardTargetRef.current === acceptedTarget && pendingKeyboardCommit.current === acceptedTarget) clearKeyboardTarget();
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [keyboardTarget, value]);
  const navigate = (event: KeyboardEvent<HTMLInputElement>, current: string) => {
    if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Space') {
      markKeyboardTarget(current);
      return;
    }
    const allowed = pill ? ['ArrowLeft', 'ArrowRight'] : ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!allowed.includes(event.key)) return;
    event.preventDefault();
    const enabled = options.filter(option => !option.disabled);
    if (!enabled.length) return;
    const index = enabled.findIndex(option => option.id === current);
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : ((index + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + enabled.length) % enabled.length);
    const next = enabled[nextIndex];
    if (!next) return;
    markKeyboardTarget(next.id);
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
  const glide = reduce || keyboardTarget === value ? { duration: 0 } : PILL_GLIDE;
  return <LayoutGroup id={`${name}-layout`}><motion.div ref={groupRef} layoutScroll className={cn('es-segmented-control', PILL_TRACK)} data-variant={variant} role="radiogroup" aria-label={label}>{options.map(option => {
    const selected = value === option.id;
    const input = <input ref={element => { inputRefs.current[option.id] = element; }} type="radio" name={name} value={option.id} checked={selected} disabled={option.disabled} onChange={() => onChange(option.id)} onKeyDown={event => navigate(event, option.id)} onBlur={event => { if (!groupRef.current?.contains(event.relatedTarget as Node | null)) clearKeyboardTarget(); }} className="absolute w-px h-px p-0 m-0 opacity-0 peer" />;
    return <label key={option.id} onPointerDown={clearKeyboardTarget} className={cn(SEGMENTED_CHOICE, option.disabled && 'cursor-not-allowed opacity-50')}>{input}<span className={cn('es-segmented-choice-span', PILL_OPTION, 'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring')} data-pill-option="" data-selected={selected || undefined}>
      {selected && <motion.span layoutId={`${name}-indicator`} layoutDependency={value} initial={false} transition={glide} style={{ borderRadius: 9999 }} className={PILL_INDICATOR} aria-hidden="true" data-segmented-indicator data-pill-indicator="" />}
      <span className="relative z-10">{option.label}</span>
      <span aria-hidden="true" data-pill-overlay="" className={PILL_OVERLAY} style={{ clipPath: selected ? 'inset(0)' : 'inset(0 100% 0 0)' }}>{option.label}</span>
    </span></label>;
  })}</motion.div></LayoutGroup>;
}

const TABS_PANEL_TRANSITION = { duration: 0.18, ease: EASE_OUT } as const;
/** Overflow edge controls (the reference app's tab pill): 36px chevrons over the faded track ends; pointer only. */
const TABS_EDGE_SIZE = 36;

/** Every variant renders the same tab pill; variants only differ in frame and panel spacing.
 *  `activity` (default) = pill above its panel · `settings` = pill with a roomier panel · `connection` = framed card with equal-width tabs. */
export function Tabs({ label, value, items, onChange, variant = 'activity' }: {
  label: string; value: string; items: (Choice & { content: ReactNode })[]; onChange: (value: string) => void; variant?: 'activity' | 'connection' | 'settings';
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const reduce = useReducedMotionPreference();
  const [edges, setEdges] = useState({ overflow: false, left: false, right: false });
  const [keyboardTarget, setKeyboardTarget] = useState<string | null>(null);
  const keyboardTargetRef = useRef<string | null>(null);
  const pendingKeyboardCommit = useRef<string | null>(null);
  const keyboardActivation = useRef<{ id: string } | null>(null);
  const selected = items.find(item => item.id === value && !item.disabled) ?? items.find(item => !item.disabled);
  const selectedId = selected?.id;
  const keyboardInstant = reduce || keyboardTarget === value;
  usePillLabelClip(list, selectedId, items.length, reduce);

  const clearKeyboardTarget = useCallback(() => {
    keyboardTargetRef.current = null;
    pendingKeyboardCommit.current = null;
    keyboardActivation.current = null;
    setKeyboardTarget(null);
  }, []);

  const armKeyboardActivation = useCallback((target: string) => {
    const activation = { id: target };
    keyboardActivation.current = activation;
    window.requestAnimationFrame(() => {
      if (keyboardActivation.current === activation) keyboardActivation.current = null;
    });
  }, []);

  const markKeyboardTarget = useCallback((target: string) => {
    if (target === value) {
      clearKeyboardTarget();
      return;
    }
    keyboardTargetRef.current = target;
    pendingKeyboardCommit.current = target;
    setKeyboardTarget(target);
  }, [clearKeyboardTarget, value]);

  useEffect(() => {
    if (!keyboardTarget || pendingKeyboardCommit.current !== keyboardTarget || value !== keyboardTarget) return;
    const acceptedTarget = keyboardTarget;
    const frameId = window.requestAnimationFrame(() => {
      if (keyboardTargetRef.current === acceptedTarget && pendingKeyboardCommit.current === acceptedTarget) clearKeyboardTarget();
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [clearKeyboardTarget, keyboardTarget, value]);

  const measure = useCallback(() => {
    const viewport = list.current;
    if (!viewport) return;
    const viewportRect = viewport.getBoundingClientRect();
    const tabs = Array.from(viewport.querySelectorAll<HTMLElement>('[role="tab"]'));
    const overflow = viewport.scrollWidth > viewport.clientWidth + 1;
    const left = overflow && tabs.some(tab => tab.getBoundingClientRect().left < viewportRect.left - 1);
    const right = overflow && tabs.some(tab => tab.getBoundingClientRect().right > viewportRect.right + 1);
    setEdges(previous => previous.overflow === overflow && previous.left === left && previous.right === right ? previous : { overflow, left, right });
  }, []);

  const reveal = useCallback((tab: HTMLElement | null, instant = false) => {
    const viewport = list.current;
    if (!viewport || !tab) return;
    const viewportRect = viewport.getBoundingClientRect();
    const tabs = Array.from(viewport.querySelectorAll<HTMLElement>('[role="tab"]'));
    const overflow = viewport.scrollWidth > viewport.clientWidth + 1;
    const left = overflow && tabs.some(item => item.getBoundingClientRect().left < viewportRect.left - 1);
    const right = overflow && tabs.some(item => item.getBoundingClientRect().right > viewportRect.right + 1);
    const leftBound = viewportRect.left + (left ? TABS_EDGE_SIZE : 0);
    const rightBound = viewportRect.right - (right ? TABS_EDGE_SIZE : 0);
    const tabRect = tab.getBoundingClientRect();
    const delta = tabRect.left < leftBound ? tabRect.left - leftBound : tabRect.right > rightBound ? tabRect.right - rightBound : 0;
    if (delta) viewport.scrollBy({ left: delta, behavior: reduce || instant ? 'auto' : 'smooth' });
  }, [reduce]);

  useLayoutEffect(() => {
    const viewport = list.current;
    const container = root.current;
    if (!viewport || !container) return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(viewport);
    viewport.addEventListener('scroll', measure, { passive: true });
    const fontsReady = document.fonts?.ready.then(measure);
    measure();
    return () => {
      observer.disconnect();
      viewport.removeEventListener('scroll', measure);
      void fontsReady;
    };
  }, [measure]);

  useLayoutEffect(() => {
    measure();
    reveal(selectedId ? tabRefs.current[selectedId] : null, reduce || keyboardTarget !== null);
  }, [items, keyboardTarget, measure, reduce, reveal, selectedId, value, variant]);

  const propose = useCallback((target: string, keyboard: boolean) => {
    const item = items.find(option => option.id === target);
    if (!item || item.disabled) return;
    if (keyboard) {
      markKeyboardTarget(target);
    } else {
      clearKeyboardTarget();
    }
    if (target !== value) onChange(target);
  }, [clearKeyboardTarget, items, markKeyboardTarget, onChange, value]);

  const navigate = (event: KeyboardEvent<HTMLButtonElement>, current: string) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar' || event.key === 'Space') {
      event.preventDefault();
      armKeyboardActivation(current);
      propose(current, true);
      return;
    }
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const enabled = items.filter(item => !item.disabled);
    const index = enabled.findIndex(item => item.id === current);
    const rtl = list.current && getComputedStyle(list.current).direction === 'rtl';
    const direction = (event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1);
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : (index + direction + enabled.length) % enabled.length;
    const next = enabled[nextIndex];
    if (!next) return;
    propose(next.id, true);
    const input = tabRefs.current[next.id];
    input?.focus({ preventScroll: true });
    reveal(input, true);
  };
  const scroll = (direction: number) => {
    const viewport = list.current;
    if (viewport) viewport.scrollBy({ left: direction * Math.max(viewport.clientWidth * 0.8, 80), behavior: reduce ? 'auto' : 'smooth' });
  };
  const connection = variant === 'connection';
  const tabButtons = items.map(item => {
    const active = selected?.id === item.id;
    const tabId = `${id}-tab-${item.id}`;
    const panelId = `${id}-panel-${item.id}`;
    return <button key={item.id} ref={button => { tabRefs.current[item.id] = button; }} id={tabId} type="button" role="tab" aria-controls={panelId} aria-selected={active} tabIndex={active ? 0 : -1} disabled={item.disabled} data-pill-option="" data-selected={active || undefined}
      onClick={event => { if (event.detail === 0) { const activation = keyboardActivation.current; keyboardActivation.current = null; if (activation?.id === item.id) return; propose(item.id, true); return; } propose(item.id, false); }}
      onKeyDown={event => navigate(event, item.id)}
      className={cn(PILL_OPTION, 'border-0 bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring', connection && 'w-full min-w-0')}>
      {active && <motion.span layoutId={`${id}-indicator`} layoutDependency={selectedId} initial={false} transition={keyboardInstant ? { duration: 0 } : PILL_GLIDE} style={{ borderRadius: 9999 }} className={cn('es-tabs-indicator', PILL_INDICATOR)} data-tabs-indicator data-pill-indicator="" aria-hidden="true" />}
      <span className="relative z-10">{item.label}</span>
      <span aria-hidden="true" data-pill-overlay="" className={PILL_OVERLAY} style={{ clipPath: active ? 'inset(0)' : 'inset(0 100% 0 0)' }}>{item.label}</span>
    </button>;
  });
  // Edge scroll buttons serve pointers only: arrow keys already reveal the focused tab, and Tab must go from the tablist straight to its panel.
  const connectionListStyle = connection ? { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` } : undefined;
  const tabList = <motion.div ref={list} layoutScroll id={`${id}-list`} className={cn('es-tabs-list', PILL_TRACK, connection && 'grid w-full')} style={connectionListStyle} role="tablist" aria-label={label} onFocusCapture={event => { if (event.target instanceof HTMLElement && event.target.getAttribute('role') === 'tab') reveal(event.target, reduce || keyboardTarget !== null); }}>{tabButtons}</motion.div>;
  const strip = <div className="es-tabs-list-shell" data-variant={variant} data-overflow={edges.overflow} data-edge-left={edges.left} data-edge-right={edges.right}>{edges.left && <span className="es-tabs-edge-fade" data-edge="left" aria-hidden="true" />}{edges.right && <span className="es-tabs-edge-fade" data-edge="right" aria-hidden="true" />}{edges.overflow && <button type="button" tabIndex={-1} className="es-tabs-edge-button" data-edge="left" aria-label="Rolar abas para a esquerda" aria-controls={list.current?.id} disabled={!edges.left} onClick={() => scroll(-1)}><Icon name="ChevronRight" purpose="action" /></button>}{tabList}{edges.overflow && <button type="button" tabIndex={-1} className="es-tabs-edge-button" data-edge="right" aria-label="Rolar abas para a direita" aria-controls={list.current?.id} disabled={!edges.right} onClick={() => scroll(1)}><Icon name="ChevronRight" purpose="action" /></button>}</div>;
  return <LayoutGroup id={id}><div ref={root} className={cn('es-tabs min-w-0', connection && 'rounded-[16px] overflow-hidden border border-border-subtle shadow-[0_1px_2px_var(--es-border-subtle)]')} data-variant={variant} onPointerDown={clearKeyboardTarget} onBlurCapture={event => { if (!root.current?.contains(event.relatedTarget as Node | null)) clearKeyboardTarget(); }}>{connection ? <div className="es-tabs-connection-strip contain-inline-size w-full max-w-full min-w-0 overflow-visible p-2 border-b border-border-subtle">{strip}</div> : strip}{items.map(item => {
    const active = selected?.id === item.id;
    const panelId = `${id}-panel-${item.id}`;
    const panelTransition = variant === 'settings' || keyboardInstant ? { duration: 0 } : TABS_PANEL_TRANSITION;
    return <motion.div key={item.id} id={panelId} className={cn(connection ? 'es-tab-panel m-0 px-8 pt-4 pb-8 border-0 min-w-0' : variant === 'settings' ? 'mt-6 min-w-0' : 'mt-4 min-w-0', !connection && 'es-tab-panel')} role="tabpanel" aria-labelledby={`${id}-tab-${item.id}`} hidden={!active} tabIndex={active ? 0 : -1} initial={false} animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }} transition={panelTransition}>{item.content}</motion.div>;
  })}</div></LayoutGroup>;
}
