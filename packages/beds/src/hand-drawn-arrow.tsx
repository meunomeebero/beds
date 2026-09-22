import './hand-drawn-arrow.css';
import { motion } from 'motion/react';
import { EASE_OUT } from './lib/ease';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';

export type HandDrawnArrowDirection = 'down-left' | 'down-right' | 'up-left' | 'up-right' | 'left' | 'right';
export type HandDrawnArrowShape = 'curve' | 'loop' | 'straight';
export type HandDrawnArrowProps = {
  /** Handwritten note. Omit for a purely decorative arrow. */
  label?: string;
  /** Where the arrowhead points. The note sits on the opposite side. */
  direction?: HandDrawnArrowDirection;
  shape?: HandDrawnArrowShape;
  /** Fixed placement contexts: inline next to a small control, default, or beside a hero CTA. */
  context?: 'compact' | 'default' | 'hero';
  /** `brand` colors only the decorative stroke; the note keeps the heading color. */
  tone?: 'default' | 'secondary' | 'brand';
  /** Draw the stroke once when it first enters the viewport. */
  drawIn?: boolean;
};

type Stroke = { line: string; head: string };
// Diagonal strokes point down-left inside 64×48; horizontal strokes point left inside 64×28.
const diagonal: Record<HandDrawnArrowShape, Stroke> = {
  curve: { line: 'M58 5C44 3 20 9 11 39', head: 'M4 31L11 41L20 34' },
  loop: { line: 'M60 4C50 4 40 8 38 16C36 24 46 26 46 19C46 12 34 12 26 20C19 27 14 33 12 40', head: 'M5 33L12 42L21 36' },
  straight: { line: 'M58 6C46 14 26 26 12 39', head: 'M16.6 28.3L12 39L23.6 38.1' },
};
const horizontal: Record<HandDrawnArrowShape, Stroke> = {
  curve: { line: 'M60 8C44 2 22 4 8 16', head: 'M11.7 4.9L8 16L19.5 14.1' },
  loop: { line: 'M60 20C50 22 42 18 42 11C42 4 52 4 51 12C50 20 36 22 8 16', head: 'M19.1 12.2L8 16L16.5 24' },
  straight: { line: 'M60 13C44 15 24 12 6 14', head: 'M15.4 7L6 14L16.6 20' },
};

/** Pen-drawn arrow with an optional handwritten note, for pointing at a nearby call to action. */
export function HandDrawnArrow({ label, direction = 'down-left', shape = 'curve', context = 'default', tone = 'default', drawIn = true }: HandDrawnArrowProps) {
  const reduce = useReducedMotionPreference();
  const flat = direction === 'left' || direction === 'right';
  const stroke = (flat ? horizontal : diagonal)[shape];
  const height = flat ? 28 : 48;
  const mirrorX = direction.endsWith('right');
  const mirrorY = direction.startsWith('up');
  const flip = mirrorX || mirrorY ? `translate(${mirrorX ? 64 : 0} ${mirrorY ? height : 0}) scale(${mirrorX ? -1 : 1} ${mirrorY ? -1 : 1})` : undefined;
  const draw = (delay: number, duration: number) => drawIn ? {
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true },
    transition: reduce ? { duration: 0 } : { delay, duration, ease: EASE_OUT },
  } : {};
  return <span className="es-hand-arrow" data-direction={direction} data-context={context} data-tone={tone} aria-hidden={label ? undefined : true}>
    {label && <span className="es-hand-arrow-label">{label}</span>}
    <svg className="es-hand-arrow-mark" data-flat={flat || undefined} viewBox={`0 0 64 ${height}`} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <g transform={flip}>
        <motion.path className="es-hand-arrow-path" d={stroke.line} {...draw(.3, .55)} />
        <motion.path className="es-hand-arrow-path" d={stroke.head} {...draw(.8, .2)} />
      </g>
    </svg>
  </span>;
}
