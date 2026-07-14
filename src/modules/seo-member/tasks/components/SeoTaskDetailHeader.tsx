import { ArrowRight, ArrowLeft, FolderOpen, Pencil } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { useSeoTaskLookups, badgeVariantForStatus } from '@/modules/seo-leader/campaigns/hooks/useSeoTaskLookups';
import type { SeoTaskDetail } from '../types/seoTaskDetail.types';

interface SeoTaskDetailHeaderProps {
  task:      SeoTaskDetail | undefined;
  isLoading: boolean;
  isAr:      boolean;
  onBack:    () => void;
  canEdit?:  boolean;
  onEdit?:   () => void;
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="flex items-center justify-between gap-4">
        <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-7 w-56 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>
      <div className="flex justify-end">
        <div className="h-4 w-40 bg-gray-100 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export function SeoTaskDetailHeader({ task, isLoading, isAr, onBack, canEdit, onEdit }: SeoTaskDetailHeaderProps) {
  const { statusOptions } = useSeoTaskLookups(isAr);
  if (isLoading || !task) return <Skeleton />;

  const statusOpt = statusOptions.find(s => s.key === task.status);
  const status = {
    label:   statusOpt?.label ?? task.status,
    variant: badgeVariantForStatus(task.status, statusOpt?.marksCompleted ?? false),
  };
  const taskNum = `#${task.taskNumber.toString().padStart(3, '0')}`;
  const campaign = task.phase ?? task.taskTypeLabel;

  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        {isAr ? 'رجوع' : 'Back'}
        {isAr ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
      </button>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-1.5">
          {(task.isOverdue || task.isDelayed) && (
            <Badge label={task.overdueLabel || (isAr ? 'متأخرة' : 'Overdue')} variant="error" />
          )}
          <Badge
            label={status.label}
            variant={status.variant}
            icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}
          />
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isAr ? 'تعديل المهمة' : 'Edit task'}
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{task.title}</h1>
          <span className="text-sm text-gray-400 dark:text-gray-500 tabular-nums">{taskNum}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <FolderOpen size={14} className="text-gray-400 shrink-0" />
        <span>{campaign}</span>
      </div>
    </div>
  );
}
