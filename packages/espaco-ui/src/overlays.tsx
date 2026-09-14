import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode, type RefObject } from 'react';
import { Icon, type IconName } from './foundation';
import { IconButton } from './controls';
import './overlays.css';

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
      const viewport = window.visualViewport;
      const left = viewport?.offsetLeft ?? 0;
      const top = viewport?.offsetTop ?? 0;
      const viewportWidth = viewport?.width ?? innerWidth;
      const viewportHeight = viewport?.height ?? innerHeight;
      const inset = 16;
      element.style.width = width === 'content' ? 'max-content' : `${Math.min(width, Math.max(0, viewportWidth - inset * 2))}px`;
      element.style.maxWidth = `${Math.max(0, viewportWidth - inset * 2)}px`;
      element.style.maxHeight = `${Math.max(0, viewportHeight - inset * 2)}px`;
      const size = element.getBoundingClientRect();
      const below = bounds.bottom + 4;
      const above = bounds.top - size.height - 4;
      const preferAbove = placement === 'above' && above >= top + inset;
      const preferredTop = preferAbove ? above : below + size.height <= top + viewportHeight - inset ? below : above;
      element.style.left = `${Math.max(left + inset, Math.min(bounds.left, left + viewportWidth - size.width - inset))}px`;
      element.style.top = `${Math.max(top + inset, Math.min(preferredTop, top + viewportHeight - size.height - inset))}px`;
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

type Option = { id: string; label: string; description?: string; icon?: IconName; disabled?: boolean };

function nextOption(options: Option[], current: string | undefined, key: string) {
  const enabled = options.filter(option => !option.disabled);
  const index = enabled.findIndex(option => option.id === current);
  const next = key === 'Home' ? 0 : key === 'End' ? enabled.length - 1 : (index + (key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
  return enabled[next]?.id ?? null;
}

export function Select({ label, value, options, onChange, disabled, icon, variant = 'compact' }: {
  label: string; value: string; options: Option[]; onChange: (value: string) => void; disabled?: boolean; icon?: IconName; variant?: 'compact' | 'field' | 'context' | 'filter';
}) {
  const id = useId();
  const anchor = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const selected = options.find(option => option.id === value);
  const active = options.find(option => option.id === activeId && !option.disabled) ?? options.find(option => option.id === value && !option.disabled) ?? options.find(option => !option.disabled);
  const activeIndex = options.findIndex(option => option.id === active?.id);
  useAnchoredPopup({ open: open && !disabled, anchor, panel, onOpenChange: setOpen });
  useLayoutEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  useLayoutEffect(() => { if (open) panel.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }); }, [open, active?.id]);
  const show = (fromEnd = false) => {
    setActiveId(options.find(option => option.id === value && !option.disabled)?.id ?? nextOption(options, undefined, fromEnd ? 'End' : 'Home'));
    setOpen(true);
  };
  const choose = (option: Option) => { if (!option.disabled) { onChange(option.id); setOpen(false); } };
  const navigate = (event: KeyboardEvent<HTMLDivElement>) => {
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      setActiveId(nextOption(options, active?.id, event.key));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (active) choose(active);
    } else if (event.key === 'Tab') {
      anchor.current?.focus({ preventScroll: true });
      setOpen(false);
    }
  };
  return <div className="es-select" data-variant={variant}>
    <button ref={anchor} type="button" className="es-select-trigger" aria-label={`${label}: ${selected?.label ?? value}`} aria-haspopup="listbox" aria-expanded={open && !disabled} aria-controls={open && !disabled ? id : undefined} disabled={disabled} onClick={() => open ? setOpen(false) : show()} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); show(event.key === 'ArrowUp'); } }}>
      {(icon ?? selected?.icon) && <Icon name={(icon ?? selected?.icon)!} purpose="navigation" />}<span>{selected?.label ?? value}</span>{variant === 'context' && selected?.description && <small>{selected.description}</small>}<Icon name={variant === 'filter' ? 'ChevronsUpDown' : 'ChevronDown'} purpose="small" />
    </button>
    {open && !disabled && <div ref={panel} id={id} popover="manual" className="es-select-popup" role="listbox" aria-label={label} aria-activedescendant={activeIndex >= 0 ? `${id}-${activeIndex}` : undefined} tabIndex={-1} onKeyDown={navigate}>
      {options.map((option, index) => <div key={option.id} id={`${id}-${index}`} role="option" className="es-select-option" aria-selected={value === option.id} aria-disabled={option.disabled || undefined} data-active={active?.id === option.id} onPointerMove={() => { if (!option.disabled) setActiveId(option.id); }} onClick={() => choose(option)}>{option.icon && <Icon name={option.icon} purpose="navigation" />}<span className="es-option-copy"><span>{option.label}</span>{option.description && <small>{option.description}</small>}</span>{value === option.id && <Icon name="Check" purpose="navigation" />}</div>)}
    </div>}
  </div>;
}

/** Transparent toolbar selector. Dates, ranges and filtering policy belong to the application. */
export function FilterSelect({ label, value, options, onChange, icon = 'CalendarDays', disabled }: {
  label: string; value: string; options: Option[]; onChange: (value: string) => void; icon?: IconName; disabled?: boolean;
}) {
  return <Select label={label} value={value} options={options} onChange={onChange} icon={icon} disabled={disabled} variant="filter" />;
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
  const active = items.find(item => item.id === activeId && !item.disabled) ?? items.find(item => !item.disabled);
  useAnchoredPopup({ open, anchor, panel, onOpenChange, width: 160 });
  useLayoutEffect(() => { if (open) panel.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }); }, [open, active?.id]);
  const choose = (item: typeof items[number]) => { if (!item.disabled) { onSelect(item.id); onOpenChange(false); } };
  return <div className="es-dropdown"><button ref={anchor} type="button" className="es-icon-button" aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => { setActiveId(null); onOpenChange(!open); }} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setActiveId(nextOption(items, undefined, event.key === 'ArrowUp' ? 'End' : 'Home')); onOpenChange(true); } }}><Icon name={icon} purpose="action" /></button>
    {open && <div id={id} ref={panel} popover="manual" className="es-menu-popup" role="menu" aria-label={label} aria-activedescendant={active ? `${id}-${items.indexOf(active)}` : undefined} tabIndex={-1} onKeyDown={event => {
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); setActiveId(nextOption(items, active?.id, event.key)); }
      else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (active) choose(active); }
      else if (event.key === 'Tab') { anchor.current?.focus({ preventScroll: true }); onOpenChange(false); }
    }}>{items.map((item, index) => <div key={item.id} id={`${id}-${index}`} role="menuitem" className="es-menu-item" aria-disabled={item.disabled || undefined} data-active={active?.id === item.id} data-destructive={item.destructive || undefined} onPointerMove={() => { if (!item.disabled) setActiveId(item.id); }} onClick={() => choose(item)}>{item.icon && <Icon name={item.icon} purpose="navigation" />}<span>{item.label}</span></div>)}</div>}
  </div>;
}

export function Tooltip({ label, children }: { label: string; children: ReactElement<{ 'aria-describedby'?: string }> }) {
  const id = useId();
  const anchor = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useAnchoredPopup({ open, anchor, panel, onOpenChange: setOpen, width: 'content', initialFocus: 'none' });
  const describedBy = [children.props['aria-describedby'], open && id].filter(Boolean).join(' ') || undefined;
  return <span ref={anchor} className="es-tooltip-anchor" onPointerEnter={event => { if (event.pointerType !== 'touch') setOpen(true); }} onPointerLeave={() => { if (!anchor.current?.contains(document.activeElement)) setOpen(false); }} onFocus={() => setOpen(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>{cloneElement(children, { 'aria-describedby': describedBy })}{open && <div ref={panel} id={id} className="es-tooltip" role="tooltip" popover="manual">{label}</div>}</span>;
}

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

function useModal(open: boolean, dialog: RefObject<HTMLDialogElement | null>) {
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

function outsideDialog(event: MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return false;
  const bounds = event.currentTarget.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
}

function containModalTab(event: KeyboardEvent<HTMLDialogElement>) {
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

export function Dialog({ open, onOpenChange, title, description, children, actions, variant = 'standard', artwork }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children?: ReactNode; actions?: ReactNode; variant?: 'standard' | 'welcome'; artwork?: ReactNode;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  useModal(open, dialog);
  return <dialog ref={dialog} className="es-dialog" data-variant={variant} aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined} onKeyDown={containModalTab} onCancel={event => { event.preventDefault(); onOpenChange(false); }} onClick={event => { if (outsideDialog(event)) onOpenChange(false); }}>{variant === 'welcome' && artwork && <div className="es-dialog-artwork">{artwork}</div>}<div className="es-dialog-header"><div><h2 id={`${id}-title`}>{title}</h2>{description && <p id={`${id}-description`}>{description}</p>}</div><IconButton label="Fechar" icon="X" onClick={() => onOpenChange(false)} /></div>{children && <div className="es-dialog-body">{children}</div>}{actions && <div className="es-dialog-actions">{actions}</div>}</dialog>;
}

export function CommandPalette({ open, onOpenChange, label, query, onQueryChange, items, onSelect, emptyLabel = 'Nenhum resultado' }: {
  open: boolean; onOpenChange: (open: boolean) => void; label: string; query: string; onQueryChange: (query: string) => void; items: Option[]; onSelect: (id: string) => void; emptyLabel?: string;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const normalized = query.trim().toLocaleLowerCase();
  const filtered = items.filter(item => `${item.label} ${item.description ?? ''}`.toLocaleLowerCase().includes(normalized));
  const active = filtered.find(item => item.id === activeId && !item.disabled) ?? filtered.find(item => !item.disabled);
  useModal(open, dialog);
  useLayoutEffect(() => { if (open) dialog.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }); }, [open, active?.id]);
  const choose = (item: Option) => { if (!item.disabled) { onSelect(item.id); onOpenChange(false); } };
  return <dialog ref={dialog} className="es-command" aria-label={label} onKeyDown={containModalTab} onCancel={event => { event.preventDefault(); onOpenChange(false); }} onClick={event => { if (outsideDialog(event)) onOpenChange(false); }}>
    <div className="es-command-search"><Icon name="Search" purpose="action" /><input type="text" role="combobox" aria-label={label} placeholder={label} value={query} autoFocus aria-expanded={open} aria-autocomplete="list" aria-controls={`${id}-list`} aria-activedescendant={active ? `${id}-option-${filtered.indexOf(active)}` : undefined} onChange={event => { setActiveId(null); onQueryChange(event.target.value); }} onKeyDown={event => {
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); setActiveId(nextOption(filtered, active?.id, event.key)); }
      else if (event.key === 'Enter') { event.preventDefault(); if (active) choose(active); }
    }} /><IconButton label="Fechar busca" icon="X" onClick={() => onOpenChange(false)} /></div>
    <div id={`${id}-list`} className="es-command-list" role="listbox" aria-label={label}>{filtered.map((item, index) => <div key={item.id} id={`${id}-option-${index}`} className="es-command-option" role="option" aria-selected={active?.id === item.id} aria-disabled={item.disabled || undefined} data-active={active?.id === item.id} onPointerMove={() => { if (!item.disabled) setActiveId(item.id); }} onMouseDown={event => event.preventDefault()} onClick={() => choose(item)}>{item.icon && <Icon name={item.icon} purpose="navigation" />}<span className="es-option-copy"><span>{item.label}</span>{item.description && <small>{item.description}</small>}</span></div>)}</div>
    {filtered.length === 0 && <p className="es-command-empty" role="status">{emptyLabel}</p>}
  </dialog>;
}
