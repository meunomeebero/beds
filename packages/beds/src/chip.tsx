import { motion } from 'motion/react';
import { Icon } from './foundation';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';
import { cn } from './lib/utils';

export type ChipProps = {
  label: string;
  /** Shows the quiet round × after the label. The caller removes the value and decides where focus goes next. */
  onRemove?: () => void;
  /** Accessible name of the remove control. Defaults to "Remover {label}"; pass a localized name. */
  removeLabel?: string;
  /** Disables the remove control (or the toggle); the label stays readable. */
  disabled?: boolean;
  /**
   * Toggle chip (0.3.0-rc.4): with `onPressedChange` the chip is one `aria-pressed` button. Pressed = the filled chip
   * with a neutral tick (kept); not pressed = dashed and quiet (left out). Not combined with `onRemove`.
   */
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
};

const CHIP_TEXT = 'max-w-full min-w-0 min-h-7 items-center rounded-full py-0.5 text-[13px] leading-5 tracking-normal';

/**
 * A value the person added (skills, filters, recipients), as the reference app's profile editor draws it:
 * 13/20 text on the subtle surface with a hairline inset, and an optional 24px remove control whose
 * hit area grows to 36px without changing the chip's height. Layout and list semantics are caller-owned.
 */
export function Chip({ label, onRemove, removeLabel, disabled, pressed = false, onPressedChange }: ChipProps) {
  const reduce = useReducedMotionPreference();
  if (onPressedChange) {
    return <motion.button type="button" aria-pressed={pressed} disabled={disabled} onClick={() => onPressedChange(!pressed)}
      whileTap={reduce || disabled ? undefined : { scale: .97 }} transition={{ duration: .16, ease: [.23, 1, .32, 1] }}
      className={cn('es-chip es-chip-toggle relative inline-flex gap-1 border-0 text-start cursor-pointer [overflow-wrap:anywhere] [-webkit-tap-highlight-color:transparent] transition-colors duration-150 motion-reduce:transition-none before:absolute before:inset-x-[-2px] before:inset-y-[-6px] before:content-[\'\'] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60', CHIP_TEXT,
        pressed
          ? 'ps-[9px] pe-3 bg-subtle text-[color:var(--es-heading)] shadow-[inset_0_0_0_1px_var(--es-border-subtle)]'
          : 'px-3 bg-transparent text-muted-foreground outline-1 outline-dashed -outline-offset-1 outline-[color:var(--es-border-strong)] hover:enabled:text-[color:var(--es-heading)]')}>
      {pressed && <span className="es-chip-mark inline-grid size-3.5 flex-none place-items-center text-[color:var(--es-heading)]" aria-hidden="true"><Icon name="Check" purpose="small" /></span>}
      <span className="min-w-0">{label}</span>
    </motion.button>;
  }
  return <span className={cn('es-chip inline-flex gap-0.5 bg-subtle text-[color:var(--es-heading)] shadow-[inset_0_0_0_1px_var(--es-border-subtle)]', CHIP_TEXT, onRemove ? 'ps-3 pe-1' : 'px-2.5')}>
    <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
    {onRemove && <button type="button" aria-label={removeLabel ?? `Remover ${label}`} disabled={disabled} onClick={onRemove} className="es-chip-remove relative inline-grid size-6 flex-none place-items-center rounded-full border-0 bg-transparent p-0 text-muted-foreground cursor-pointer transition-colors duration-150 motion-reduce:transition-none hover:bg-[var(--es-remove-hover)] hover:text-[color:var(--es-heading)] before:absolute before:-inset-1.5 before:content-[''] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"><Icon name="X" purpose="navigation" /></button>}
  </span>;
}
