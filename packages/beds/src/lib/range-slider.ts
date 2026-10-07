/** Internal numeric contract for the native RangeSlider. This module is not a public package export. */
export type RangeSliderBounds = { min: number; max: number; step: number };

function finiteOr(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * Produces the legal native range bounds. The effective maximum is always a
 * value reachable from `min` by whole `step` increments, so React, text, ARIA
 * and the browser input never disagree about an off-grid declared maximum.
 */
export function getRangeSliderBounds(min: number | undefined, max: number | undefined, step: number | undefined): RangeSliderBounds {
  const lower = finiteOr(min, 0);
  const requestedMax = Math.max(lower, finiteOr(max, 100));
  const stride = finiteOr(step, 1) > 0 ? finiteOr(step, 1) : 1;
  const intervals = Math.floor(Number(((requestedMax - lower) / stride).toFixed(10)));
  return { min: lower, max: Number((lower + intervals * stride).toFixed(10)), step: stride };
}

/** Returns the nearest legal grid point inside the effective bounds. */
export function normalizeRangeSliderValue(value: number | undefined, { min, max, step }: RangeSliderBounds) {
  const candidate = Math.min(max, Math.max(min, finiteOr(value, min)));
  if (max === min) return min;
  const nearest = min + Math.round((candidate - min) / step) * step;
  return Math.min(max, Math.max(min, Number(nearest.toFixed(10))));
}

/** Decorative ticks only; a range with more than 50 intervals remains legible without them. */
export function getRangeSliderTicks({ min, max, step }: RangeSliderBounds, showTicks: boolean) {
  const count = Math.floor(Number(((max - min) / step).toFixed(10)));
  if (!showTicks || count < 1 || count > 50) return [];
  return Array.from({ length: count + 1 }, (_, index) => Number((min + index * step).toFixed(10)));
}
