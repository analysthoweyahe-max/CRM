import { useState } from 'react';
import type { ReactNode } from 'react';

interface Props<T> {
  groupKey:    string;
  label:       string;
  color:       string;
  items:       T[];
  isAr:        boolean;
  getId:       (item: T) => string;
  renderCard:  (item: T) => ReactNode;
  onDrop:      (id: string, groupKey: string) => void;
  emptyLabel?: string;
  /** Set false to render cards without the draggable wrapper (e.g. when the
   *  caller has no permission/handler to change the group on drop). */
  draggable?:  boolean;
}

/** Generic kanban column shell: header (dot + label + count) + a native
 *  HTML5 drag-and-drop zone. Shared by every task board in the app so the
 *  drag mechanics/state (onDragOver/onDragLeave/onDrop + isDragOver ring)
 *  live in one place instead of being copy-pasted per module. */
export function KanbanColumn<T>({
  groupKey, label, color, items, isAr, getId, renderCard, onDrop, emptyLabel, draggable = true,
}: Props<T>) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className="flex flex-col flex-1 min-w-[270px] max-w-[320px] shrink-0
                 rounded-2xl border border-gray-200 dark:border-gray-700
                 bg-white dark:bg-gray-800/40 shadow-sm overflow-hidden border-t-4"
      style={{ borderTopColor: color }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3
                      border-b border-gray-200 dark:border-gray-700/70
                      bg-white dark:bg-gray-800/70">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{label}</span>
        <span className="ms-auto min-w-[24px] h-6 px-1.5 rounded-full
                         bg-gray-100 dark:bg-gray-700
                         text-gray-600 dark:text-gray-300 text-xs font-bold
                         flex items-center justify-center">
          {items.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={draggable ? (e => { e.preventDefault(); setIsDragOver(true); }) : undefined}
        onDragLeave={draggable ? (e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
        }) : undefined}
        onDrop={draggable ? (e => {
          e.preventDefault();
          const id = e.dataTransfer.getData('taskId');
          if (id) onDrop(id, groupKey);
          setIsDragOver(false);
        }) : undefined}
        className={[
          'flex-1 min-h-[480px] p-3 space-y-3 transition-all duration-150',
          isDragOver
            ? 'ring-2 ring-inset ring-[#A0CD39] ring-dashed bg-[#D8EBAE]/30 dark:bg-[#A0CD39]/10'
            : 'bg-gray-50/70 dark:bg-gray-900/20',
        ].join(' ')}
      >
        {items.map(item => (
          <div
            key={getId(item)}
            draggable={draggable}
            onDragStart={draggable ? (e => {
              e.dataTransfer.setData('taskId', getId(item));
              e.dataTransfer.effectAllowed = 'move';
            }) : undefined}
          >
            {renderCard(item)}
          </div>
        ))}

        {items.length === 0 && (
          <div className="h-full min-h-[200px] flex items-center justify-center py-16
                          rounded-xl border border-dashed border-gray-200 dark:border-gray-600/60">
            <p className="text-sm text-gray-400 dark:text-gray-500 select-none">
              {emptyLabel ?? (isAr ? 'لا توجد مهام' : 'No tasks')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
