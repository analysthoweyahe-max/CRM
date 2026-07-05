import { ArrowRight, ArrowLeft, FolderOpen } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import type { SeoTaskDetail } from '../types/seoTaskDetail.types';
import type { SeoTaskStatus } from '../types/seoTask.types';

const STATUS_MAP: Record<SeoTaskStatus, { ar: string; en: string; variant: 'brand' | 'success' | 'gray' | 'error' }> = {
  pending:    { ar: 'لم تبدأ بعد', en: 'Not Started', variant: 'gray'    },
  inProgress: { ar: 'قيد التنفيذ', en: 'In Progress',  variant: 'brand'   },
  inReview:   { ar: 'قيد المراجعة', en: 'In Review',   variant: 'brand'   },
  completed:  { ar: 'مكتملة',      en: 'Completed',    variant: 'success' },
  blocked:    { ar: 'محظورة',      en: 'Blocked',      variant: 'error'   },
};

interface SeoTaskDetailHeaderProps {
  task:      SeoTaskDetail | undefined;
  isLoading: boolean;
  isAr:      boolean;
  onBack:    () => void;
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

export function SeoTaskDetailHeader({ task, isLoading, isAr, onBack }: SeoTaskDetailHeaderProps) {
  if (isLoading || !task) return <Skeleton />;

  const status  = STATUS_MAP[task.status] ?? STATUS_MAP.pending;
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
        <Badge
          label={isAr ? status.ar : status.en}
          variant={status.variant}
          icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}
        />
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
