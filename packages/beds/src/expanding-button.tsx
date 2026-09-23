// Adapted from beUI expanding-arrow-button (https://beui.dev/components/motion/expanding-arrow-button,
// retrieved 2026-09-22, MIT). Keeps the accent that grows from the leading chip to fill the pill;
// BEDS adds tokens, a brand-mark slot, focus-visible expansion, touch sizing and reduced motion.
import './expanding-button.css';
import { motion } from 'motion/react';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from './foundation';
import { SPRING_LAYOUT, SPRING_PRESS } from './lib/ease';
import { useHoverCapable } from './lib/hooks/use-hover-capable';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';

export type ExpandingButtonProps = {
  /** Visible text. Keep it to one short verb phrase. */
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  /** Lucide glyph in the chip. Ignored when `mark` is set. */
  icon?: IconName;
  /** Monochrome brand glyph (e.g. a sign-in provider logo) drawn with `currentColor`. Decorative: always hidden from assistive tech. */
  mark?: ReactNode;
  /** Fixed placement geometry: `default` 40px for headers and panels, `hero` 48px beside a hero headline. */
  context?: 'default' | 'hero';
  /** Fuller accessible name. It must contain the visible label, e.g. label "Entrar", accessibleLabel "Entrar com X". */
  accessibleLabel?: string;
  disabled?: boolean;
  'aria-describedby'?: string;
};

const INSET = { default: 4, hero: 5 } as const;

/** Pill call to action whose brand-colored chip grows to fill the control on hover or keyboard focus. */
export function ExpandingButton({ label, onClick, type = 'button', icon = 'ArrowRight', mark, context = 'default', accessibleLabel, disabled, 'aria-describedby': describedBy }: ExpandingButtonProps) {
  const reduce = useReducedMotionPreference();
  const canHover = useHoverCapable();
  const ref = useRef<HTMLButtonElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const inset = INSET[context];
  const expanded = !disabled && ((canHover && hovered) || focused);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const border = entry.borderBoxSize?.[0];
      setBox({ width: border?.inlineSize ?? node.offsetWidth, height: border?.blockSize ?? node.offsetHeight });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const glyph = mark ?? <Icon name={icon} purpose="small" />;
  const inner = <><span className="es-expanding-button-chip">{glyph}</span><span className="es-expanding-button-label">{label}</span></>;

  return <motion.button
    ref={ref}
    type={type}
    className="es-expanding-button"
    data-context={context}
    data-expanded={expanded || undefined}
    aria-label={accessibleLabel}
    aria-describedby={describedBy}
    disabled={disabled}
    onClick={onClick}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    onFocus={event => setFocused(event.currentTarget.matches(':focus-visible'))}
    onBlur={() => setFocused(false)}
    whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
    transition={SPRING_PRESS}
  >
    <span className="es-expanding-button-content">{inner}</span>
    <motion.span
      className="es-expanding-button-accent"
      aria-hidden="true"
      initial={false}
      animate={box ? { width: expanded ? box.width - inset * 2 : box.height - inset * 2 } : undefined}
      transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
    >
      <span className="es-expanding-button-content" style={box ? { inlineSize: box.width - inset * 2 } : undefined}>{inner}</span>
    </motion.span>
  </motion.button>;
}
