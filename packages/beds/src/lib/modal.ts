import { useLayoutEffect, type KeyboardEvent, type MouseEvent, type RefObject } from 'react';

const scrollLocks = new WeakMap<Document, { count: number; overflow: string; overflowPriority: string; padding: string; paddingPriority: string }>();
type ModalEntry = { element: HTMLDialogElement; opener: HTMLElement | null };
const modalStacks = new WeakMap<Document, ModalEntry[]>();

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
  return useModalWithOptions(open, dialog);
}

type ModalOptions = {
  initialFocus?: (element: HTMLDialogElement) => void;
};

/**
 * Own the native modal lifetime in one place. Callers may keep `open` true
 * during a visual exit; the native top layer and scroll lock then remain in
 * place until the caller changes this lifecycle flag to false.
 */
export function useModalWithOptions(open: boolean, dialog: RefObject<HTMLDialogElement | null>, options: ModalOptions = {}) {
  const initialFocus = options.initialFocus;
  useLayoutEffect(() => {
    const element = dialog.current;
    if (!open || !element) return;
    const ownerDocument = element.ownerDocument;
    const previous = ownerDocument.activeElement instanceof HTMLElement ? ownerDocument.activeElement : null;
    // React StrictMode and controlled reversals can replay effects. Native
    // showModal throws when called on an already-open dialog, so make the
    // operation idempotent at this boundary.
    if (!element.open) element.showModal();
    const stack = modalStacks.get(ownerDocument) ?? [];
    const entry: ModalEntry = { element, opener: previous };
    stack.push(entry);
    modalStacks.set(ownerDocument, stack);
    const unlockScroll = lockDocumentScroll(element.ownerDocument);
    initialFocus?.(element);
    return () => {
      const currentStack = modalStacks.get(ownerDocument) ?? [];
      const wasTopmost = currentStack.at(-1)?.element === element;
      const index = currentStack.findIndex(item => item.element === element);
      if (index >= 0) currentStack.splice(index, 1);
      if (currentStack.length > 0) modalStacks.set(ownerDocument, currentStack);
      else modalStacks.delete(ownerDocument);
      if (element.open) element.close();
      unlockScroll();
      if (!wasTopmost) return;
      const remaining = currentStack.at(-1);
      if (remaining?.element.isConnected) {
        if (previous?.isConnected && remaining.element.contains(previous)) previous.focus({ preventScroll: true });
        else remaining.element.focus({ preventScroll: true });
      } else if (previous?.isConnected) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [open, dialog, initialFocus]);
}

export function useModalWithInitialFocus(open: boolean, dialog: RefObject<HTMLDialogElement | null>, initialFocus?: (element: HTMLDialogElement) => void) {
  useModalWithOptions(open, dialog, { initialFocus });
}

export function outsideDialog(event: MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return false;
  const bounds = event.currentTarget.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
}

/** A pointer/click landed on the transparent native shell itself. */
export function dialogShell(event: Pick<MouseEvent<HTMLDialogElement>, 'target' | 'currentTarget'>) {
  return event.target === event.currentTarget;
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
