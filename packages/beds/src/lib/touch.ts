// Shared touch primitives copied from beUI's tooltip companion source.
// Gesture surfaces opt out of platform selection/callout only where the
// surface owns the gesture; ordinary BEDS text remains selectable.

/** Surface classes used by controls that own a pointer gesture. */
export const TOUCH_GESTURE_CLASS = "select-none [-webkit-touch-callout:none]";

/** Content wrapper classes for coarse-pointer gesture surfaces. */
export const TOUCH_GESTURE_CONTENT_CLASS =
  "[-webkit-touch-callout:none] pointer-coarse:select-none";

/** Temporarily suppress selection while an owned gesture is active. */
export function holdSelection(element: HTMLElement) {
  element.style.setProperty("user-select", "none");
  element.style.setProperty("-webkit-user-select", "none");
  return () => {
    element.style.removeProperty("user-select");
    element.style.removeProperty("-webkit-user-select");
  };
}

/** Best-effort pointer capture; stale iOS pointers are harmless. */
export function capturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // The browser already released the pointer.
  }
}

/** Release a capture taken with capturePointer, ignoring stale pointers. */
export function releasePointer(element: Element, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
  } catch {
    // The browser already released the pointer.
  }
}

/** True when a pointer is resting over a surface rather than pressing it. */
export const isHoveringPointer = (event: {
  pointerType: string;
  buttons: number;
}) => event.pointerType !== "touch" && event.buttons === 0;
