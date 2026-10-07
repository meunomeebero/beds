import type { MotionProps } from 'motion/react';
import { EASE_OUT, SPRING_PANEL } from './ease.js';

type ModalMotionPreset = 'default' | 'elastic';
type ModalMotion = Pick<MotionProps, 'initial' | 'animate' | 'transition'>;

const DIALOG_ENTER_TRANSITION = { duration: 0.18, ease: [0.23, 1, 0.32, 1] } as const;
const EXIT_TRANSITION = { duration: 0.15, ease: EASE_OUT } as const;
const FADE_TRANSITION = { duration: 0.14, ease: EASE_OUT } as const;
const DIALOG_START = 'translateY(4px) scale(0.97)';
const DIALOG_END = 'translateY(0px) scale(1)';

/** One internal surface owner; full transform strings avoid shorthand ownership conflicts. */
export function dialogMotion(open: boolean, reduce: boolean, preset: ModalMotionPreset): ModalMotion {
  if (preset === 'default') return {
    initial: reduce ? { opacity: 0, scale: 1 } : { opacity: 0, scale: 0.97 },
    animate: open ? { opacity: 1, scale: 1 } : (reduce ? { opacity: 0, scale: 1 } : { opacity: 0, scale: 0.97 }),
    transition: reduce ? FADE_TRANSITION : open ? DIALOG_ENTER_TRANSITION : EXIT_TRANSITION,
  };
  return {
    initial: { opacity: 0, transform: reduce ? 'none' : DIALOG_START },
    // Motion compares targets, not transition changes. Distinct reduced targets
    // cancel a live spring AND retain the fade in its replacement completion.
    animate: reduce ? { opacity: [null, open ? 1 : 0], transform: 'none' } : { opacity: open ? 1 : 0, transform: open ? DIALOG_END : DIALOG_START },
    transition: {
      // An identity transform alone would leave an unchanged target spring running.
      transform: reduce ? { duration: 0 } : open ? { type: 'spring', duration: 0.26, bounce: 0.2 } : EXIT_TRANSITION,
      opacity: FADE_TRANSITION,
    },
  };
}

/** Preserve the drawer's spatial inline-end travel and native modal lifecycle. */
export function drawerMotion(open: boolean, reduce: boolean, preset: ModalMotionPreset, offscreen: '100%' | '-100%'): ModalMotion {
  if (preset === 'default') return {
    initial: reduce ? { opacity: 0, x: 0 } : { x: offscreen },
    animate: open ? (reduce ? { opacity: 1, x: 0 } : { x: 0 }) : (reduce ? { opacity: 0, x: 0 } : { x: offscreen }),
    transition: reduce ? { duration: 0.2, ease: EASE_OUT } : SPRING_PANEL,
  };
  const start = `translateX(${offscreen})`;
  const end = 'translateX(0%)';
  return {
    initial: { opacity: 0, transform: reduce ? 'none' : start },
    animate: reduce ? { opacity: [null, open ? 1 : 0], transform: 'none' } : { opacity: open ? 1 : 0, transform: open ? end : start },
    transition: {
      transform: reduce ? { duration: 0 } : open ? { type: 'spring', duration: 0.26, bounce: 0.16 } : EXIT_TRANSITION,
      opacity: FADE_TRANSITION,
    },
  };
}
