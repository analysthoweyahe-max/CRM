import { Calendar, ImageIcon, Paperclip, Trash2 } from 'lucide-react';
import { formatDateShort } from '@/shared/utils/date.utils';
import type { ClientIssue } from '../types/projectClientIssue.types';

interface Props {
  issue:     ClientIssue;
  isAr:      boolean;
  onOpen:    (issue: ClientIssue) => void;
  onDelete?: (issue: ClientIssue) => void;
}

export function ClientIssueKanbanCard({ issue, isAr, onOpen, onDelete }: Props) {
  const hasImage = !!issue.imageAttachment;
  const hasFile  = !!issue.fileAttachment;

  return (
    <div
      onClick={() => onOpen(issue)}
      className="group bg-white dark:bg-gray-800 rounded-xl p-3.5 shadow-sm
                 border border-gray-100 dark:border-gray-700/60
                 cursor-grab active:cursor-grabbing active:opacity-50
                 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600
                 transition-all duration-150 select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug text-start line-clamp-2 flex-1">
          {issue.problem}
        </p>
        {onDelete && (
          <button
            type="button"
            aria-label={isAr ? 'حذف' : 'Delete'}
            onClick={e => { e.stopPropagation(); onDelete(issue); }}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0
                       text-gray-300 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400
                       transition-all duration-150"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {issue.impact && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2 text-start">
          {issue.impact}
        </p>
      )}

      {(hasImage || hasFile) && (
        <div className="flex items-center gap-2 mb-2 text-gray-400">
          {hasImage && <ImageIcon size={13} />}
          {hasFile && <Paperclip size={13} />}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-50 dark:border-gray-700/50">
        <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
          <Calendar size={11} />
          <span>{formatDateShort(issue.createdAt, isAr)}</span>
        </div>
        <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
          {issue.createdBy?.name}
        </span>
      </div>
    </div>
  );
}
