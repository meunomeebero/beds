import { forwardRef, useEffect, useId, useRef, type ForwardedRef, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react';
import { Icon, type IconName } from './foundation';
import { cn } from './lib/utils';
import { EASE_OUT } from './lib/ease';
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
  compact: 'h-7 rounded-md px-2.5 gap-1',
  default: 'h-8 rounded-lg px-2.5 gap-1 pointer-coarse:h-11',
  welcome: 'h-10 rounded-[12px] px-3.5 gap-1.5', // arbitrary radius: BEDS welcome has r=12px (no token match)
  connection: 'h-10 rounded-xl px-4 gap-1.5',
};

export function Button({ label, onClick, type = 'button', variant = 'secondary', compact = false, purpose = 'default', icon, disabled, busy, 'aria-describedby': describedBy, 'aria-expanded': ariaExpanded, 'aria-controls': ariaControls }: ButtonProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const sizeKey = purpose === 'default' && compact ? 'compact' : purpose;
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
    whileTap={reduce || disabled || busy ? undefined : { scale: 0.97 }}
    whileHover={reduce || !canHover || disabled || busy ? undefined : { scale: 1.01 }}
    transition={{ duration: 0.12, ease: EASE_OUT }}
    className={cn(
      'box-border inline-flex items-center justify-center max-w-full text-sm font-medium tracking-normal',
      'border-0 transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      BUTTON_VARIANT[variant],
      BUTTON_SIZE[sizeKey],
    )}
  >
    {(busy || icon) && <motion.span aria-hidden className="inline-flex shrink-0" animate={busy && !reduce ? { rotate: 360 } : undefined} transition={busy && !reduce ? { repeat: Infinity, duration: 0.9, ease: 'linear' } : undefined}><Icon name={busy ? 'Loader2' : icon!} purpose="action" /></motion.span>}
    <span className="min-w-0 break-words">{label}</span>
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
    whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
    transition={{ duration: 0.12, ease: EASE_OUT }}
    className={cn(
      'box-border inline-flex items-center justify-center shrink-0 border-0',
      'h-8 w-8 rounded-lg bg-transparent text-muted-foreground cursor-pointer',
      'transition-colors hover:text-foreground hover:bg-accent',
      'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      'pointer-coarse:h-11 pointer-coarse:w-11',
    )}
  ><Icon name={icon} purpose="action" /></motion.button>;
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
    whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
    transition={{ duration: 0.12, ease: EASE_OUT }}
    className={cn(
      'box-border inline-flex items-center justify-center shrink-0 border-0',
      'h-8 w-8 rounded-lg bg-transparent text-muted-foreground cursor-pointer',
      'transition-colors hover:text-foreground hover:bg-accent',
      'aria-pressed:bg-accent aria-pressed:text-foreground aria-pressed:[&_svg]:fill-current',
      'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      'pointer-coarse:h-11 pointer-coarse:w-11',
    )}
  ><Icon name={icon} purpose="action" /></motion.button>;
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
const TOGGLE_WRAPPER = 'box-border inline-flex items-center gap-2 min-h-8 cursor-pointer max-w-full pointer-coarse:min-h-11 data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed';

export function Checkbox({ label, checked, onChange, description, disabled }: ToggleProps) {
  const id = useId();
  const reduce = useReducedMotion();
  return <label data-disabled={disabled || undefined} className={cn(TOGGLE_WRAPPER)}>
    <input type="checkbox" className="peer absolute w-px h-px p-0 m-0 opacity-0" checked={checked} onChange={event => onChange(event.target.checked)} disabled={disabled} aria-describedby={description ? id : undefined} />
    <span aria-hidden className={cn('peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ring relative inline-flex shrink-0 items-center justify-center h-4 w-4 rounded-md border', 'border-input bg-surface text-bg', checked && 'border-foreground bg-foreground text-background')}>
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
  return <label data-disabled={disabled || undefined} className={cn(TOGGLE_WRAPPER, 'justify-between gap-4 py-2.5')}>
    <span className={cn(TOGGLE_LABEL, 'font-medium')}><span id={`${id}-label`}>{label}</span>{description && <small id={id} className={cn(TOGGLE_DESCRIPTION, 'text-xs leading-4')}>{description}</small>}</span>
    <input type="checkbox" role="switch" className="peer absolute w-px h-px p-0 m-0 opacity-0" checked={checked} onChange={event => onChange(event.target.checked)} disabled={disabled} aria-labelledby={`${id}-label`} aria-describedby={description ? id : undefined} />
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

export function SegmentedControl({ label, value, options, onChange, variant = 'pill' }: {
  label: string; value: string; options: Choice[]; onChange: (value: string) => void; variant?: 'pill' | 'joined';
}) {
  const name = useId();
  return <div className="es-segmented-control" data-variant={variant} role="radiogroup" aria-label={label}>{options.map(option => <label key={option.id} className="es-segmented-choice"><input type="radio" name={name} value={option.id} checked={value === option.id} disabled={option.disabled} onChange={() => onChange(option.id)} /><span>{option.label}</span></label>)}</div>;
}

export function Tabs({ label, value, items, onChange, variant = 'activity' }: {
  label: string; value: string; items: (Choice & { content: ReactNode })[]; onChange: (value: string) => void; variant?: 'activity' | 'connection' | 'settings';
}) {
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
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
  const connectionListStyle = variant === 'connection' ? { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` } : undefined;
  const tabList = <div ref={list} className="es-tabs-list" role="tablist" aria-label={label} style={connectionListStyle}>{items.map((item, index) => <button key={item.id} id={`${id}-tab-${index}`} type="button" role="tab" aria-controls={`${id}-panel-${index}`} aria-selected={selected?.id === item.id} tabIndex={selected?.id === item.id ? 0 : -1} disabled={item.disabled} onClick={() => onChange(item.id)} onKeyDown={event => navigate(event, item.id)}>{variant === 'settings' ? <span className="es-settings-tab-label">{item.label}</span> : item.label}</button>)}</div>;
  return <div className="es-tabs" data-variant={variant}>{variant === 'connection' ? <div className="es-tabs-connection-strip">{tabList}</div> : tabList}{items.map((item, index) => <div key={item.id} id={`${id}-panel-${index}`} className="es-tab-panel" role="tabpanel" aria-labelledby={`${id}-tab-${index}`} hidden={selected?.id !== item.id} tabIndex={0}>{item.content}</div>)}</div>;
}
