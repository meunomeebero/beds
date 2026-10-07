import { useLayoutEffect, useRef, type RefObject } from 'react';

function effectiveCssZoom(element: HTMLElement) {
  let zoom = 1;
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const value = Number.parseFloat(getComputedStyle(current).zoom);
    if (Number.isFinite(value) && value > 0) zoom *= value;
  }
  return zoom;
}

/** Internal positioning/focus primitive. Public components expose no geometry override. */
export function useAnchoredPopup({ open, anchor, panel, onOpenChange, width = 260, initialFocus = 'panel', placement = 'below' }: {
  open: boolean; anchor: RefObject<HTMLElement | null>; panel: RefObject<HTMLElement | null>;
  onOpenChange: (open: boolean) => void; width?: number | 'content'; initialFocus?: 'panel' | 'first-control' | 'none';
  placement?: 'above' | 'below';
}) {
  const change = useRef(onOpenChange);
  change.current = onOpenChange;
  useLayoutEffect(() => {
    const element = panel.current;
    const trigger = anchor.current;
    if (!open || !element || !trigger) return;
    const focusTarget = trigger.matches('button,a[href],input,select,textarea,[tabindex]') ? trigger : trigger.querySelector<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]');
    element.showPopover();
    const position = () => {
      const bounds = trigger.getBoundingClientRect();
      const zoom = effectiveCssZoom(trigger);
      const viewport = window.visualViewport;
      const left = (viewport?.offsetLeft ?? 0) / zoom;
      const top = (viewport?.offsetTop ?? 0) / zoom;
      const viewportWidth = (viewport?.width ?? innerWidth) / zoom;
      const viewportHeight = (viewport?.height ?? innerHeight) / zoom;
      const anchorLeft = bounds.left / zoom;
      const anchorTop = bounds.top / zoom;
      const anchorBottom = bounds.bottom / zoom;
      const inset = 16;
      element.style.width = width === 'content' ? 'max-content' : `${Math.min(width, Math.max(0, viewportWidth - inset * 2))}px`;
      element.style.maxWidth = `${Math.max(0, viewportWidth - inset * 2)}px`;
      element.style.maxHeight = `${Math.max(0, viewportHeight - inset * 2)}px`;
      const size = element.getBoundingClientRect();
      const popupWidth = size.width / zoom;
      const popupHeight = size.height / zoom;
      const below = anchorBottom + 4;
      const above = anchorTop - popupHeight - 4;
      const preferAbove = placement === 'above' && above >= top + inset;
      const preferredTop = preferAbove ? above : below + popupHeight <= top + viewportHeight - inset ? below : above;
      element.style.left = `${Math.max(left + inset, Math.min(anchorLeft, left + viewportWidth - popupWidth - inset))}px`;
      element.style.top = `${Math.max(top + inset, Math.min(preferredTop, top + viewportHeight - popupHeight - inset))}px`;
    };
    position();
    if (initialFocus === 'first-control') element.querySelector<HTMLElement>('button:not(:disabled),input:not(:disabled),a[href],[tabindex="0"]')?.focus({ preventScroll: true });
    if (initialFocus === 'panel') element.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => {
      if (!element.contains(event.target as Node) && !trigger.contains(event.target as Node)) change.current(false);
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      change.current(false);
    };
    document.addEventListener('pointerdown', outside, true);
    element.addEventListener('keydown', escape);
    trigger.addEventListener('keydown', escape);
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    window.visualViewport?.addEventListener('resize', position);
    window.visualViewport?.addEventListener('scroll', position);
    return () => {
      const restore = initialFocus !== 'none' && (element.contains(document.activeElement) || document.activeElement === document.body);
      if (element.isConnected && element.matches(':popover-open')) element.hidePopover();
      if (restore && focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
      document.removeEventListener('pointerdown', outside, true);
      element.removeEventListener('keydown', escape);
      trigger.removeEventListener('keydown', escape);
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
      window.visualViewport?.removeEventListener('resize', position);
      window.visualViewport?.removeEventListener('scroll', position);
    };
  }, [open, anchor, panel, width, initialFocus, placement]);
}
