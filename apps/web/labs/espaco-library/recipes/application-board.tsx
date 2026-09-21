import { useId, useLayoutEffect, useRef, useState } from 'react';
import { ApplicationCard, type ApplicationCardProps } from './application-card';
import { Badge } from 'beds';
import './application-board.css';

export type ApplicationBoardItem = Omit<ApplicationCardProps, 'purpose' | 'status' | 'statusOptions' | 'onStatusChange'> & {
  /** Unique across the board; preserve it when moving between columns. */
  id: string;
  /** Explicit allowed destinations. Omit for a read-only card. */
  moveTo?: readonly string[];
};

export type ApplicationBoardColumn = {
  id: string;
  label: string;
  tone?: ApplicationCardProps['status']['tone'];
  emptyLabel?: string;
  items: readonly ApplicationBoardItem[];
};

/** Host-owned destinations may include statuses that do not have a visible board column. */
export type ApplicationBoardDestination = { id: string; label: string };

/** Controlled board. Moving requests a host update; it never sends an application. */
export function ApplicationBoard({ label, columns, destinations, onMove, announcement = '', emptyLabel = 'Nenhuma vaga nesta etapa' }: {
  label: string;
  columns: readonly ApplicationBoardColumn[];
  /** Optional host catalog. Without it, visible columns preserve the legacy destination fallback. */
  destinations?: readonly ApplicationBoardDestination[];
  onMove?: (itemId: string, columnId: string) => void;
  /** Host-confirmed update or recovery copy, not an optimistic success. */
  announcement?: string;
  emptyLabel?: string;
}) {
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLLIElement>());
  const headings = useRef(new Map<string, HTMLHeadingElement>());
  const pendingFocus = useRef<{ itemId: string; sourceColumnId: string; destinationId: string } | null>(null);
  const [overflows, setOverflows] = useState(false);
  const destinationCatalog = destinations ?? columns.map(column => ({ id: column.id, label: column.label }));

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const measure = () => setOverflows(element.scrollWidth > element.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    return () => observer.disconnect();
  }, [columns.length]);

  useLayoutEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    const card = cards.current.get(pending.itemId);
    // A delayed host update must not steal focus from another task/control.
    if (document.activeElement === document.body || card?.contains(document.activeElement)) {
      const reachedDestination = columns.some(column => column.id === pending.destinationId && column.items.some(item => item.id === pending.itemId));
      if (reachedDestination && card) {
        const target = card.querySelector<HTMLButtonElement>('.recipe-application-status-trigger button') ?? card.querySelector<HTMLButtonElement>('h3 > button');
        target?.focus({ preventScroll: true });
        target?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      } else if (!card) {
        const fallback = headings.current.get(pending.sourceColumnId);
        fallback?.focus({ preventScroll: true });
        fallback?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }
    pendingFocus.current = null;
  }, [columns]);

  return <div className="recipe-application-board">
    <div ref={viewport} className="recipe-application-board-viewport" role="region" aria-label={label} tabIndex={overflows ? 0 : undefined}>
      {columns.map((column, index) => <section key={column.id} className="recipe-application-board-column" aria-labelledby={`${id}-${index}`}>
        <header className="recipe-application-board-heading">
          <h2 id={`${id}-${index}`} tabIndex={-1} ref={element => { if (element) headings.current.set(column.id, element); else headings.current.delete(column.id); }}><Badge label={column.label} tone={column.tone} purpose="status" /></h2>
          <span className="recipe-application-board-count">{column.items.length}<span className="recipe-application-sr-only"> {column.items.length === 1 ? 'vaga' : 'vagas'}</span></span>
        </header>
        {column.items.length === 0 ? <p className="recipe-application-board-empty">{column.emptyLabel ?? emptyLabel}</p> : <ul className="recipe-application-board-list">
          {column.items.map(({ id: itemId, moveTo, ...card }) => {
            const options = destinationCatalog.filter(destination => destination.id !== column.id && moveTo?.includes(destination.id));
            const editable = Boolean(onMove && options.length > 0);
            return <li key={itemId} ref={element => { if (element) cards.current.set(itemId, element); else cards.current.delete(itemId); }}>
              <ApplicationCard {...card} purpose="kanban" status={{ id: column.id, label: column.label, tone: column.tone }} statusOptions={editable ? options : undefined}
                onStatusChange={editable ? target => {
                  if (!options.some(option => option.id === target)) return;
                  pendingFocus.current = { itemId, sourceColumnId: column.id, destinationId: target };
                  onMove?.(itemId, target);
                } : undefined} />
            </li>;
          })}
        </ul>}
      </section>)}
    </div>
    <p className="recipe-application-sr-only" role="status">{announcement}</p>
  </div>;
}
