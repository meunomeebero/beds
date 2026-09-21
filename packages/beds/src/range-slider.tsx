import { useId, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { SPRING_GLIDE } from './lib/ease';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';
import { getRangeSliderBounds, getRangeSliderTicks, normalizeRangeSliderValue } from './lib/range-slider';

export type RangeSliderProps = {
  /** Visible name for the native range input. */
  label: string;
  /** Controlled value. When omitted, `defaultValue` initializes local state. */
  value?: number;
  /** Initial value for an uncontrolled range. */
  defaultValue?: number;
  /** Receives only a clamped value on the declared step grid. */
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  description?: string;
  /** Formats the visible value and the native range's accessible value text. */
  formatValue?: (value: number) => string;
  /** Name used when the native control participates in a form. */
  name?: string;
  id?: string;
  /** Shows a bounded set of decorative tick marks; never changes the legal values. */
  showTicks?: boolean;
};

/**
 * A controlled or uncontrolled native range input with BEDS-owned value display,
 * focus treatment and optional tick cues. It is presentational: callers own every
 * policy that interprets the selected number.
 *
 * Adapted from beUI `range-slider` (MIT, https://beui.dev/r/range-slider/raw,
 * retrieved 2026-09-20). BEDS preserves the track/fill/tick anatomy and motion
 * intent, but keeps the native `<input type="range">` for form, keyboard and RTL
 * semantics instead of reproducing a custom `role="slider"` interaction.
 */
export function RangeSlider({
  label,
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  step,
  disabled = false,
  description,
  formatValue,
  name,
  id,
  showTicks = false,
}: RangeSliderProps) {
  const generatedId = useId();
  const inputId = id ?? `range-slider-${generatedId}`;
  const descriptionId = `${inputId}-description`;
  const [internalValue, setInternalValue] = useState(() => normalizeRangeSliderValue(defaultValue, getRangeSliderBounds(min, max, step)));
  const bounds = getRangeSliderBounds(min, max, step);
  const controlled = value !== undefined;
  const current = normalizeRangeSliderValue(controlled ? value : internalValue, bounds);
  const percent = bounds.max === bounds.min ? 0 : ((current - bounds.min) / (bounds.max - bounds.min)) * 100;
  const ticks = useMemo(() => getRangeSliderTicks(bounds, showTicks), [bounds.min, bounds.max, bounds.step, showTicks]);
  const reduceMotion = useReducedMotionPreference();
  const renderedValue = formatValue?.(current) ?? String(current);

  return <div className="grid min-w-0 gap-2">
    <div className="flex min-w-0 items-baseline justify-between gap-4">
      <label htmlFor={inputId} className="min-w-0 break-words text-sm font-medium leading-4 tracking-normal text-foreground">{label}</label>
      <output htmlFor={inputId} className="min-w-0 break-words text-end text-sm leading-5 tabular-nums text-muted-foreground"><bdi>{renderedValue}</bdi></output>
    </div>
    {description ? <p id={descriptionId} className="text-xs leading-[18px] text-muted-foreground">{description}</p> : null}
    <div className="es-range-slider relative flex h-10 min-w-0 items-center pointer-coarse:h-11" data-disabled={disabled || undefined}>
      <div aria-hidden="true" className="es-range-slider__track pointer-events-none absolute inset-0 overflow-hidden rounded-lg bg-muted">
        <motion.span
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={reduceMotion ? { duration: 0 } : SPRING_GLIDE}
          className="absolute inset-y-0 start-0 bg-foreground/15"
        />
      </div>
      {ticks.length ? <span aria-hidden="true" className="es-range-slider__ticks pointer-events-none absolute inset-x-[10px] inset-y-0">
        {ticks.map(tick => <span key={tick} className="absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/25" style={{ insetInlineStart: `${((tick - bounds.min) / (bounds.max - bounds.min)) * 100}%` }} />)}
      </span> : null}
      <input
        id={inputId}
        name={name}
        type="range"
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        value={current}
        disabled={disabled}
        aria-describedby={description ? descriptionId : undefined}
        aria-valuetext={formatValue ? renderedValue : undefined}
        className="es-range-slider__control relative z-10 h-full w-full min-w-0 cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed"
        onChange={event => {
          const next = normalizeRangeSliderValue(event.currentTarget.valueAsNumber, bounds);
          if (!controlled) setInternalValue(next);
          onValueChange?.(next);
        }}
      />
    </div>
  </div>;
}
