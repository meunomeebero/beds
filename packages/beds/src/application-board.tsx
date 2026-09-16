import { useId, useLayoutEffect, useRef, useState } from 'react';
import { ApplicationCard, type ApplicationCardProps } from './application-card';
import { Badge } from './feedback';
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

/** Controlled board. Moving requests a host update; it never sends an application. */
export function ApplicationBoard({ label, columns, onMove, announcement = '', emptyLabel = 'Nenhuma vaga nesta etapa' }: {
  label: string;
  columns: readonly ApplicationBoardColumn[];
  onMove?: (itemId: string, columnId: string) => void;
  /** Host-confirmed update or recovery copy, not an optimistic success. */
  announcement?: string;
  emptyLabel?: string;
}) {
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLLIElement>());
  const pendingFocus = useRef<{ itemId: string; columnId: string } | null>(null);
  const [overflows, setOverflows] = useState(false);

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
    const hasMoved = columns.some(column => column.id === pending.columnId && column.items.some(item => item.id === pending.itemId));
    if (!hasMoved) return;
    const card = cards.current.get(pending.itemId);
    // A delayed host update must not steal focus from another task/control.
    if (document.activeElement === document.body || card?.contains(document.activeElement)) {
      const target = card?.querySelector<HTMLButtonElement>('.es-dropdown > button') ?? card?.querySelector<HTMLButtonElement>('h3 > button');
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    pendingFocus.current = null;
  }, [columns]);

  return <div className="es-application-board">
    <div ref={viewport} className="es-application-board-viewport" role="region" aria-label={label} tabIndex={overflows ? 0 : undefined}>
      {columns.map((column, index) => <section key={column.id} className="es-application-board-column" aria-labelledby={`${id}-${index}`}>
        <header className="es-application-board-heading">
          <h2 id={`${id}-${index}`}><Badge label={column.label} tone={column.tone} purpose="status" /></h2>
          <span className="es-application-board-count">{column.items.length}<span className="es-visually-hidden"> {column.items.length === 1 ? 'vaga' : 'vagas'}</span></span>
        </header>
        {column.items.length === 0 ? <p className="es-application-board-empty">{column.emptyLabel ?? emptyLabel}</p> : <ul className="es-application-board-list">
          {column.items.map(({ id: itemId, moveTo, ...card }) => {
            const editable = Boolean(onMove && moveTo?.some(target => target !== column.id && columns.some(item => item.id === target)));
            const options = columns.filter(target => target.id === column.id || moveTo?.includes(target.id)).map(target => ({ id: target.id, label: target.label }));
            return <li key={itemId} ref={element => { if (element) cards.current.set(itemId, element); else cards.current.delete(itemId); }}>
              <ApplicationCard {...card} purpose="kanban" status={{ id: column.id, label: column.label, tone: column.tone }} statusOptions={editable ? options : undefined}
                onStatusChange={editable ? target => {
                  if (target === column.id || !moveTo?.includes(target) || !columns.some(item => item.id === target)) return;
                  pendingFocus.current = { itemId, columnId: target };
                  onMove?.(itemId, target);
                } : undefined} />
            </li>;
          })}
        </ul>}
      </section>)}
    </div>
    <p className="es-visually-hidden" role="status">{announcement}</p>
  </div>;
}
