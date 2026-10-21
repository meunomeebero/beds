import { useId, useLayoutEffect, useRef } from 'react';
import { ApplicationCard, type ApplicationCardProps } from './application-card';
import { KanbanBoard, KanbanCard, KanbanColumn, KanbanDragHandle, type KanbanMove } from 'beds';
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
const DRAG_MESSAGES = {
  instructions: 'Pressione espaço ou Enter para pegar a vaga. Use as setas para cima e para baixo para escolher a posição, ou esquerda e direita para escolher uma etapa permitida. Pressione espaço ou Enter para soltar, ou Escape para cancelar. O menu do card também muda a etapa.',
  roleDescription: 'vaga arrastável',
  picked: (title: string) => `${title} selecionada para mover.`,
  over: (position: number, column: string) => `Solte na posição ${position} de ${column}.`,
  outside: 'Fora de uma etapa permitida. Solte para cancelar.',
  dropped: (column: string) => `Movimento para ${column} solicitado.`,
  reordered: (column: string) => `Ordem em ${column} atualizada.`,
  cancelled: 'Movimento cancelado. A etapa não mudou.',
};

export function ApplicationBoard({ label, description, columns, destinations, onMove, onDrop, announcement = '', emptyLabel = 'Nenhuma vaga nesta etapa' }: {
  label: string;
  /** How to move cards, read after the board label. */
  description?: string;
  columns: readonly ApplicationBoardColumn[];
  /** Optional host catalog. Without it, visible columns preserve the legacy destination fallback. */
  destinations?: readonly ApplicationBoardDestination[];
  onMove?: (itemId: string, columnId: string) => void;
  /** Turns on drag and drop: same column = new position, another column = a stage move inside `moveTo`. */
  onDrop?: (move: KanbanMove) => void;
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
    <KanbanBoard label={label} description={description} drag={onDrop ? {
      onDrop,
      canDrop: (itemId, columnId) => columns.some(column => column.items.some(item => item.id === itemId && item.moveTo?.includes(columnId))),
      messages: DRAG_MESSAGES,
    } : undefined}>
      {columns.map((column, index) => <KanbanColumn key={column.id} id={column.id} title={column.label} count={column.items.length} emptyLabel={column.emptyLabel ?? emptyLabel} headingId={`${id}-${index}`}>
        {column.items.map(({ id: itemId, moveTo, ...card }) => {
          const options = destinationCatalog.filter(destination => destination.id !== column.id && moveTo?.includes(destination.id));
          const editable = Boolean(onMove && options.length > 0);
          return <KanbanCard key={itemId} id={itemId} title={card.title}><div className="recipe-application-board-item" ref={element => {
            // The drag overlay renders a second copy of the card: keep the map on the board's own node.
            if (!element || element.closest('.es-kanban-overlay')) return;
            cards.current.set(itemId, element);
            return () => { if (cards.current.get(itemId) === element) cards.current.delete(itemId); };
          }}>
            <ApplicationCard {...card} purpose="kanban" dragHandle={onDrop ? <KanbanDragHandle label={`Arrastar ${card.title}`} /> : undefined} status={{ id: column.id, label: column.label, tone: column.tone }} statusOptions={editable ? options : undefined}
              onStatusChange={editable ? target => {
                if (!options.some(option => option.id === target)) return;
                pendingFocus.current = { itemId, sourceColumnId: column.id, destinationId: target };
                onMove?.(itemId, target);
              } : undefined} />
          </div></KanbanCard>;
        })}
      </KanbanColumn>)}
    </KanbanBoard>
    <p className="recipe-application-sr-only" role="status">{announcement}</p>
  </div>;
}
