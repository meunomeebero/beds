import { animate, useMotionValue, type Transition } from 'motion/react';

/**
 * Press feedback for faces of native controls (a label or span wrapping a
 * radio). Motion's `whileTap` gives any element that is not natively focusable
 * `tabindex=0`, which put an inert extra tab stop beside every radio. This
 * drives the same spring from pointer events on a motion value: it starts in
 * the pointerdown handler (no re-render) and never touches focus.
 */
export function usePressScale(scale: number, enabled: boolean, transition: Transition) {
  const value = useMotionValue(1);
  const to = (target: number) => { animate(value, target, transition); };
  const release = () => to(1);
  return {
    style: { scale: value },
    onPointerDown: () => { if (enabled) to(scale); },
    onPointerUp: release,
    onPointerLeave: release,
    onPointerCancel: release,
  };
}
