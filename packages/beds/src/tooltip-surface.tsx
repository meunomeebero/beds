import { motion, useReducedMotion, type Variants } from 'motion/react';
import { useMemo, type CSSProperties, type ReactNode, type Ref } from 'react';
import { EASE_OUT } from './lib/ease';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

const offsetFrom: Record<TooltipSide, { x?: number; y?: number }> = {
  top: { y: 8 },
  bottom: { y: -8 },
  left: { x: 8 },
  right: { x: -8 },
};

const TOOLTIP_SPRING = { type: 'spring', stiffness: 380, damping: 30, mass: 0.7 } as const;

function buildVariants(side: TooltipSide): Variants {
  const offset = offsetFrom[side];
  return {
    initial: { opacity: 0, scale: 0.9, filter: 'blur(5px)', x: offset.x ?? 0, y: offset.y ?? 0 },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      x: 0,
      y: 0,
      transition: {
        ...TOOLTIP_SPRING,
        opacity: { duration: 0.14, ease: EASE_OUT },
        filter: { duration: 0.18, ease: EASE_OUT },
      },
    },
    exit: {
      opacity: 0,
      scale: 0.94,
      filter: 'blur(3px)',
      x: (offset.x ?? 0) * 0.6,
      y: (offset.y ?? 0) * 0.6,
      transition: { duration: 0.12, ease: EASE_OUT },
    },
  };
}

const REDUCED_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.14, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.1, ease: EASE_OUT } },
};

/** Internal surface; positioning and public API remain owned by overlays.tsx. */
export function TooltipSurface({
  children,
  side = 'top',
  interactive = false,
  className = '',
  id,
  style,
  ref,
}: {
  children?: ReactNode;
  side?: TooltipSide;
  interactive?: boolean;
  className?: string;
  id?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLSpanElement>;
}) {
  const reduce = useReducedMotion();
  const variants = useMemo(() => reduce ? REDUCED_VARIANTS : buildVariants(side), [reduce, side]);
  return <motion.span
    ref={ref}
    id={id}
    style={style}
    role="tooltip"
    data-side={side}
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    className={`block rounded-lg border border-border bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-[var(--es-shadow-popup)] ${interactive ? 'pointer-events-auto max-w-[calc(100vw-16px)] whitespace-normal' : 'whitespace-nowrap'} ${className}`}
  >{children}</motion.span>;
}
