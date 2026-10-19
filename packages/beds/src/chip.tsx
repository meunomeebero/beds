import { Icon } from './foundation';
import { cn } from './lib/utils';

export type ChipProps = {
  label: string;
  /** Shows the quiet round × after the label. The caller removes the value and decides where focus goes next. */
  onRemove?: () => void;
  /** Accessible name of the remove control. Defaults to "Remover {label}"; pass a localized name. */
  removeLabel?: string;
  /** Disables the remove control; the label stays readable. */
  disabled?: boolean;
};

/**
 * A value the person added (skills, filters, recipients), as the reference app's profile editor draws it:
 * 13/20 text on the subtle surface with a hairline inset, and an optional 24px remove control whose
 * hit area grows to 36px without changing the chip's height. Layout and list semantics are caller-owned.
 */
export function Chip({ label, onRemove, removeLabel, disabled }: ChipProps) {
  return <span className={cn('es-chip inline-flex max-w-full min-w-0 min-h-7 items-center gap-0.5 rounded-full bg-subtle py-0.5 text-[13px] leading-5 tracking-normal text-[color:var(--es-heading)] shadow-[inset_0_0_0_1px_var(--es-border-subtle)]', onRemove ? 'ps-3 pe-1' : 'px-2.5')}>
    <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
    {onRemove && <button type="button" aria-label={removeLabel ?? `Remover ${label}`} disabled={disabled} onClick={onRemove} className="es-chip-remove relative inline-grid size-6 flex-none place-items-center rounded-full border-0 bg-transparent p-0 text-muted-foreground cursor-pointer transition-colors duration-150 motion-reduce:transition-none hover:bg-[var(--es-remove-hover)] hover:text-[color:var(--es-heading)] before:absolute before:-inset-1.5 before:content-[''] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"><Icon name="X" purpose="navigation" /></button>}
  </span>;
}
