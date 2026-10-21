import './board.css';
import { Children, createContext, isValidElement, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { motion } from 'motion/react';
import { DndContext, DragOverlay, KeyboardSensor, MeasuringStrategy, MouseSensor, TouchSensor, defaultDropAnimationSideEffects, pointerWithin, rectIntersection, useDraggable, useDroppable, useSensor, useSensors, type CollisionDetection, type DragMoveEvent, type KeyboardCoordinateGetter } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';

/** A drop the person made: same column = a new position, another column = a stage move. */
export type KanbanMove = { cardId: string; from: string; to: string; index: number; method: 'pointer' | 'keyboard' };

/** Screen-reader copy for drag and drop; every string is the host's (localized). */
export type KanbanDragMessages = {
  /** Read when a handle gets focus: how to pick up, move, drop and cancel. */
  instructions: string;
  /** `aria-roledescription` of a handle, e.g. "item arrastável". */
  roleDescription: string;
  picked: (title: string) => string;
  over: (position: number, column: string) => string;
  outside: string;
  dropped: (column: string) => string;
  reordered: (column: string) => string;
  cancelled: string;
};

export type KanbanDrag = {
  /** The host applies the move (order and stage). A returned promise locks every handle until it settles. */
  onDrop: (move: KanbanMove) => void | Promise<void>;
  /** May this card enter another column? Its own column always takes it (reorder). Default: every column. */
  canDrop?: (cardId: string, columnId: string) => boolean;
  messages: KanbanDragMessages;
};

export type KanbanBoardProps = {
  label: string;
  /** How to move between stages (keys, the card menu), read after the label. */
  description?: string;
  /** `KanbanColumn` children, in stage order. */
  children: ReactNode;
  /** Drag and drop for `KanbanCard` children: pointer (8px), touch (250ms hold) and keyboard (Space, arrows, Space). Columns need an `id`. */
  drag?: KanbanDrag;
};

type DropSlot = { column: string; index: number };
type CardEntry = { title: string; children: ReactNode };
type BoardDrag = {
  enabled: boolean;
  draggedId: string | null;
  keyboardDrag: boolean;
  slot: DropSlot | null;
  slotHeight: number;
  moving: boolean;
  landingId: string | null;
  roleDescription: string;
  cards: Map<string, CardEntry>;
};
const BoardContext = createContext<BoardDrag>({ enabled: false, draggedId: null, keyboardDrag: false, slot: null, slotHeight: 0, moving: false, landingId: null, roleDescription: '', cards: new Map() });
type CardHandle = { setActivator: (element: HTMLElement | null) => void; attributes: Record<string, unknown>; listeners: Record<string, unknown> | undefined; disabled: boolean; title: string };
const CardContext = createContext<CardHandle | null>(null);
const OverlayContext = createContext(false);

const BOARD_SPRING = { type: 'spring', bounce: 0, duration: .28 } as const;
const CONTROL = 'button,a,input,select,textarea,label,summary,[role="button"],[contenteditable="true"]';

/**
 * Horizontal stage board: fixed 360px columns (320px on phones) that keep scrolling sideways on every
 * width, snap to a column, fade the edge that has more, and scroll one column per arrow key when the
 * board itself has focus. Cards and moves are the host's; `drag` adds the reference app's drag and drop.
 */
export function KanbanBoard({ label, description, children, drag }: KanbanBoardProps) {
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState<'none' | 'start' | 'end' | 'both'>('none');

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const measure = () => {
      const max = element.scrollWidth - element.clientWidth;
      const position = Math.abs(element.scrollLeft);
      const start = position > 2;
      const end = max - position > 2;
      setFade(start && end ? 'both' : start ? 'start' : end ? 'end' : 'none');
    };
    measure();
    element.addEventListener('scroll', measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => { element.removeEventListener('scroll', measure); observer.disconnect(); };
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const element = viewport.current;
    if (!element || event.target !== element) return;
    const column = element.querySelector<HTMLElement>('.es-kanban-column');
    const gap = parseFloat(getComputedStyle(element.firstElementChild ?? element).columnGap) || 12;
    const stride = (column?.offsetWidth ?? 360) + gap;
    const rtl = getComputedStyle(element).direction === 'rtl' ? -1 : 1;
    const moves: Record<string, () => void> = {
      ArrowRight: () => element.scrollBy({ left: stride }),
      ArrowLeft: () => element.scrollBy({ left: -stride }),
      Home: () => element.scrollTo({ left: 0 }),
      End: () => element.scrollTo({ left: rtl * element.scrollWidth }),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    move();
  };

  const region = (dragActive: boolean, columnsHeight?: number) => <motion.div layoutScroll ref={viewport} className="es-kanban" data-fade={fade === 'none' ? undefined : fade} data-drag-active={dragActive || undefined} role="region" aria-label={label} aria-describedby={description ? `${id}-description` : undefined} tabIndex={0} onKeyDown={onKeyDown}>
    <div className="es-kanban-columns" style={columnsHeight ? { minHeight: columnsHeight } : undefined}>{children}</div>
    {description && <p id={`${id}-description`} className="es-sr-only">{description}</p>}
  </motion.div>;

  if (!drag) return region(false);
  return <DragLayer drag={drag} viewport={viewport} region={region} />;
}

/** Drag and drop on @dnd-kit/core, ported from the reference app: drop slot at the pointer, lifted overlay, keyboard moves. */
function DragLayer({ drag, viewport, region }: { drag: KanbanDrag; viewport: RefObject<HTMLDivElement | null>; region: (dragActive: boolean, columnsHeight?: number) => ReactNode }) {
  const reduce = useReducedMotionPreference();
  const cards = useRef(new Map<string, CardEntry>()).current;
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [keyboardDrag, setKeyboardDrag] = useState(false);
  const [slot, setSlot] = useState<DropSlot | null>(null);
  const [moving, setMoving] = useState(false);
  const [landingId, setLandingId] = useState<string | null>(null);
  const slotRef = useRef<DropSlot | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const pickupRef = useRef<{ id: string; rect: DOMRect } | null>(null);
  const landingRef = useRef<{ id: string; rect: DOMRect } | null>(null);
  const outcome = useRef<{ column: string; reordered: boolean } | null>(null);
  const movingRef = useRef(false);
  const metrics = useRef({ source: '', height: 0, gap: 8, boardHeight: 0, heights: new Map<string, number>() });

  const columnElement = (columnId: string) => viewport.current?.querySelector<HTMLElement>(`[data-kanban-column="${CSS.escape(columnId)}"]`) ?? null;
  const cardsElement = (columnId: string) => columnElement(columnId)?.querySelector<HTMLElement>('.es-kanban-cards') ?? null;
  const columnIds = () => Array.from(viewport.current?.querySelectorAll<HTMLElement>('[data-kanban-column]') ?? [], element => element.dataset.kanbanColumn!);
  const columnTitle = (columnId: string) => columnElement(columnId)?.dataset.kanbanTitle ?? columnId;
  const cardIds = (columnId: string, without?: string | null) => Array.from(columnElement(columnId)?.querySelectorAll<HTMLElement>('[data-kanban-card]') ?? [], element => element.dataset.kanbanCard!).filter(cardId => cardId !== without);
  const columnOf = (cardId: string) => viewport.current?.querySelector<HTMLElement>(`[data-kanban-card="${CSS.escape(cardId)}"]`)?.closest<HTMLElement>('[data-kanban-column]')?.dataset.kanbanColumn ?? '';
  const allowed = (cardId: string, columnId: string) => columnId === metrics.current.source || columnId === columnOf(cardId) || (drag.canDrop?.(cardId, columnId) ?? true);

  function showSlot(next: DropSlot | null) {
    slotRef.current = next;
    setSlot(previous => previous?.column === next?.column && previous?.index === next?.index ? previous : next);
  }
  function slotTop(columnId: string, index: number) {
    const { heights, height, gap } = metrics.current;
    return cardIds(columnId, draggedId).slice(0, index).reduce((top, cardId) => top + (heights.get(cardId) ?? height) + gap, cardsElement(columnId)?.getBoundingClientRect().top ?? 0);
  }

  const keyboardCoordinates: KeyboardCoordinateGetter = (event, { currentCoordinates, context }) => {
    if (!event.code.startsWith('Arrow')) return;
    const current = slotRef.current;
    const rect = context.collisionRect;
    if (!current || !rect || !draggedId) return;
    event.preventDefault();
    let { column, index } = current;
    if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
      index = Math.max(0, Math.min(cardIds(column, draggedId).length, index + (event.code === 'ArrowDown' ? 1 : -1)));
    } else {
      const open = columnIds().filter(candidate => allowed(draggedId, candidate));
      const rtl = viewport.current && getComputedStyle(viewport.current).direction === 'rtl';
      const forward = (event.code === 'ArrowRight') !== Boolean(rtl);
      const next = open[open.indexOf(column) + (forward ? 1 : -1)];
      if (!next) return;
      column = next;
      index = 0;
      columnElement(next)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    const target = cardsElement(column)?.getBoundingClientRect();
    if (!target) return;
    showSlot({ column, index });
    return { x: currentCoordinates.x + target.left - rect.left, y: currentCoordinates.y + slotTop(column, index) - rect.top };
  };
  const keyboardRef = useRef(keyboardCoordinates);
  keyboardRef.current = keyboardCoordinates;
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: (...args) => keyboardRef.current(...args), scrollBehavior: 'auto' }),
  );

  const collision: CollisionDetection = args => {
    pointerRef.current = args.pointerCoordinates;
    const cardId = String(args.active.id);
    const open = args.droppableContainers.filter(column => allowed(cardId, String(column.id)));
    if (args.pointerCoordinates) {
      const board = viewport.current?.getBoundingClientRect();
      const point = args.pointerCoordinates;
      if (!board || point.x < board.left || point.x > board.right || point.y < board.top || point.y > board.bottom) return [];
      const hits = pointerWithin(args);
      if (hits.length) return hits.filter(hit => open.some(column => column.id === hit.id));
    }
    return rectIntersection({ ...args, droppableContainers: open });
  };

  function preview({ active, over, activatorEvent }: DragMoveEvent) {
    if (activatorEvent instanceof globalThis.KeyboardEvent) return;
    // Auto-scroll can queue a final move after cancellation: never revive its gap.
    if (pickupRef.current?.id !== active.id) return;
    if (!over) { showSlot(null); return; }
    const column = String(over.id);
    const pointerY = pointerRef.current?.y;
    if (pointerY === undefined) return;
    let top = cardsElement(column)?.getBoundingClientRect().top ?? 0;
    let index = 0;
    // Logical row heights measured at pickup, not mid-flight transforms: reversing cannot jitter the slot.
    for (const cardId of cardIds(column, String(active.id))) {
      const height = metrics.current.heights.get(cardId) ?? metrics.current.height;
      if (pointerY < top + height / 2) break;
      top += height + metrics.current.gap;
      index++;
    }
    showSlot({ column, index });
  }

  async function commit(move: KanbanMove) {
    const result = drag.onDrop(move);
    if (!(result instanceof Promise)) return;
    movingRef.current = true;
    setMoving(true);
    try { await result; } finally {
      movingRef.current = false;
      setMoving(false);
      if (move.method === 'keyboard') requestAnimationFrame(() => {
        const handle = viewport.current?.querySelector<HTMLElement>(`[data-kanban-card="${CSS.escape(move.cardId)}"] .es-kanban-handle`);
        (handle ?? viewport.current)?.focus();
      });
    }
  }

  // The board unmounting mid-gesture must not leave a ghost gap behind.
  useEffect(() => () => { slotRef.current = null; pickupRef.current = null; landingRef.current = null; }, []);

  const dragged = draggedId ? cards.get(draggedId) : undefined;
  const { messages } = drag;
  const context: BoardDrag = { enabled: true, draggedId, keyboardDrag, slot, slotHeight: metrics.current.height, moving, landingId, roleDescription: messages.roleDescription, cards };

  return <BoardContext.Provider value={context}>
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always }, draggable: {
        // A host update can be asynchronous: land at the accepted gap, not on the old source node.
        measure: node => {
          const cardId = node.dataset.kanbanCard;
          if (landingRef.current && landingRef.current.id === cardId) return landingRef.current.rect;
          // The hidden source leaves the column flow during the drag; keep its pickup rect.
          return pickupRef.current && pickupRef.current.id === cardId ? pickupRef.current.rect : node.getBoundingClientRect();
        },
      } }}
      accessibility={{
        screenReaderInstructions: { draggable: messages.instructions },
        announcements: {
          onDragStart: ({ active }) => messages.picked(cards.get(String(active.id))?.title ?? ''),
          onDragOver: ({ over }) => over ? undefined : messages.outside,
          onDragMove: () => undefined,
          onDragEnd: () => outcome.current ? (outcome.current.reordered ? messages.reordered : messages.dropped)(columnTitle(outcome.current.column)) : messages.cancelled,
          onDragCancel: () => messages.cancelled,
        },
      }}
      onDragStart={({ active, activatorEvent }) => {
        outcome.current = null;
        landingRef.current = null;
        pickupRef.current = null;
        setKeyboardDrag(activatorEvent instanceof globalThis.KeyboardEvent);
        const cardId = String(active.id);
        const rects = new Map(Array.from(viewport.current?.querySelectorAll<HTMLElement>('[data-kanban-card]') ?? [], element => [element.dataset.kanbanCard!, element.getBoundingClientRect()] as const));
        const pickup = rects.get(cardId);
        if (pickup) pickupRef.current = { id: cardId, rect: pickup };
        const source = columnOf(cardId);
        const list = cardsElement(source);
        metrics.current = {
          source,
          heights: new Map(Array.from(rects, ([key, rect]) => [key, rect.height] as const)),
          height: pickup?.height ?? active.rect.current.initial?.height ?? 120,
          gap: list ? parseFloat(getComputedStyle(list).rowGap) || 8 : 8,
          boardHeight: viewport.current?.querySelector<HTMLElement>('.es-kanban-columns')?.getBoundingClientRect().height ?? 280,
        };
        setDraggedId(cardId);
        showSlot({ column: source, index: Math.max(0, cardIds(source).indexOf(cardId)) });
      }}
      onDragMove={preview}
      onDragOver={event => { if (!event.over) showSlot(null); else if (!(event.activatorEvent instanceof globalThis.KeyboardEvent)) preview(event); }}
      onDragCancel={() => { landingRef.current = null; pickupRef.current = null; setDraggedId(null); showSlot(null); }}
      onDragEnd={({ active, over, activatorEvent }) => {
        const target = slotRef.current;
        const cardId = String(active.id);
        const from = metrics.current.source;
        const keyboard = activatorEvent instanceof globalThis.KeyboardEvent;
        const landing = viewport.current?.querySelector<HTMLElement>('.es-kanban-slot')?.getBoundingClientRect();
        setDraggedId(null);
        showSlot(null);
        outcome.current = null;
        landingRef.current = null;
        pickupRef.current = null;
        if (!target || target.column !== String(over?.id ?? '') || !allowed(cardId, target.column)) return;
        if (landing && !reduce && !keyboard) landingRef.current = { id: cardId, rect: landing };
        outcome.current = { column: target.column, reordered: target.column === from };
        void commit({ cardId, from, to: target.column, index: target.index, method: keyboard ? 'keyboard' : 'pointer' });
      }}
    >
      {region(Boolean(draggedId), draggedId ? metrics.current.boardHeight : undefined)}
      <span className="es-sr-only" role="status">{slot ? messages.over(slot.index + 1, columnTitle(slot.column)) : ''}</span>
      <DragOverlay zIndex={100} transition="none" dropAnimation={reduce || keyboardDrag ? null : { duration: 200, easing: 'cubic-bezier(.16, 1, .3, 1)', sideEffects: args => {
        const cleanup = defaultDropAnimationSideEffects({ styles: { active: { visibility: 'hidden' } } })(args);
        const destination = landingRef.current;
        const phase = String(args.active.id);
        setLandingId(phase);
        return () => {
          cleanup?.();
          if (landingRef.current === destination) landingRef.current = null;
          setLandingId(current => current === phase ? null : current);
        };
      } }}>
        {dragged ? <motion.div className="es-kanban-overlay" initial={false} animate={{ scale: reduce || keyboardDrag ? 1 : 1.015 }} transition={BOARD_SPRING} aria-hidden="true" inert>
          <OverlayContext.Provider value={true}>{dragged.children}</OverlayContext.Provider>
        </motion.div> : null}
      </DragOverlay>
    </DndContext>
  </BoardContext.Provider>;
}

export type KanbanColumnProps = {
  title: string;
  count: number;
  /** Shown when the column has no cards. */
  emptyLabel: string;
  /** Lets a host return focus to the heading after a card leaves (tabIndex -1). */
  headingId?: string;
  /** Stage id: required on a board with `drag`, where it is the drop target and the `KanbanMove` `from`/`to`. */
  id?: string;
  children?: ReactNode;
};

/** One stage: a bordered transparent panel, a 16px heading with a count pill, then the cards (8px apart). */
export function KanbanColumn({ title, count, emptyLabel, headingId, id: columnId, children }: KanbanColumnProps) {
  const fallback = useId();
  const id = headingId ?? fallback;
  const board = useContext(BoardContext);
  const list = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(false);
  useEffect(() => { setEmpty(!list.current?.querySelector(':scope > :not(.es-kanban-slot)')); });
  const droppable = board.enabled && columnId !== undefined;
  const slotHere = droppable && board.slot?.column === columnId ? board.slot.index : -1;
  let content: ReactNode = children;
  if (droppable && board.draggedId) {
    const items: ReactNode[] = [];
    let index = 0;
    const gap = () => <div key="es-kanban-slot" className="es-kanban-slot" aria-hidden="true" style={{ height: board.slotHeight }} />;
    for (const child of Children.toArray(children)) {
      const cardId = isValidElement<{ id?: string }>(child) && child.type === KanbanCard ? child.props.id : undefined;
      if (cardId !== board.draggedId) {
        if (index === slotHere) items.push(gap());
        index++;
      }
      items.push(child);
    }
    if (index === slotHere) items.push(gap());
    content = items;
  }
  const panel = <div className="es-kanban-panel">
    <header className="es-kanban-header"><h2 id={id} tabIndex={-1}>{title}</h2><span className="es-kanban-count">{count}</span></header>
    <div ref={list} className="es-kanban-cards">{content}</div>
    {empty && slotHere < 0 && <p className="es-kanban-empty">{emptyLabel}</p>}
  </div>;
  if (droppable) return <DroppableColumn id={columnId} title={title} headingId={id}>{panel}</DroppableColumn>;
  return <section className="es-kanban-column" aria-labelledby={id}>{panel}</section>;
}

function DroppableColumn({ id, title, headingId, children }: { id: string; title: string; headingId: string; children: ReactNode }) {
  // Every column stays measurable; which ones accept the card is decided in collision detection.
  const { setNodeRef, isOver } = useDroppable({ id });
  return <section ref={setNodeRef} className="es-kanban-column" aria-labelledby={headingId} data-kanban-column={id} data-kanban-title={title} data-drop-over={isOver || undefined}>{children}</section>;
}

export type KanbanCardProps = {
  /** Unique across the board; keep it when the card changes column. */
  id: string;
  /** Spoken in drag announcements. */
  title: string;
  /** Locks this card in place (the host's work in progress). */
  disabled?: boolean;
  /** The card. Put a `KanbanDragHandle` in it for keyboard and precise pointer drags; the rest of its surface drags too, controls excepted. */
  children: ReactNode;
};

/** One draggable card slot on a board with `drag`. Without `drag` it is a plain wrapper. */
export function KanbanCard({ id, title, disabled = false, children }: KanbanCardProps) {
  const board = useContext(BoardContext);
  useLayoutEffect(() => {
    if (!board.enabled) return;
    board.cards.set(id, { title, children });
  });
  useEffect(() => {
    if (!board.enabled) return;
    const cards = board.cards;
    return () => { cards.delete(id); };
  }, [board.enabled, board.cards, id]);
  if (!board.enabled) return <div className="es-kanban-card" data-kanban-card={id}>{children}</div>;
  return <DraggableCard id={id} title={title} disabled={disabled || board.moving}>{children}</DraggableCard>;
}

function DraggableCard({ id, title, disabled, children }: { id: string; title: string; disabled: boolean; children: ReactNode }) {
  const board = useContext(BoardContext);
  const reduce = useReducedMotionPreference();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id, disabled, attributes: { roleDescription: board.roleDescription } });
  const surface = (target: EventTarget) => target instanceof Element && (!target.closest(CONTROL) || Boolean(target.closest('[data-kanban-grab]')));
  return <motion.div ref={setNodeRef} layout={reduce || board.keyboardDrag || isDragging ? false : 'position'} transition={BOARD_SPRING}
    className="es-kanban-card" data-kanban-card={id} data-dragging={isDragging || undefined} data-landing={board.landingId === id || undefined} data-draggable={!disabled || undefined}
    onMouseDown={event => { if (surface(event.target)) (listeners?.onMouseDown as ((event: unknown) => void) | undefined)?.(event); }}
    onTouchStart={event => { if (surface(event.target)) (listeners?.onTouchStart as ((event: unknown) => void) | undefined)?.(event); }}>
    <CardContext.Provider value={{ setActivator: setActivatorNodeRef, attributes: attributes as unknown as Record<string, unknown>, listeners, disabled, title }}>{children}</CardContext.Provider>
  </motion.div>;
}

export type KanbanDragHandleProps = {
  /** Accessible name, e.g. "Arrastar Product designer". */
  label: string;
};

/** The grip inside a `KanbanCard`: 32px (44px on phones), the keyboard way to pick a card up. Renders nothing off a drag board. */
export function KanbanDragHandle({ label }: KanbanDragHandleProps) {
  const card = useContext(CardContext);
  const overlay = useContext(OverlayContext);
  if (overlay) return <span className="es-kanban-handle" aria-hidden="true"><GripVertical strokeWidth={1.5} focusable="false" /></span>;
  if (!card) return null;
  return <button ref={card.setActivator} type="button" className="es-kanban-handle" {...card.attributes} {...card.listeners} disabled={card.disabled} aria-label={label}>
    <GripVertical strokeWidth={1.5} aria-hidden="true" focusable="false" />
  </button>;
}
