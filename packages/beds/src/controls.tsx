import { forwardRef, useEffect, useId, useRef, type ForwardedRef, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
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
  const showError = Boolean(error) || Boolean(reserveErrorLine);
  return <>{description && <p id={`${id}-description`} className="es-field-description">{description}</p>}{showError && <p id={error ? `${id}-error` : undefined} className="es-field-error" data-reserved={!error || undefined} role={error ? 'alert' : undefined}><Icon name="AlertCircle" purpose="small" />{error}</p>}</>;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({ label, value, onChange, description, error, placeholder, disabled, readOnly, name, autoComplete, inputMode, spellCheck, focusOnError, reserveErrorLine, purpose = 'settings', type = 'text' }, forwardedRef) {
  const { id, describedBy } = useFieldIds(description, error);
  const inputRef = useErrorFocus<HTMLInputElement>(error, focusOnError);
  return <div className="es-field"><label htmlFor={id}>{label}</label><input ref={node => { inputRef.current = node; setForwardedRef(forwardedRef, node); }} id={id} type={type} name={name} autoComplete={autoComplete} inputMode={inputMode} spellCheck={spellCheck} className="es-text-input" data-purpose={purpose} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} readOnly={readOnly} aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy} /><FieldNotes id={id} description={description} error={error} reserveErrorLine={reserveErrorLine} /></div>;
});
TextField.displayName = 'TextField';

export const TextAreaField = forwardRef<HTMLTextAreaElement, FieldProps>(function TextAreaField({ label, value, onChange, description, error, placeholder, disabled, readOnly, name, autoComplete, inputMode, spellCheck, focusOnError, reserveErrorLine }, forwardedRef) {
  const { id, describedBy } = useFieldIds(description, error);
  const inputRef = useErrorFocus<HTMLTextAreaElement>(error, focusOnError);
  return <div className="es-field"><label htmlFor={id}>{label}</label><textarea ref={node => { inputRef.current = node; setForwardedRef(forwardedRef, node); }} id={id} name={name} autoComplete={autoComplete} inputMode={inputMode} spellCheck={spellCheck} className="es-text-area" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} readOnly={readOnly} aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy} /><FieldNotes id={id} description={description} error={error} reserveErrorLine={reserveErrorLine} /></div>;
});
TextAreaField.displayName = 'TextAreaField';

export const SearchField = forwardRef<HTMLInputElement, {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean;
  name?: string; autoComplete?: string; inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']; spellCheck?: boolean;
}>(function SearchField({ label, value, onChange, placeholder, disabled, name, autoComplete, inputMode, spellCheck }, forwardedRef) {
  const id = useId();
  return <div className="es-search-field"><label htmlFor={id}><Icon name="Search" purpose="action" /><span className="es-visually-hidden">{label}</span></label><input ref={forwardedRef} id={id} type="search" name={name} autoComplete={autoComplete} inputMode={inputMode} spellCheck={spellCheck} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} /></div>;
});
SearchField.displayName = 'SearchField';

type ToggleProps = { label: string; checked: boolean; onChange: (checked: boolean) => void; description?: string; disabled?: boolean };

export function Checkbox({ label, checked, onChange, description, disabled }: ToggleProps) {
  const id = useId();
  return <label className="es-checkbox" data-disabled={disabled || undefined}><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} disabled={disabled} aria-describedby={description ? id : undefined} /><span className="es-checkbox-box" aria-hidden="true">{checked && <Icon name="Check" purpose="small" />}</span><span className="es-toggle-copy"><span>{label}</span>{description && <small id={id}>{description}</small>}</span></label>;
}

export function Switch({ label, checked, onChange, description, disabled }: ToggleProps) {
  const id = useId();
  return <label className="es-switch" data-disabled={disabled || undefined}><span className="es-toggle-copy"><span id={`${id}-label`}>{label}</span>{description && <small id={id}>{description}</small>}</span><input type="checkbox" role="switch" checked={checked} onChange={event => onChange(event.target.checked)} disabled={disabled} aria-labelledby={`${id}-label`} aria-describedby={description ? id : undefined} /><span className="es-switch-track" aria-hidden="true"><span /></span></label>;
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
