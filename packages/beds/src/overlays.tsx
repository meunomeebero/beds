import { AnimatePresence, motion } from 'motion/react';
import { cloneElement, isValidElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Avatar, Icon, type IconName } from './foundation';
import { Button, IconButton } from './controls';
import { useDismiss } from './lib/hooks/use-dismiss';
import { useHoverGesture } from './lib/hooks/use-hover-gesture';
import { useTapGesture } from './lib/hooks/use-tap-gesture';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';
import { EASE_OUT, SPRING_PANEL } from './lib/ease';
import { containModalTab, dialogShell, outsideDialog, useModal, useModalWithInitialFocus } from './lib/modal';
import { nextOption } from './lib/option-navigation';
import { useAnchoredPopup } from './lib/anchored-popup';
import { TooltipSurface, type TooltipSide } from './tooltip-surface';
import './overlays.css';

export { FilterSelect, Select } from './select';
export type { FilterSelectProps, SelectOption, SelectProps } from './select';

type Option = { id: string; label: string; description?: string; icon?: IconName; disabled?: boolean };
const MENU_TYPEAHEAD_TIMEOUT = 500;

function normalizeMenuTypeahead(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

/** Dotted explanation affordance; hover, keyboard and explicit touch toggle share one popup. */
export function HelpLabel({ label, description, icon }: { label: string; description: string; icon?: IconName }) {
  const id = useId();
  const anchor = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const clearTimer = () => { clearTimeout(timer.current); timer.current = undefined; };
  useEffect(() => () => clearTimeout(timer.current), []);
  useAnchoredPopup({ open, anchor, panel, onOpenChange: setOpen, width: 280, initialFocus: 'none', placement: 'above' });
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { clearTimeout(timer.current); setOpen(false); }
    };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, [open]);
  const leave = () => {
    clearTimer();
    if (document.activeElement !== anchor.current) timer.current = setTimeout(() => setOpen(false), 120);
  };
  return <span className="es-help-label" onPointerEnter={event => {
    clearTimer();
    if (event.pointerType !== 'touch') timer.current = setTimeout(() => setOpen(true), 180);
  }} onPointerLeave={leave}>
    <button ref={anchor} type="button" className="es-help-label-trigger" aria-label={label} aria-describedby={open ? id : undefined}
      onFocus={event => { if (event.currentTarget.matches(':focus-visible')) { clearTimer(); setOpen(true); } }}
      onBlur={() => { clearTimer(); setOpen(false); }}
      onClick={() => { clearTimer(); setOpen(value => !value); }}>
      {icon && <Icon name={icon} purpose="action" />}<span>{label}</span>
    </button>
    {open && <div ref={panel} id={id} className="es-help-popup" role="tooltip" popover="manual" onPointerEnter={clearTimer} onPointerLeave={leave}>
      <div className="es-help-popup-title">{icon && <Icon name={icon} purpose="action" />}<span>{label}</span></div>
      <p>{description}</p>
    </div>}
  </span>;
}

export function DropdownMenu({ label, icon = 'MoreHorizontal', open, onOpenChange, items, onSelect }: {
  label: string; icon?: IconName; open: boolean; onOpenChange: (open: boolean) => void;
  items: (Omit<Option, 'description'> & { destructive?: boolean })[]; onSelect: (id: string) => void;
}) {
  const id = useId();
  const anchor = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const typeahead = useRef({ value: '', at: 0 });
  const active = items.find(item => item.id === activeId && !item.disabled) ?? items.find(item => !item.disabled);
  useAnchoredPopup({ open, anchor, panel, onOpenChange, width: 160 });
  useLayoutEffect(() => { if (open) panel.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }); }, [open, active?.id]);
  const resetTypeahead = () => { typeahead.current = { value: '', at: 0 }; };
  const moveByTypeahead = (key: string) => {
    const character = normalizeMenuTypeahead(key);
    if (!character) return;
    const now = Date.now();
    const previous = typeahead.current;
    const timedOut = now - previous.at > MENU_TYPEAHEAD_TIMEOUT;
    const repeated = !timedOut && previous.value.length > 0 && previous.value === character.repeat(previous.value.length);
    const query = repeated || timedOut ? character : `${previous.value}${character}`;
    const enabled = items.filter(item => !item.disabled);
    const currentIndex = enabled.findIndex(item => item.id === active?.id);
    const start = repeated ? currentIndex + 1 : 0;
    const match = [...enabled.slice(start), ...enabled.slice(0, start)]
      .find(item => normalizeMenuTypeahead(item.label).startsWith(query))
      ?? (query.length > 1 ? enabled.find(item => normalizeMenuTypeahead(item.label).startsWith(character)) : undefined);
    typeahead.current = { value: query, at: now };
    if (match) setActiveId(match.id);
  };
  const choose = (item: typeof items[number]) => { if (!item.disabled) { onSelect(item.id); resetTypeahead(); onOpenChange(false); } };
  return <div className="es-dropdown"><button ref={anchor} type="button" className="es-icon-button" aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => { resetTypeahead(); setActiveId(null); onOpenChange(!open); }} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); resetTypeahead(); setActiveId(nextOption(items, undefined, event.key === 'ArrowUp' ? 'End' : 'Home')); onOpenChange(true); } }}><Icon name={icon} purpose="action" /></button>
    {open && <div id={id} ref={panel} popover="manual" className="es-menu-popup" role="menu" aria-label={label} aria-activedescendant={active ? `${id}-${items.indexOf(active)}` : undefined} tabIndex={-1} onKeyDown={event => {
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); setActiveId(nextOption(items, active?.id, event.key)); }
      else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (active) choose(active); }
      else if (event.key === 'Tab') { anchor.current?.focus({ preventScroll: true }); resetTypeahead(); onOpenChange(false); }
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && !event.nativeEvent.isComposing) { event.preventDefault(); moveByTypeahead(event.key); }
    }}>{items.map((item, index) => <div key={item.id} id={`${id}-${index}`} role="menuitem" className="es-menu-item" aria-disabled={item.disabled || undefined} data-active={active?.id === item.id} data-destructive={item.destructive || undefined} onPointerMove={() => { if (!item.disabled) setActiveId(item.id); }} onClick={() => choose(item)}>{item.icon && <Icon name={item.icon} purpose="navigation" />}<span>{item.label}</span></div>)}</div>}
  </div>;
}

type TooltipPrimitiveProps = {
  content: ReactNode;
  children?: ReactElement;
  side?: TooltipSide;
  delay?: number;
  wrapperClassName?: string;
};

const TOOLTIP_GAP = 8;
// Keep a visual safety inset for the spring's scale overshoot. The anchor gap
// remains 8px; this inset only constrains the animated surface. The budget is
// deliberately wider than the calculated spring peak and scales with the
// surface, so a long mobile tooltip gets the same viewport guarantee.
const TOOLTIP_VIEWPORT_INSET = 10;
const TOOLTIP_SCALE_OVERSHOOT_BUDGET = 0.02;
const TOOLTIP_WARM_WINDOW_MS = 300;
const tooltipAnchorTransform: Record<TooltipSide, string> = {
  top: 'translate(-50%, -100%)',
  bottom: 'translate(-50%, 0)',
  left: 'translate(-100%, -50%)',
  right: 'translate(0, -50%)',
};
const tooltipTransformOrigin: Record<TooltipSide, string> = {
  top: 'center bottom',
  bottom: 'center top',
  left: 'right center',
  right: 'left center',
};
let lastTooltipHiddenAt = 0;

/** beUI tooltip logic adapted to the existing BEDS label/child API. */
function TooltipPrimitive({ content, children, side = 'bottom', delay = 120, wrapperClassName }: TooltipPrimitiveProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const id = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchor = useRef<HTMLSpanElement>(null);
  const surface = useRef<HTMLSpanElement>(null);
  const hover = useHoverGesture();
  const tap = useTapGesture<boolean>();

  const place = useCallback(() => {
    const element = anchor.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const point: Record<TooltipSide, { top: number; left: number }> = {
      top: { top: bounds.top - TOOLTIP_GAP, left: centerX },
      bottom: { top: bounds.bottom + TOOLTIP_GAP, left: centerX },
      left: { top: centerY, left: bounds.left - TOOLTIP_GAP },
      right: { top: centerY, left: bounds.right + TOOLTIP_GAP },
    };
    const next = point[side];
    const width = surface.current?.offsetWidth ?? 0;
    const height = surface.current?.offsetHeight ?? 0;
    const offsetX = side === 'left' ? width : side === 'right' ? 0 : width / 2;
    const offsetY = side === 'top' ? height : side === 'bottom' ? 0 : height / 2;
    const viewportInset = Math.max(TOOLTIP_VIEWPORT_INSET, TOOLTIP_GAP + width * TOOLTIP_SCALE_OVERSHOOT_BUDGET / 2);
    next.left = Math.max(viewportInset + offsetX, Math.min(next.left, window.innerWidth - viewportInset - width + offsetX));
    next.top = Math.max(viewportInset + offsetY, Math.min(next.top, window.innerHeight - viewportInset - height + offsetY));
    setCoords(previous => previous?.top === next.top && previous.left === next.left ? previous : next);
  }, [side]);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);
  const show = useCallback(() => {
    clearTimer();
    const warm = Date.now() - lastTooltipHiddenAt < TOOLTIP_WARM_WINDOW_MS;
    timer.current = setTimeout(() => { place(); setOpen(true); }, warm ? 0 : delay);
  }, [clearTimer, delay, place]);
  const hide = useCallback(() => {
    clearTimer();
    if (open) lastTooltipHiddenAt = Date.now();
    setOpen(false);
  }, [clearTimer, open]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const observer = new ResizeObserver(place);
    if (anchor.current) observer.observe(anchor.current);
    if (coords && surface.current) observer.observe(surface.current);
    return () => observer.disconnect();
  }, [coords, open, place]);
  useEffect(() => {
    if (!open) return;
    const onMove = () => place();
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open, place]);
  useEffect(() => () => clearTimer(), [clearTimer]);

  useDismiss(open, hide, anchor);

  if (!isValidElement(children)) return children;
  const existingDescription = (children.props as { 'aria-describedby'?: string })['aria-describedby'];
  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, {
    'aria-describedby': [existingDescription, open ? id : undefined].filter(Boolean).join(' ') || undefined,
  });
  const portalRoot = typeof document !== 'undefined' ? anchor.current?.closest<HTMLElement>('.es-root') ?? document.body : null;

  return <>
    <span
      ref={anchor}
      className={`relative inline-flex align-middle${wrapperClassName ? ` ${wrapperClassName}` : ''}`}
      onPointerEnter={(event: ReactPointerEvent<HTMLSpanElement>) => { if (hover.enter(event)) show(); }}
      onPointerLeave={(event: ReactPointerEvent<HTMLSpanElement>) => { if (hover.leave(event)) hide(); }}
      onFocus={show}
      onBlur={hide}
      onPointerDown={(event: ReactPointerEvent<HTMLSpanElement>) => tap.start(event, open)}
      onPointerCancel={tap.drop}
      onKeyDown={tap.drop}
      onClick={() => {
        const gesture = tap.take();
        if (!gesture || gesture.pointerType === 'mouse') return;
        if (gesture.state) hide();
        else { clearTimer(); place(); setOpen(true); }
      }}
    >{trigger}</span>
    {portalRoot ? createPortal(
      <AnimatePresence initial={false}>
        {open && coords ? <span
          className="pointer-events-none fixed z-[9999]"
          style={{ top: coords.top, left: coords.left, transform: tooltipAnchorTransform[side] }}
        >
          <TooltipSurface
            ref={surface}
            side={side}
            id={id}
            style={{ transformOrigin: tooltipTransformOrigin[side], maxWidth: 'calc(100vw - 16px)' }}
          >{content}</TooltipSurface>
        </span> : null}
      </AnimatePresence>,
      portalRoot,
    ) : null}
  </>;
}

export function Tooltip({ label, children }: { label: string; children: ReactElement<{ 'aria-describedby'?: string }> }) {
  return <TooltipPrimitive content={label} side="bottom">{children}</TooltipPrimitive>;
}

const DIALOG_UNFOLD_EASE = [0.2, 0, 0.2, 1] as const;
const DIALOG_UNFOLD_TRANSITION = { duration: 0.43, ease: DIALOG_UNFOLD_EASE } as const;
const DIALOG_REDUCED_TRANSITION = { duration: 0.14, ease: EASE_OUT } as const;

export function Dialog({ open, onOpenChange, title, description, children, actions, variant = 'standard', artwork }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children?: ReactNode; actions?: ReactNode; variant?: 'standard' | 'welcome'; artwork?: ReactNode;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const shellPointer = useRef(false);
  const reduce = useReducedMotionPreference();
  const radius = variant === 'welcome' ? 24 : 14;
  const foldedClip = `inset(48% 48% 48% 48% round ${radius}px)`;
  const openClip = `inset(0% 0% 0% 0% round ${radius}px)`;
  const [present, setPresent] = useState(open);
  const [settled, setSettled] = useState(() => open && reduce);
  const presentRef = useRef(present);
  const phaseRef = useRef(open ? 'open' : 'closed');
  const wasOpen = useRef(open);
  presentRef.current = present;
  phaseRef.current = open ? 'open' : 'closed';
  const focusShell = useCallback((element: HTMLDialogElement) => {
    element.focus({ preventScroll: true });
  }, []);
  useModalWithInitialFocus(present, dialog, focusShell);
  useLayoutEffect(() => {
    if (open && !wasOpen.current) dialog.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);
  useEffect(() => {
    if (open) {
      setPresent(true);
      if (reduce) setSettled(true);
    } else if (present) {
      setSettled(false);
    }
  }, [open, present, reduce]);
  const interactive = present && open && (reduce || settled);
  const entering = present && open && !reduce && !settled;
  useLayoutEffect(() => {
    const element = dialog.current;
    // A completed action can replace the focused control. Recover only lost
    // focus, never steal it from a nested modal or another active control.
    if (!open || !present || !element) return;
    if (element.ownerDocument.activeElement === element.ownerDocument.body) {
      element.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    }
  }, [open, present, children, actions]);
  return <dialog ref={dialog} className="es-dialog es-dialog-shell" data-variant={variant} data-phase={open ? (entering ? 'entering' : 'open') : 'exiting'} data-motion={reduce ? 'reduced' : 'full'} tabIndex={-1} aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined}
    onKeyDown={event => {
      if (event.key === 'Tab' && entering) {
        event.preventDefault(); dialog.current?.focus({ preventScroll: true }); return;
      }
      containModalTab(event);
    }}
    onCancel={event => { if (event.target !== event.currentTarget) return; event.preventDefault(); if (open) onOpenChange(false); }}
    onPointerDown={event => { shellPointer.current = dialogShell(event); }}
    onClick={event => { const shell = shellPointer.current && dialogShell(event); shellPointer.current = false; if (open && shell) onOpenChange(false); }}>
    <motion.div className="es-dialog-surface" data-phase={open ? (interactive ? 'settled' : 'entry-inert') : 'exit-inert'} inert={!interactive} style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      initial={reduce ? { opacity: 0, clipPath: openClip } : { opacity: 1, clipPath: foldedClip }}
      animate={open ? (reduce ? { opacity: 1, clipPath: openClip } : { opacity: 1, clipPath: openClip }) : (reduce ? { opacity: 0, clipPath: openClip } : { opacity: 1, clipPath: foldedClip })}
      transition={reduce ? DIALOG_REDUCED_TRANSITION : DIALOG_UNFOLD_TRANSITION}
      onAnimationComplete={() => {
        if (phaseRef.current === 'open') setSettled(true);
        else if (presentRef.current) setPresent(false);
      }}>
      {variant === 'welcome' && artwork && <div className="es-dialog-artwork">{artwork}</div>}
      <div className="es-dialog-header"><div><h2 id={`${id}-title`}>{title}</h2>{description && <p id={`${id}-description`}>{description}</p>}</div><IconButton label="Fechar" icon="X" onClick={() => onOpenChange(false)} /></div>
      {children && <div className="es-dialog-body">{children}</div>}
      {actions && <div className="es-dialog-actions">{actions}</div>}
    </motion.div>
  </dialog>;
}

/** Modal detail panel. Content, requests and any unsaved-change decision belong to the caller. */
export function Drawer({ open, onOpenChange, title, description, children, actions, headerActions,
  closeLabel = 'Fechar detalhes', contentLabel = 'Conteúdo dos detalhes',
}: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string;
  description?: string; children: ReactNode; actions?: ReactNode; headerActions?: ReactNode;
  closeLabel?: string; contentLabel?: string;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const startedOutside = useRef(false);
  const [overflow, setOverflow] = useState(false);
  const [present, setPresent] = useState(open);
  const reduce = useReducedMotionPreference();
  const directionRoot = typeof document !== 'undefined' ? document.querySelector<HTMLElement>('.es-root') ?? document.documentElement : null;
  const rtl = directionRoot ? getComputedStyle(directionRoot).direction === 'rtl' : false;
  const offscreen = rtl ? '-100%' : '100%';
  useEffect(() => { if (open) setPresent(true); }, [open]);
  useModal(present, dialog);
  useLayoutEffect(() => {
    if (!present || !open) return;
    body.current?.scrollTo(0, 0);
    dialog.current?.querySelector<HTMLButtonElement>('.es-drawer-close button')?.focus({ preventScroll: true });
  }, [open, present]);
  useLayoutEffect(() => {
    const element = body.current;
    if (!present || !element) return;
    const measure = () => setOverflow(element.scrollHeight > element.clientHeight + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    measure();
    // A recovery action may unmount the focused control. Keep focus in this
    // modal without stealing it from a nested dialog or an anchored popup.
    if (element.ownerDocument.activeElement === element.ownerDocument.body) {
      dialog.current?.querySelector<HTMLButtonElement>('.es-drawer-close button')?.focus({ preventScroll: true });
    }
    return () => observer.disconnect();
  }, [present, children]);
  return <motion.dialog ref={dialog} className="es-drawer fixed inset-y-0 [inset-inline-start:auto] [inset-inline-end:0] z-50 [&:not([open])]:hidden flex w-[min(var(--es-command-width),100%)] max-w-full h-full max-h-full m-0 p-0 border-0 [border-inline-start:1px_solid_var(--es-border)] rounded-none flex-col overflow-hidden overscroll-contain bg-card text-card-foreground shadow-[var(--es-shadow-dialog)] [font:400_14px/1.5_var(--es-font)] max-[767px]:w-full max-[767px]:[border-inline-start:0] [&_button]:min-h-10 [&_button]:max-w-full [&_button]:h-auto [&_button]:whitespace-normal [&_button]:[overflow-wrap:anywhere] [&_button>span]:min-w-0 [&_button>span]:whitespace-normal [&_button>span]:[overflow-wrap:anywhere] max-[767px]:[&_button]:min-h-11 max-[767px]:[&_button]:min-w-11 pointer-coarse:[&_button]:min-h-11 pointer-coarse:[&_button]:min-w-11" aria-labelledby={`${id}-title`} aria-modal="true"
    aria-describedby={description ? `${id}-description` : undefined}
    inert={!open}
    initial={reduce ? { opacity: 0, x: 0 } : { x: offscreen }}
    animate={open ? (reduce ? { opacity: 1, x: 0 } : { x: 0 }) : (reduce ? { opacity: 0, x: 0 } : { x: offscreen })}
    transition={reduce ? { duration: 0.2, ease: EASE_OUT } : SPRING_PANEL}
    onAnimationComplete={() => { if (!open && present) setPresent(false); }}
    onKeyDown={event => {
      if ((event.target as HTMLElement).closest('dialog') === event.currentTarget) containModalTab(event);
    }}
    onCancel={event => {
      if (event.target !== event.currentTarget) return;
      event.preventDefault(); onOpenChange(false);
    }}
    onPointerDown={event => { startedOutside.current = outsideDialog(event); }}
    onClick={event => { if (startedOutside.current && outsideDialog(event)) onOpenChange(false); }}>
    <header className="es-drawer-header grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 flex-none max-h-[40%] overflow-auto border-b border-[var(--es-border-subtle)] px-6 py-4 pt-[max(16px,env(safe-area-inset-top))]">
      <div className="es-drawer-heading min-w-0 self-center [overflow-wrap:anywhere]"><h2 id={`${id}-title`} className="m-0 text-[16px] leading-6 font-medium tracking-[-.15px] text-[color:var(--es-heading)] [text-wrap:balance]">{title}</h2>{description && <p id={`${id}-description`} className="mt-1 mb-0 text-[13px] leading-[19.5px] text-[color:var(--es-secondary)] [text-wrap:pretty]">{description}</p>}</div>
      <div className="es-drawer-close sticky top-0 col-start-2 row-start-1 self-start [&_button]:min-h-10 [&_button]:min-w-10 max-[767px]:[&_button]:min-h-11 max-[767px]:[&_button]:min-w-11"><IconButton label={closeLabel} icon="X" onClick={() => onOpenChange(false)} /></div>
      {headerActions && <div className="es-drawer-header-actions col-span-full flex items-center flex-wrap gap-2 mt-2">{headerActions}</div>}
    </header>
    <div ref={body} className="es-drawer-body flex-1 min-h-0 overflow-auto overscroll-contain scroll-py-6 p-6 pb-[max(24px,env(safe-area-inset-bottom))] focus-visible:outline-2 focus-visible:outline-[var(--es-focus)] focus-visible:outline-offset-[-4px] max-[767px]:px-[max(16px,env(safe-area-inset-left),env(safe-area-inset-right))]" role="region" aria-label={contentLabel} tabIndex={overflow ? 0 : undefined}>
      <div className="es-drawer-content min-w-0 [overflow-wrap:anywhere]">{children}</div>
    </div>
    {actions && <footer className="es-drawer-actions flex items-center justify-end flex-wrap gap-2 flex-none max-h-[35%] overflow-auto p-4 px-6 pb-[max(16px,env(safe-area-inset-bottom))] border-t border-[var(--es-border-subtle)] max-[767px]:px-[max(16px,env(safe-area-inset-left),env(safe-area-inset-right))]">{actions}</footer>}
  </motion.dialog>;
}

/** Named content section inside Drawer; fixed rhythm, no nested card surface. */
export function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return <section className="es-drawer-section min-w-0 mt-8 first:mt-0" aria-labelledby={id}><h3 id={id} className="m-0 mb-2 text-[13px] leading-[19.5px] font-medium text-[color:var(--es-heading)]">{title}</h3><div className="min-w-0">{children}</div></section>;
}

export { CommandPalette } from './command-palette';
export type { CommandPaletteItem, CommandPaletteProps } from './command-palette';

export type SearchResult = Option & {
  categoryId?: string;
  keywords?: string;
  identity?: { name: string; src?: string };
};

type SearchState = { kind: 'loading'; label: string } | {
  kind: 'error'; title: string; description: string;
  retry: { label: string; onClick: () => void };
};

const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

/** Rich discovery overlay. Callers own data, recency, requests and navigation. */
export function SearchDialog({ open, onOpenChange, title = 'Buscar', placeholder = 'Digite para buscar…',
  query, onQueryChange, items, onSelect, categories, resultsLabel = 'Resultados', state,
  filterMode = 'local', labels,
}: {
  open: boolean; onOpenChange: (open: boolean) => void; title?: string; placeholder?: string;
  query: string; onQueryChange: (query: string) => void; items: SearchResult[]; onSelect: (id: string) => void;
  categories?: { label: string; value: string; options: Option[]; onChange: (id: string) => void };
  resultsLabel?: string; state?: SearchState; filterMode?: 'local' | 'manual';
  labels?: { close?: string; clear?: string; empty?: string; emptyHint?: string; navigate?: string; open?: string; count?: (count: number) => string };
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const terms = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  const matches = filterMode === 'manual' ? items : items.filter(item => {
    const categoryMatches = !categories?.value || item.categoryId === categories.value;
    const haystack = normalizeSearch(`${item.label} ${item.description ?? ''} ${item.keywords ?? ''}`);
    return categoryMatches && terms.every(term => haystack.includes(term));
  });
  const results = state ? [] : matches;
  const active = results.find(item => item.id === activeId && !item.disabled) ?? results.find(item => !item.disabled);
  const count = labels?.count?.(results.length) ?? `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`;
  useModal(open, dialog);
  useLayoutEffect(() => {
    if (open) { setActiveId(null); input.current?.focus({ preventScroll: true }); }
  }, [open]);
  useLayoutEffect(() => {
    if (open) dialog.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [open, active?.id]);
  const choose = (item: SearchResult) => {
    if (item.disabled || state) return;
    onOpenChange(false);
    onSelect(item.id);
  };
  const clear = () => {
    setActiveId(null);
    onQueryChange('');
    categories?.onChange('');
    input.current?.focus();
  };
  return <dialog ref={dialog} className="es-search-dialog" aria-labelledby={`${id}-title`}
    onKeyDown={containModalTab} onCancel={event => { event.preventDefault(); onOpenChange(false); }}
    onClick={event => { if (outsideDialog(event)) onOpenChange(false); }}>
    <div className="es-search-dialog-header">
      <label id={`${id}-title`} htmlFor={`${id}-input`}>{title}</label>
      <IconButton label={labels?.close ?? 'Fechar busca'} icon="X" onClick={() => onOpenChange(false)} />
    </div>
    <div className="es-search-dialog-field">
      <Icon name="Search" purpose="feature" />
      <input ref={input} id={`${id}-input`} type="text" name="search" autoComplete="off" spellCheck={false}
        role="combobox" aria-expanded={open} aria-autocomplete="list" aria-controls={`${id}-results`}
        aria-activedescendant={active ? `${id}-result-${results.indexOf(active)}` : undefined}
        aria-describedby={`${id}-keyboard`} placeholder={placeholder} value={query}
        onChange={event => { setActiveId(null); onQueryChange(event.target.value); }}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setActiveId(nextOption(results, active?.id, event.key));
          } else if (event.key === 'Enter') {
            event.preventDefault(); if (active) choose(active);
          }
        }} />
    </div>
    {categories && <div className="es-search-categories" role="group" aria-label={categories.label}>
      {categories.options.map(category => <button key={category.id} type="button" disabled={category.disabled}
        aria-pressed={categories.value === category.id} onClick={() => { setActiveId(null); categories.onChange(category.id); }}>
        {category.icon && <Icon name={category.icon} purpose="action" />}<span>{category.label}</span>
      </button>)}
    </div>}
    <div className="es-search-results-heading"><span>{resultsLabel}</span>
      <span role="status" aria-atomic="true">{open ? state?.kind === 'loading' ? state.label : state?.kind === 'error' ? state.title : count : ''}</span>
    </div>
    <div className="es-search-results" id={`${id}-results`} role="listbox" aria-label={resultsLabel} aria-busy={state?.kind === 'loading' || undefined}>
      {results.map((item, index) => <div key={item.id} id={`${id}-result-${index}`} className="es-search-result"
        role="option" aria-selected={item.id === active?.id} aria-disabled={item.disabled || undefined}
        data-active={item.id === active?.id}
        onPointerMove={event => { if (event.pointerType === 'mouse' && !item.disabled) setActiveId(item.id); }}
        onMouseDown={event => event.preventDefault()} onClick={() => choose(item)}>
        <span className="es-search-result-mark" aria-hidden="true">{item.identity
          ? <Avatar name={item.identity.name} src={item.identity.src} purpose="workspace" />
          : <Icon name={item.icon ?? 'FileText'} purpose="feature" />}</span>
        <span className="es-search-result-copy"><span>{item.label}</span>{item.description && <small>{item.description}</small>}</span>
        {!item.disabled && <span className="es-search-result-open" aria-hidden="true"><Icon name="ArrowUpRight" purpose="action" /></span>}
      </div>)}
    </div>
    {state?.kind === 'loading' && <div className="es-search-message" aria-hidden="true"><Icon name="Search" purpose="feature" /><p>{state.label}</p></div>}
    {state?.kind === 'error' && <div className="es-search-message"><Icon name="AlertCircle" purpose="feature" /><p>{state.description}</p><Button label={state.retry.label} onClick={() => { input.current?.focus(); state.retry.onClick(); }} /></div>}
    {!state && results.length === 0 && <div className="es-search-message"><Icon name="Search" purpose="feature" />
      <p>{labels?.empty ?? 'Nenhum resultado encontrado'}</p><small>{labels?.emptyHint ?? 'Tente outro termo ou remova os filtros.'}</small>
      {(query || categories?.value) && <Button label={labels?.clear ?? 'Limpar busca'} onClick={clear} />}
    </div>}
    <div id={`${id}-keyboard`} className="es-search-footer">
      <span><kbd>↑ ↓</kbd>{labels?.navigate ?? 'Navegar'}</span>
      <span><kbd>Enter</kbd>{labels?.open ?? 'Abrir'}</span>
      <span><kbd>Esc</kbd>{labels?.close ?? 'Fechar busca'}</span>
    </div>
  </dialog>;
}
