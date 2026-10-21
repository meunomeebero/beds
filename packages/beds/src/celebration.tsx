import './celebration.css';
import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';

const PIECES = 90;
const BURST_MS = 4800;
const FALL_EASE = [0.25, 0.6, 0.45, 1] as const;

/** Deterministic pseudo-random: the same rain on every replay, no Math.random in render. */
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function Rain({ seed, contained }: { seed: number; contained: boolean }) {
  const layer = useRef<HTMLDivElement>(null);
  const [fall, setFall] = useState(700);
  useLayoutEffect(() => {
    if (!layer.current) return;
    setFall((contained ? Math.min(layer.current.offsetHeight, 780) : layer.current.offsetHeight) + 60);
  }, [contained]);
  const pieces = useMemo(() => Array.from({ length: PIECES }, (_, index) => {
    const wide = seeded(index, 1 + seed * 11) > .55;
    return {
      left: seeded(index, 2 + seed * 11) * 100,
      delay: seeded(index, 3 + seed * 11) * .9,
      duration: 2.1 + seeded(index, 4 + seed * 11) * 1.4,
      sway: (seeded(index, 5 + seed * 11) - .5) * 140,
      spin: (seeded(index, 6 + seed * 11) > .5 ? 1 : -1) * (360 + seeded(index, 7 + seed * 11) * 540),
      width: wide ? 10 : 6,
      height: wide ? 5 : 10,
      round: seeded(index, 8 + seed * 11) > .82,
      color: `var(--es-confetti-${(index % 6) + 1})`,
    };
  }), [seed]);
  return <div ref={layer} className="es-confetti" data-fixed={contained ? undefined : ''} aria-hidden="true">
    {pieces.map((piece, index) => <motion.i
      key={index}
      style={{ left: `${piece.left}%`, width: piece.width, height: piece.height, borderRadius: piece.round ? '50%' : 1.5, background: piece.color } as CSSProperties}
      initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
      animate={{ opacity: [0, 1, 1, 0], x: piece.sway, y: fall, rotate: piece.spin }}
      transition={{ duration: piece.duration, delay: piece.delay, ease: FALL_EASE, opacity: { duration: piece.duration, delay: piece.delay, times: [0, .08, .8, 1], ease: FALL_EASE } }}
    />)}
  </div>;
}

export type ConfettiBurstProps = {
  /** Each new non-zero value (a counter or a timestamp) plays one rain, removed after about 5s. */
  burst: number;
  /** A different rain for a second burst. */
  seed?: number;
  /** Rain inside the nearest positioned ancestor instead of over the viewport. */
  contained?: boolean;
};

/**
 * One-off confetti for a real win (a goal reached, an offer accepted), never for routine success.
 * Decorative and silent: aria-hidden, pointer-transparent, transform and opacity only, absent under
 * reduced motion. The caller states the win in text and owns any sound.
 */
export function ConfettiBurst({ burst, seed = 0, contained = false }: ConfettiBurstProps) {
  const reduce = useReducedMotionPreference();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!burst) return;
    setShown(burst);
    const timer = setTimeout(() => setShown(current => current === burst ? 0 : current), BURST_MS);
    return () => clearTimeout(timer);
  }, [burst]);
  if (!shown || reduce) return null;
  // Rendered in place (inside the provider root, where the tokens live); `fixed` covers the viewport.
  return <Rain key={shown} seed={seed} contained={contained} />;
}
