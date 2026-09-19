import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
import { AnimatedNumber, Icon, type IconName } from './foundation';
import { MeterSegments, meterFraction as fraction } from './meter-segments';
import { EASE_IN_OUT, EASE_OUT } from './lib/ease';
import { cn } from './lib/utils';
type Tone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

// Adapted from beUI animated-badge (MIT): https://beui.dev/r/animated-badge/raw
// BEDS keeps its existing label/tone/purpose API and status-dot anatomy; only the
// state/label roll and layout spring are adopted from the source interaction.
const BADGE_ROLL_VARIANTS: Variants = {
  initial: { opacity: 0.76, y: '85%', filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: '0%',
    filter: 'blur(0px)',
    transition: {
      y: { type: 'spring', stiffness: 210, damping: 24, mass: 0.85 },
      opacity: { duration: 0.3, ease: EASE_OUT },
      filter: { duration: 0.42, ease: EASE_OUT },
    },
  },
  exit: {
    opacity: 0.5,
    y: '-85%',
    filter: 'blur(6px)',
    transition: { duration: 0.2, ease: EASE_OUT },
  },
};
const BADGE_REDUCED = { opacity: 1, y: 0, filter: 'none' };

export function Badge({ label, tone = 'neutral', purpose = 'tag' }: { label: string; tone?: Tone; purpose?: 'tag' | 'status' }) {
  const reduce = useReducedMotion() ?? false;
  const labelKey = `${tone}:${label}`;

  return <motion.span
    layout={!reduce}
    transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.7 }}
    className="es-badge"
    data-tone={tone}
    data-purpose={purpose}
  >
    <span className="es-badge-label">
      {purpose === 'status' && <span className="es-badge-marker" aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={tone}
            variants={BADGE_ROLL_VARIANTS}
            initial={reduce ? false : 'initial'}
            animate={reduce ? BADGE_REDUCED : 'animate'}
            exit={reduce ? undefined : 'exit'}
            className="es-badge-marker-roll"
          >
            <span className="es-badge-marker-dot" data-tone={tone} />
          </motion.span>
        </AnimatePresence>
      </span>}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={labelKey}
          variants={BADGE_ROLL_VARIANTS}
          initial={reduce ? false : 'initial'}
          animate={reduce ? BADGE_REDUCED : 'animate'}
          exit={reduce ? undefined : 'exit'}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  </motion.span>;
}
export function StatusDot({ label, status }: { label: string; status: 'success' | 'warning' | 'error' | 'neutral' }) {
  return <span className="es-status-dot" data-status={status} role="img" aria-label={label} />;
}
export function Notice({ title, description, tone = 'info', onDismiss }: { title: string; description?: string; tone?: Exclude<Tone,'neutral'>; onDismiss?: () => void }) {
  const glyph = tone === 'success' ? 'CheckCircle2' : tone === 'info' ? 'Info' : 'AlertCircle';
  return <div className="es-notice" data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}><Icon name={glyph} purpose="action" /><div><strong>{title}</strong>{description && <p>{description}</p>}</div>{onDismiss && <button type="button" aria-label="Dismiss notification" onClick={onDismiss}><Icon name="X" /></button>}</div>;
}
export function EmptyState({ title, description, icon = 'Folder', action }: { title: string; description?: string; icon?: IconName; action?: { label: string; onClick: () => void } }) {
  return <div className="es-empty-state"><span className="es-empty-icon"><Icon name={icon} purpose="feature" /></span><h3>{title}</h3>{description && <p>{description}</p>}{action && <button type="button" onClick={action.onClick}>{action.label}</button>}</div>;
}
export function Skeleton({ purpose = 'line' }: { purpose?: 'line' | 'avatar' | 'card' }) {
  return <span className="es-skeleton" data-purpose={purpose} aria-hidden="true" />;
}

// Adapted from beUI loader (MIT): https://beui.dev/r/loader/raw
const LOADER_REDUCED = {
  animate: { opacity: [1, 0.4, 1] },
  transition: { duration: 1.4, ease: EASE_IN_OUT, repeat: Infinity },
};

function LoadingSpinner({ size }: { size: number }) {
  const reduce = useReducedMotion() ?? false;
  const stroke = Math.max(2, size * 0.09);
  const radius = (size - stroke) / 2;
  return <motion.svg
    width={size}
    height={size}
    viewBox={`0 0 ${size} ${size}`}
    aria-hidden="true"
    focusable="false"
    animate={reduce ? LOADER_REDUCED.animate : { rotate: 360 }}
    transition={reduce ? LOADER_REDUCED.transition : { duration: 1, ease: 'linear', repeat: Infinity }}
  >
    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={stroke} />
    <path d={`M ${size / 2} ${size / 2 - radius} A ${radius} ${radius} 0 0 1 ${size / 2 + radius} ${size / 2}`} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
  </motion.svg>;
}

export function LoadingIndicator({ label }: { label: string }) {
  return <span className={cn('es-loading inline-flex items-center justify-center max-w-full gap-2 text-sm leading-5 text-muted-foreground')} role="status" aria-label={label}>
    <LoadingSpinner size={16} />
    <span className="min-w-0 break-words">{label}</span>
  </span>;
}
export function ProgressBar({ label, value, max = 100, tone = 'neutral' }: { label: string; value: number | null; max?: number; tone?: 'neutral' | 'brand' }) {
  const ratio = fraction(value, max);
  return <div className="es-progress" data-tone={tone}>{ratio === null ? <span className="es-progress-unavailable" role="status">{label} — unavailable</span> : <><div className="es-meter-label"><span>{label}</span><span>{Math.round(ratio * max)} / {max}</span></div><progress aria-label={label} max={max} value={ratio * max} /></>}</div>;
}
export function SegmentedMeter({ label, value, max = 100, tone = 'neutral' }: { label: string; value: number | null; max?: number; tone?: 'neutral' | 'brand' | 'success' }) {
  const ratio = fraction(value, max);
  return <div className="es-segmented-meter" data-tone={tone}><div className="es-meter-label"><span>{label}</span><span>{ratio === null ? '—' : Math.round(ratio * max)}</span></div><MeterSegments label={label} value={value} max={max} tone={tone} /></div>;
}
export type MetricProps = {
  label: string;
  /** Caller-rendered fallback; never parsed to recover a numeric value. */
  value: string;
  /** Optional authoritative numeric value for a live metric. */
  numericValue?: number;
  /** Localized formatter paired with numericValue. */
  formatValue?: (value: number) => string;
  description?: string;
};

function AnimatedMetricValue({ value, fallback, format }: { value: number; fallback: string; format: (value: number) => string }) {
  const previous = useRef<number | null>(null);
  const [animatedFrom, setAnimatedFrom] = useState<number | null>(null);

  useLayoutEffect(() => {
    const prior = previous.current;
    previous.current = value;
    if (prior !== null && prior !== value) setAnimatedFrom(prior);
  }, [value]);

  if (animatedFrom === null) return <>{fallback}</>;
  return <AnimatedNumber value={value} initialValue={animatedFrom} format={format} fallback={fallback} />;
}

export function Metric({ label, value, numericValue, formatValue, description }: MetricProps) {
  const canAnimate = numericValue !== undefined && Number.isFinite(numericValue) && formatValue !== undefined;
  return <div className="es-metric"><span>{label}</span><strong>{canAnimate
    ? <AnimatedMetricValue value={numericValue} format={formatValue} fallback={value} />
    : value}</strong>{description && <small>{description}</small>}</div>;
}
export function DataList({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return <section className="es-data-list" aria-labelledby={id}><h2 id={id}>{label}</h2><div>{children}</div></section>;
}
