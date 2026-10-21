import { useId, useLayoutEffect, useRef } from 'react';
import { ApplicationCard, type ApplicationCardProps } from './application-card';
import { KanbanBoard, KanbanColumn } from 'beds';
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
export function ApplicationBoard({ label, description, columns, destinations, onMove, announcement = '', emptyLabel = 'Nenhuma vaga nesta etapa' }: {
  label: string;
  /** How to move cards, read after the board label. */
  description?: string;
  columns: readonly ApplicationBoardColumn[];
  /** Optional host catalog. Without it, visible columns preserve the legacy destination fallback. */
  destinations?: readonly ApplicationBoardDestination[];
  onMove?: (itemId: string, columnId: string) => void;
  /** Host-confirmed update or recovery copy, not an optimistic success. */
  announcement?: string;
  emptyLabel?: string;
}) {
  const id = useId();
  const cards = useRef(new Map<string, HTMLDivElement>());
  const pendingFocus = useRef<{ itemId: string; sourceColumnId: string; destinationId: string } | null>(null);
  const destinationCatalog = destinations ?? columns.map(column => ({ id: column.id, label: column.label }));

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
        const index = columns.findIndex(column => column.id === pending.sourceColumnId);
        const fallback = document.getElementById(`${id}-${index}`);
        fallback?.focus({ preventScroll: true });
        fallback?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }
    pendingFocus.current = null;
  }, [columns]);

  return <div className="recipe-application-board">
    <KanbanBoard label={label} description={description}>
      {columns.map((column, index) => <KanbanColumn key={column.id} title={column.label} count={column.items.length} emptyLabel={column.emptyLabel ?? emptyLabel} headingId={`${id}-${index}`}>
        {column.items.map(({ id: itemId, moveTo, ...card }) => {
          const options = destinationCatalog.filter(destination => destination.id !== column.id && moveTo?.includes(destination.id));
          const editable = Boolean(onMove && options.length > 0);
          return <div key={itemId} className="recipe-application-board-item" ref={element => { if (element) cards.current.set(itemId, element); else cards.current.delete(itemId); }}>
            <ApplicationCard {...card} purpose="kanban" status={{ id: column.id, label: column.label, tone: column.tone }} statusOptions={editable ? options : undefined}
              onStatusChange={editable ? target => {
                if (!options.some(option => option.id === target)) return;
                pendingFocus.current = { itemId, sourceColumnId: column.id, destinationId: target };
                onMove?.(itemId, target);
              } : undefined} />
          </div>;
        })}
      </KanbanColumn>)}
    </KanbanBoard>
    <p className="recipe-application-sr-only" role="status">{announcement}</p>
  </div>;
}
