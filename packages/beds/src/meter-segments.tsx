/** Shared internal anatomy; public consumers use SegmentedMeter or ApplicationCard. */
export function meterFraction(value: number | null, max: number) {
  if (value === null || !Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return null;
  return Math.min(max, Math.max(0, value)) / max;
}

export function MeterSegments({ label, value, max = 100, tone = 'neutral', rounding = 'nearest', valueText, role = 'meter' }: {
  label: string;
  value: number | null;
  max?: number;
  tone?: 'neutral' | 'brand' | 'success';
  rounding?: 'nearest' | 'down';
  valueText?: string;
  role?: 'meter' | 'progressbar';
}) {
  const ratio = meterFraction(value, max);
  const count = 28;
  const filled = ratio === null ? 0 : rounding === 'down' ? Math.floor(ratio * count) : Math.round(ratio * count);
  return <div className="es-segmented-bars" data-tone={tone} role={role === 'progressbar' ? role : ratio === null ? 'img' : role} aria-label={ratio === null && role !== 'progressbar' ? label + ': unavailable' : label} aria-valuemin={ratio === null ? undefined : 0} aria-valuemax={ratio === null ? undefined : max} aria-valuenow={ratio === null ? undefined : Math.min(max, Math.max(0, value ?? 0))} aria-valuetext={valueText}>
    {Array.from({ length: count }, (_, index) => <span key={index} aria-hidden="true" data-filled={index < filled ? '' : undefined} />)}
  </div>;
}
