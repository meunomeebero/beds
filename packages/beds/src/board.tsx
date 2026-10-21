import './board.css';
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export type KanbanBoardProps = {
  label: string;
  /** How to move between stages (keys, the card menu), read after the label. */
  description?: string;
  /** `KanbanColumn` children, in stage order. */
  children: ReactNode;
};

/**
 * Horizontal stage board: fixed 360px columns (320px on phones) that keep scrolling sideways on every
 * width, snap to a column, fade the edge that has more, and scroll one column per arrow key when the
 * board itself has focus. Cards, moves and drag are the host's.
 */
export function KanbanBoard({ label, description, children }: KanbanBoardProps) {
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

  return <div ref={viewport} className="es-kanban" data-fade={fade === 'none' ? undefined : fade} role="region" aria-label={label} aria-describedby={description ? `${id}-description` : undefined} tabIndex={0} onKeyDown={onKeyDown}>
    <div className="es-kanban-columns">{children}</div>
    {description && <p id={`${id}-description`} className="es-sr-only">{description}</p>}
  </div>;
}

export type KanbanColumnProps = {
  title: string;
  count: number;
  /** Shown when the column has no cards. */
  emptyLabel: string;
  /** Lets a host return focus to the heading after a card leaves (tabIndex -1). */
  headingId?: string;
  children?: ReactNode;
};

/** One stage: a bordered transparent panel, a 16px heading with a count pill, then the cards (8px apart). */
export function KanbanColumn({ title, count, emptyLabel, headingId, children }: KanbanColumnProps) {
  const fallback = useId();
  const id = headingId ?? fallback;
  const list = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(false);
  useEffect(() => { setEmpty(!list.current?.childElementCount); });
  return <section className="es-kanban-column" aria-labelledby={id}>
    <div className="es-kanban-panel">
      <header className="es-kanban-header"><h2 id={id} tabIndex={-1}>{title}</h2><span className="es-kanban-count">{count}</span></header>
      <div ref={list} className="es-kanban-cards">{children}</div>
      {empty && <p className="es-kanban-empty">{emptyLabel}</p>}
    </div>
  </section>;
}
