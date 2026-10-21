import './score.css';
import { animate, motion, useInView } from 'motion/react';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { EASE_OUT } from './lib/ease';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';

const EASE_COUNT = [0.33, 1, 0.68, 1] as const;

/** How many segments a reading lights, and how many of those are the gain over `before`. */
export function scoreSegments(value: number, before: number | null, max = 100, segments = 28) {
  const count = (reading: number) => Math.round((Math.min(max, Math.max(0, reading)) / max) * segments);
  const valueCount = count(value);
  if (before === null || before >= value) return { base: valueCount, gain: 0 };
  const base = Math.min(count(before), segments - 1);
  // A real gain always lights at least one segment, even when rounding would hide it.
  return { base, gain: Math.min(Math.max(1, valueCount - base), segments - base) };
}

export type ScoreMeterEntrance = {
  /** False keeps the lit segments hidden until the caller starts the entrance. */
  play: boolean;
  /** ms before the first segment lights. */
  delay?: number;
  /** ms between two measured segments. */
  step?: number;
  /** ms between two gained segments. */
  gainStep?: number;
  /** A calm opacity-only fill of this many ms; omitted, gains pop (scale .5 → 1.35 → 1). */
  fill?: number;
};

export type ScoreMeterProps = {
  value: number;
  max?: number;
  segments?: number;
  /** `compare`: the measured part in neutral, the gain over `before` in the brand color. `level`: one reading tinted by `level`. */
  tone?: 'compare' | 'level';
  before?: number | null;
  /** Caller-owned band of a `level` reading; BEDS never decides what is strong. */
  level?: 'strong' | 'fair' | 'weak';
  /** `calm`: strong is green, the rest neutral (keeps the brand color meaning "added"). `traffic`: green / amber / red. */
  palette?: 'calm' | 'traffic';
  compact?: boolean;
  entrance?: ScoreMeterEntrance;
};

/**
 * Segmented score bar (28 segments, 12px, 3px gaps; compact 8px, 2px gaps). Decorative: the row next to it
 * states the value. Entrance lights measured segments left to right, then gained ones one after another;
 * nothing is hidden under reduced motion.
 */
export function ScoreMeter({ value, max = 100, segments = 28, tone = 'compare', before = null, level, palette = 'calm', compact = false, entrance }: ScoreMeterProps) {
  const reduce = useReducedMotionPreference();
  const { base, gain } = scoreSegments(value, tone === 'compare' ? before : null, max, segments);
  const animated = entrance !== undefined && !reduce;
  const playing = animated && entrance.play;
  const delay = entrance?.delay ?? 0;
  const step = entrance?.step ?? 16;
  const gainStep = entrance?.gainStep ?? 70;
  const fill = entrance?.fill;
  return <span className="es-score-meter" data-compact={compact || undefined} data-tone={tone} data-palette={tone === 'level' ? palette : undefined} data-level={tone === 'level' ? level : undefined} aria-hidden="true" style={{ '--es-score-segments': segments } as CSSProperties}>
    {Array.from({ length: segments }, (_, index) => {
      const state = index < base ? 'base' : index < base + gain ? 'gain' : 'empty';
      if (state === 'empty') return <span key={index} data-state={state} />;
      const order = state === 'gain' ? index - base : index;
      const at = (state === 'gain' ? delay + base * step + order * gainStep : delay + order * step) / 1000;
      const pop = state === 'gain' && fill === undefined;
      return <span key={index} data-state={state}>
        <motion.i
          initial={animated ? (pop ? { opacity: 0, scaleY: .5 } : { opacity: 0 }) : false}
          animate={!animated || playing ? (pop ? { opacity: [0, 1, 1], scaleY: [.5, 1.35, 1] } : { opacity: 1 }) : undefined}
          transition={pop ? { duration: .46, delay: at, ease: EASE_OUT, times: [0, .55, 1] } : { duration: (fill ?? 320) / 1000, delay: at, ease: EASE_OUT }}
        />
      </span>;
    })}
  </span>;
}

export type ScoreCriterion = {
  id: string;
  label: string;
  before: number;
  after: number;
  /** e.g. "Keywords: before 40, now 70 out of 100." */
  accessibleLabel: string;
};

function signed(delta: number) {
  return delta > 0 ? `+${delta}` : `\u2212${Math.abs(delta)}`;
}

export type ScoreComparisonProps = {
  /** Section heading, e.g. the score's name. */
  label: string;
  /** The current reading; null when there is no fair pair to show. */
  value: number | null;
  /** The reading before the change; null when there is no fair pair to show. */
  before: number | null;
  max?: number;
  beforeLabel: string;
  afterLabel: string;
  /** One sentence for assistive tech with both readings (and the gain when celebrated). */
  accessibleSummary: string;
  /** Present only for a measured win the product celebrates; everything else stays neutral. */
  gain?: { label: string; unit?: string };
  /** A band line under the pair; `emphasis` carries the gain color (a celebrated crossing). */
  band?: { text: string; emphasis?: boolean };
  /** A plain status line (e.g. a credit returned); shown even without a pair. */
  status?: string;
  /** Small print under a hairline: how the reading was measured. */
  notes?: string[];
  /** Per-criterion pairs measured the same way as the score; show all of them or none. */
  criteria?: { title: string; items: ScoreCriterion[] };
  /** Start only when the caller is ready (e.g. after a page entrance). Defaults to true. */
  ready?: boolean;
  /** Called once when a celebrated gain appears (the caller may play confetti or a sound). */
  onGainShown?: () => void;
  /** Called on every whole number of the count (e.g. a soft tick). */
  onCount?: (value: number) => void;
};

const CLIMB_SECONDS = 1.3;
const CLIMB_DELAY_SECONDS = .25;
const SEGMENT_STEP_MS = 12;
const FILL_MS = 240;
const METER_PAUSE_MS = 120;

function meterWindow(value: number, before: number | null, max: number) {
  const { base, gain } = scoreSegments(value, before, max);
  return Math.max(0, base + gain - 1) * SEGMENT_STEP_MS + FILL_MS + METER_PAUSE_MS;
}

/**
 * Score board: the current reading counts up from zero, then the pair reads as two segmented bars
 * (before, now). Only a celebrated gain gets the big brand-colored "+N" and brand segments; a small gain,
 * a tie or a drop stays neutral. No pair, no number.
 */
export function ScoreComparison({ label, value, before, max = 100, beforeLabel, afterLabel, accessibleSummary, gain, band, status, notes, criteria, ready = true, onGainShown, onCount }: ScoreComparisonProps) {
  const reduce = useReducedMotionPreference();
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, amount: .3 });
  const start = reduce || (seen && ready);
  const hasPair = value !== null && before !== null && Number.isFinite(value) && Number.isFinite(before);
  const celebrated = hasPair && gain !== undefined;
  const [shown, setShown] = useState(0);
  const done = useRef<number | null>(null);
  const countRef = useRef(onCount);
  const gainRef = useRef(onGainShown);
  useEffect(() => { countRef.current = onCount; gainRef.current = onGainShown; });

  useEffect(() => {
    if (!hasPair) return;
    if (reduce) { done.current = value; setShown(value); return; }
    if (!start || done.current === value) return;
    let previous = 0;
    const controls = animate(0, value, {
      duration: CLIMB_SECONDS, delay: CLIMB_DELAY_SECONDS, ease: EASE_COUNT,
      onUpdate: current => {
        const rounded = Math.round(current);
        if (rounded === previous) return;
        previous = rounded;
        setShown(rounded);
        countRef.current?.(rounded);
      },
      onComplete: () => { done.current = value; setShown(value); },
    });
    return () => controls.stop();
  }, [hasPair, value, start, reduce]);

  useEffect(() => {
    if (!start || !celebrated) return;
    const timer = setTimeout(() => gainRef.current?.(), reduce ? 0 : (CLIMB_DELAY_SECONDS + CLIMB_SECONDS) * 1000);
    return () => clearTimeout(timer);
  }, [start, celebrated, reduce]);

  if (!hasPair && !status) return null;
  const beforeDelay = (CLIMB_DELAY_SECONDS + CLIMB_SECONDS) * 1000 + 200;
  const afterDelay = hasPair ? beforeDelay + meterWindow(before, null, max) : 0;
  const bandDelay = hasPair ? afterDelay + meterWindow(value, celebrated ? before : null, max) : 0;
  let nextDelay = bandDelay + 320;
  const criteriaDelays = (criteria?.items ?? []).map(item => {
    const at = nextDelay;
    nextDelay += meterWindow(item.after, celebrated && item.after > item.before ? item.before : null, max);
    return at;
  });
  const accent = (delayMs: number, duration: number) => reduce ? {} : {
    initial: { opacity: 0, y: 4 },
    animate: start ? { opacity: 1, y: 0 } : undefined,
    transition: { duration, delay: delayMs / 1000, ease: EASE_OUT },
  };

  return <section ref={ref} className="es-score-board" data-celebrated={celebrated || undefined} aria-labelledby={hasPair ? `${id}-label` : undefined}>
    {hasPair && <>
      <h2 className="es-score-board-label" id={`${id}-label`}>{label}</h2>
      <p className="es-sr-only">{accessibleSummary}</p>
      <div className="es-score-board-hero" aria-hidden="true">
        <p className="es-score-board-number">{reduce ? value : shown}<small>/{max}</small></p>
        {celebrated && <motion.p className="es-score-board-gain" {...accent(1550, .24)}><b>{gain.label}</b>{gain.unit && <small>{gain.unit}</small>}</motion.p>}
      </div>
      <div className="es-score-board-compare" aria-hidden="true">
        <div className="es-score-row"><span className="es-score-row-label">{beforeLabel}</span><ScoreMeter value={before} max={max} entrance={{ play: start, delay: beforeDelay, step: SEGMENT_STEP_MS, gainStep: SEGMENT_STEP_MS, fill: FILL_MS }} /><span className="es-score-row-value">{before}</span></div>
        <div className="es-score-row" data-current><span className="es-score-row-label">{afterLabel}</span><ScoreMeter value={value} max={max} before={celebrated ? before : null} entrance={{ play: start, delay: afterDelay, step: SEGMENT_STEP_MS, gainStep: SEGMENT_STEP_MS, fill: FILL_MS }} /><span className="es-score-row-value">{value}</span></div>
      </div>
      {band && <motion.p className="es-score-board-band" data-emphasis={band.emphasis || undefined} {...accent(bandDelay, .32)}>{band.text}</motion.p>}
      {criteria && criteria.items.length > 0 && <div className="es-score-criteria">
        <h3>{criteria.title}</h3>
        <ul>{criteria.items.map((item, index) => {
          const delta = item.after - item.before;
          const lit = celebrated && delta > 0;
          return <li key={item.id} className="es-score-criterion" aria-label={item.accessibleLabel}>
            <span className="es-score-criterion-label" aria-hidden="true">{item.label}</span>
            <span className="es-score-criterion-value" aria-hidden="true"><span>{item.before} →</span>{item.after}{delta !== 0 && <motion.b data-up={lit || undefined} {...accent(criteriaDelays[index]!, .24)}>{signed(delta)}</motion.b>}</span>
            <ScoreMeter value={item.after} max={max} before={lit ? item.before : null} compact entrance={{ play: start, delay: criteriaDelays[index], step: SEGMENT_STEP_MS, gainStep: SEGMENT_STEP_MS, fill: FILL_MS }} />
          </li>;
        })}</ul>
      </div>}
    </>}
    {status && <p className="es-score-board-status">{status}</p>}
    {hasPair && notes && notes.length > 0 && <div className="es-score-board-notes">{notes.map(note => <p key={note}>{note}</p>)}</div>}
  </section>;
}
