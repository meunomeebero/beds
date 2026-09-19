import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect } from 'react';
import { EASE_OUT } from './lib/ease';

/** Shared internal anatomy; public consumers use SegmentedMeter or ApplicationCard. */
export function meterFraction(value: number | null, max: number) {
  if (value === null || !Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return null;
  return Math.min(max, Math.max(0, value)) / max;
}

export function MeterSegments({ label, value, max = 100, tone = 'neutral', rounding = 'nearest', valueText, role = 'meter', animateFill = false, paused = false }: {
  label: string;
  value: number | null;
  max?: number;
  tone?: 'neutral' | 'brand' | 'success';
  rounding?: 'nearest' | 'down';
  valueText?: string;
  role?: 'meter' | 'progressbar';
  /** Internal ProcessingView-only visual fill; the accessible value stays final. */
  animateFill?: boolean;
  paused?: boolean;
}) {
  const ratio = meterFraction(value, max);
  const count = 28;
  const filled = ratio === null ? 0 : rounding === 'down' ? Math.floor(ratio * count) : Math.round(ratio * count);
  const reduce = useReducedMotion() ?? false;
  const canAnimate = animateFill && ratio !== null;
  const fillProgress = useMotionValue(canAnimate && !reduce ? 0 : 1);
  const clipPath = useTransform(fillProgress, current => `inset(0 ${Math.max(0, 100 - current * 100)}% 0 0)`);

  useEffect(() => {
    if (!canAnimate || reduce) {
      fillProgress.set(1);
      return;
    }
    if (paused) return;
    const controls = animate(fillProgress, 1, { duration: .9, ease: EASE_OUT });
    return () => controls.stop();
  }, [canAnimate, fillProgress, paused, reduce]);

  return <motion.div className="es-segmented-bars" data-tone={tone} role={role === 'progressbar' ? role : ratio === null ? 'img' : role} aria-label={ratio === null && role !== 'progressbar' ? label + ': unavailable' : label} aria-valuemin={ratio === null ? undefined : 0} aria-valuemax={ratio === null ? undefined : max} aria-valuenow={ratio === null ? undefined : Math.min(max, Math.max(0, value ?? 0))} aria-valuetext={valueText} style={canAnimate && !reduce ? { clipPath } : undefined}>
    {Array.from({ length: count }, (_, index) => <span key={index} aria-hidden="true" data-filled={index < filled ? '' : undefined} />)}
  </motion.div>;
}
