import { useLayoutEffect, type KeyboardEvent, type MouseEvent, type RefObject } from 'react';

const scrollLocks = new WeakMap<Document, { count: number; overflow: string; overflowPriority: string; padding: string; paddingPriority: string }>();

function lockDocumentScroll(document: Document) {
  const existing = scrollLocks.get(document);
  if (existing) {
    existing.count++;
  } else {
    const body = document.body;
    const view = document.defaultView!;
    const gutter = view.innerWidth - document.documentElement.clientWidth;
    const lock = { count: 1, overflow: body.style.getPropertyValue('overflow'), overflowPriority: body.style.getPropertyPriority('overflow'), padding: body.style.getPropertyValue('padding-right'), paddingPriority: body.style.getPropertyPriority('padding-right') };
    scrollLocks.set(document, lock);
    if (gutter > 0) body.style.setProperty('padding-right', `${parseFloat(view.getComputedStyle(body).paddingRight) + gutter}px`);
    body.style.setProperty('overflow', 'hidden');
  }
  return () => {
    const lock = scrollLocks.get(document);
    if (!lock || --lock.count > 0) return;
    document.body.style.setProperty('overflow', lock.overflow, lock.overflowPriority);
    document.body.style.setProperty('padding-right', lock.padding, lock.paddingPriority);
    scrollLocks.delete(document);
  };
}

export function useModal(open: boolean, dialog: RefObject<HTMLDialogElement | null>) {
  useLayoutEffect(() => {
    const element = dialog.current;
    if (!open || !element) return;
    const previous = document.activeElement as HTMLElement | null;
    element.showModal();
    const unlockScroll = lockDocumentScroll(element.ownerDocument);
    return () => {
      element.close();
      unlockScroll();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open, dialog]);
}

export function outsideDialog(event: MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return false;
  const bounds = event.currentTarget.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
}

export function containModalTab(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab' || event.defaultPrevented) return;
  const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]')].filter(control => control.tabIndex >= 0 && control.getClientRects().length > 0 && !control.closest('[inert]'));
  const first = controls[0];
  const last = controls.at(-1);
  if (!first) {
    event.preventDefault();
    return;
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
