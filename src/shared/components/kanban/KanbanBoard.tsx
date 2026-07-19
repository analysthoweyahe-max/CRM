import type { ReactNode } from 'react';
import { KanbanColumn } from './KanbanColumn';

export interface KanbanColumnData<T> {
  key:   string;
  label: string;
  color: string;
  items: T[];
}

interface Props<T> {
  columns:     KanbanColumnData<T>[];
  isAr:        boolean;
  getId:       (item: T) => string;
  renderCard:  (item: T) => ReactNode;
  onDrop:      (id: string, groupKey: string) => void;
  emptyLabel?: string;
  draggable?:  boolean;
  isItemDraggable?: (item: T) => boolean;
}

/** Generic horizontal-scroll kanban board: lays out columns and delegates
 *  all drag/status/phase logic to the caller via `onDrop`. */
export function KanbanBoard<T>({
  columns, isAr, getId, renderCard, onDrop, emptyLabel, draggable, isItemDraggable,
}: Props<T>) {
  return (
    <div className="flex gap-5 overflow-x-auto pb-4 px-1">
      {columns.map(col => (
        <KanbanColumn
          key={col.key}
          groupKey={col.key}
          label={col.label}
          color={col.color}
          items={col.items}
          isAr={isAr}
          getId={getId}
          renderCard={renderCard}
          onDrop={onDrop}
          emptyLabel={emptyLabel}
          draggable={draggable}
          isItemDraggable={isItemDraggable}
        />
      ))}
    </div>
  );
}
