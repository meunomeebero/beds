import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from './foundation';
import { EASE_OUT } from './lib/ease';
import './toast.css';

const TOAST_EVENT = 'beds:toast';
const DISMISS_EVENT = 'beds:toast-dismiss';
const DEFAULT_LIFETIME = 5000;

export type ToastTone = 'neutral' | 'pending' | 'success' | 'warning' | 'error' | 'info';
export type ToastAction = { label: string; onClick: () => void };
export type ToastInput = {
  id?: string;
  message: string;
  tone?: ToastTone;
  action?: ToastAction;
  /** Informational timeout, minimum 5s. Zero persists; errors, warnings and actions always persist. */
  lifetime?: number;
};
type ToastNote = ToastInput & { id: string };

let nextToastId = 0;

/**
 * Adapted from beUI `animated-toast-stack` (MIT),
 * https://beui.dev/r/animated-toast-stack/raw, retrieved 2026-09-19.
 *
 * BEDS keeps the public event API and its established top-centered geometry,
 * timeout rules, pause semantics, live-region roles and focus recovery. The
 * upstream layout-aware stack, status morph and swipe dismissal are expressed
 * with the already-approved `motion/react` runtime and BEDS-owned tokens.
 * Source SHA-256: e1fe639d87cc5419b720e48289a9ee2ba776050413cede9b8f08af48ee28da28.
 */

/** Show or update a toast. Reusing an id updates the existing notification. */
export function toast(input: string | ToastInput) {
  if (typeof window === 'undefined') return '';
  const value = typeof input === 'string' ? { message: input } : input;
  const id = value.id ?? `beds-toast-${++nextToastId}`;
  window.dispatchEvent(new CustomEvent<ToastNote>(TOAST_EVENT, { detail: { ...value, id } }));
  return id;
}

export function dismissToast(id: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<string>(DISMISS_EVENT, { detail: id }));
}

function iconFor(tone: ToastTone): IconName | null {
  if (tone === 'pending') return 'Loader2';
  if (tone === 'success') return 'CheckCircle2';
  if (tone === 'warning' || tone === 'error') return 'AlertCircle';
  if (tone === 'info') return 'Info';
  return null;
}

function delayFor(note: ToastNote) {
  if (note.tone === 'pending' || note.tone === 'error' || note.tone === 'warning' || note.action || note.lifetime === 0) return null;
  if (note.lifetime !== undefined && Number.isFinite(note.lifetime)) return Math.max(DEFAULT_LIFETIME, note.lifetime);
  return DEFAULT_LIFETIME;
}

const STACK_SPRING: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.75,
};

const CONTENT_TRANSITION = {
  duration: 0.28,
  ease: EASE_OUT,
} as const;

const ToastItem = memo(function ToastItem({
  note,
  index,
  dismissLabel,
  onDismiss,
}: {
  note: ToastNote;
  index: number;
  dismissLabel: string;
  onDismiss: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const tone = note.tone ?? 'neutral';
  const icon = iconFor(tone);
  const hasAction = Boolean(note.action);

  return <motion.div
    layout={!reduce}
    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.96, filter: 'blur(10px)' }}
    animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
    exit={reduce ? { opacity: 0 } : { opacity: 0, x: 32, scale: 0.96, filter: 'blur(8px)', transition: { duration: 0.18, ease: EASE_OUT } }}
    transition={reduce ? { duration: 0.14, ease: EASE_OUT } : STACK_SPRING}
    drag={!reduce ? 'x' : false}
    dragConstraints={{ left: 0, right: 0 }}
    dragElastic={0.18}
    onDragEnd={(_, info) => {
      if (Math.abs(info.offset.x) > 72 || Math.abs(info.velocity.x) > 520) onDismiss(note.id);
    }}
    className="es-toast"
    data-tone={tone}
    data-toast-id={note.id}
    role={tone === 'error' ? 'alert' : 'status'}
    style={{ zIndex: 20 - index }}
  >
    {icon && <motion.span layout={!reduce} className="es-toast-icon">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={tone}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.8, filter: 'blur(6px)' }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.9, filter: 'blur(6px)' }}
          transition={CONTENT_TRANSITION}
          className="es-toast-icon-glyph"
        >
          <motion.span
            animate={tone === 'pending' && !reduce ? { rotate: 360 } : undefined}
            transition={tone === 'pending' && !reduce ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : undefined}
            className="es-toast-icon-spin"
          >
            <Icon name={icon} purpose="small" />
          </motion.span>
        </motion.span>
      </AnimatePresence>
    </motion.span>}
    <div className="es-toast-content">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`${note.id}-${tone}-${note.message}`}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(6px)' }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(6px)' }}
          transition={CONTENT_TRANSITION}
          className="es-toast-message"
        >{note.message}</motion.span>
      </AnimatePresence>
    </div>
    {hasAction && <button type="button" className="es-toast-action" onClick={() => { note.action?.onClick(); onDismiss(note.id); }}>{note.action?.label}</button>}
    <button type="button" className="es-toast-dismiss" aria-label={`${dismissLabel}: ${note.message}`} onClick={() => onDismiss(note.id)}><Icon name="X" purpose="small" /></button>
  </motion.div>;
});

export function Toaster({ label = 'Notificações', dismissLabel = 'Fechar notificação' }: { label?: string; dismissLabel?: string }) {
  const [notes, setNotes] = useState<ToastNote[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [documentHidden, setDocumentHidden] = useState(false);
  const deadlines = useRef(new Map<string, number | null>());
  const remaining = useRef(new Map<string, number>());
  const region = useRef<HTMLElement>(null);
  const origins = useRef(new Map<string, HTMLElement>());
  const paused = hovered || focused || documentHidden;

  useEffect(() => {
    // Removing the last child disables pointer events on the empty region;
    // browsers need not dispatch pointerleave for the vanished hover target.
    if (notes.length === 0) { setHovered(false); setFocused(false); }
  }, [notes.length]);

  const remove = useCallback((id: string) => {
    const item = [...(region.current?.children ?? [])].find(element => element.getAttribute('data-toast-id') === id);
    if (item?.contains(document.activeElement)) {
      const sibling = item.nextElementSibling ?? item.previousElementSibling;
      const target = sibling?.querySelector<HTMLButtonElement>('button') ?? origins.current.get(id);
      if (target?.isConnected) target.focus({ preventScroll: true });
    }
    deadlines.current.delete(id);
    remaining.current.delete(id);
    origins.current.delete(id);
    setNotes(current => current.filter(note => note.id !== id));
  }, []);

  useEffect(() => {
    const onToast = (event: Event) => {
      const note = (event as CustomEvent<ToastNote>).detail;
      if (!origins.current.has(note.id) && document.activeElement instanceof HTMLElement) origins.current.set(note.id, document.activeElement);
      const delay = delayFor(note);
      deadlines.current.set(note.id, delay === null ? null : performance.now() + delay);
      remaining.current.delete(note.id);
      setNotes(current => {
        const rest = current.filter(item => item.id !== note.id);
        return [note, ...rest];
      });
    };
    const onDismiss = (event: Event) => remove((event as CustomEvent<string>).detail);
    window.addEventListener(TOAST_EVENT, onToast);
    window.addEventListener(DISMISS_EVENT, onDismiss);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      window.removeEventListener(DISMISS_EVENT, onDismiss);
      deadlines.current.clear();
      remaining.current.clear();
      origins.current.clear();
    };
  }, [remove]);

  useEffect(() => {
    const onVisibility = () => setDocumentHidden(document.hidden);
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    const now = performance.now();
    if (paused) {
      for (const [id, deadline] of deadlines.current) {
        if (deadline !== null && !remaining.current.has(id)) remaining.current.set(id, Math.max(0, deadline - now));
      }
      return;
    }
    for (const [id, left] of remaining.current) deadlines.current.set(id, now + left);
    remaining.current.clear();
    const active = [...deadlines.current.values()].filter((deadline): deadline is number => deadline !== null);
    if (active.length === 0) return;
    let timer: number;
    const expire = () => {
      const at = performance.now();
      const expired = [...deadlines.current].filter(([, deadline]) => deadline !== null && deadline <= at).map(([id]) => id);
      expired.forEach(remove);
      // A fractional deadline can be rounded down by the browser timer. Rearm
      // instead of leaving the last informational notice mounted forever.
      if (expired.length === 0) timer = window.setTimeout(expire, Math.max(1, Math.ceil(Math.min(...active) - at)));
    };
    timer = window.setTimeout(expire, Math.max(1, Math.ceil(Math.min(...active) - now)));
    return () => window.clearTimeout(timer);
  }, [notes, paused, remove]);

  return <section ref={region} className="es-toast-region" aria-label={label} aria-live="polite" aria-relevant="additions text"
    onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <AnimatePresence initial={false} mode="popLayout">
      {notes.map((note, index) => <ToastItem key={note.id} note={note} index={index} dismissLabel={dismissLabel} onDismiss={remove} />)}
    </AnimatePresence>
  </section>;
}
