import { useState, type ReactNode } from 'react';
import { Badge }    from '@/shared/components/ui/Badge';
import { Combobox } from '@/shared/components/form/Combobox';
import { fmtDeadline, PRIORITY_MAP } from './useTasksTable';
import type { TaskDetail } from '../types/taskDetail.types';
import type { EmpTaskStatus } from '../types/employeeTask.types';

interface Props {
  task:      TaskDetail | undefined;
  isLoading: boolean;
  isAr:      boolean;
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-400 dark:text-gray-500 shrink-0">{label}</span>
      <div className="text-sm text-gray-800 dark:text-gray-200 text-end">{value}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-3.5 border-b border-gray-100 gap-4">
          <div className="h-4 w-28 bg-gray-100 dark:bg-gray-700 rounded" />
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-600 rounded" />
        </div>
      ))}
    </div>
  );
}

const STATUS_OPTIONS: { value: EmpTaskStatus; ar: string; en: string }[] = [
  { value: 'inProgress', ar: 'قيد التنفيذ', en: 'In Progress' },
  { value: 'completed',  ar: 'مكتملة',      en: 'Completed'   },
  { value: 'pending',    ar: 'معلقة',        en: 'Pending'     },
];

export function TaskDetailInfo({ task, isLoading, isAr }: Props) {
  const [status, setStatus] = useState<EmpTaskStatus>(task?.status ?? 'inProgress');

  if (isLoading || !task) return <Skeleton />;

  const priority = PRIORITY_MAP[task.priority];
  const title    = isAr ? task.titleAr    : task.titleEn;
  const desc     = isAr ? task.descriptionAr : task.descriptionEn;
  const assignee = isAr ? task.assigneeAr : task.assigneeEn;
  const creator  = isAr ? task.createdByAr : task.createdByEn;

  const statusItems = STATUS_OPTIONS.map(o => ({ id: o.value, label: isAr ? o.ar : o.en }));

  return (
    <div>
      <InfoRow
        label={isAr ? 'العنوان' : 'Title'}
        value={<span className="font-medium">{title}</span>}
      />
      <InfoRow
        label={isAr ? 'الوصف التفصيلي' : 'Description'}
        value={
          <span className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
            {desc || (isAr ? 'وصف تفصيلي للمهمة وما هو مطلوب إنجازه ضمن هذه المرحلة من المشروع.' : 'Detailed description...')}
          </span>
        }
      />
      <InfoRow
        label={isAr ? 'المرحلة' : 'Stage'}
        value={
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            {task.stage}
          </span>
        }
      />
      <InfoRow
        label={isAr ? 'المسؤول عن التنفيذ' : 'Assignee'}
        value={
          <div className="flex items-center gap-2 justify-end">
            <span>{assignee}</span>
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold">
              {task.assigneeInitials}
            </div>
          </div>
        }
      />
      <InfoRow label={isAr ? 'تم الإنشاء بواسطة' : 'Created By'} value={creator} />
      <InfoRow label={isAr ? 'تاريخ البداية' : 'Start Date'}     value={fmtDeadline(task.startDate, isAr)} />
      <InfoRow label={isAr ? 'تاريخ التسليم' : 'Deadline'}       value={fmtDeadline(task.deadline, isAr)} />
      <InfoRow
        label={isAr ? 'الأولوية' : 'Priority'}
        value={
          <Badge
            label={isAr ? priority.ar : priority.en}
            variant={priority.variant}
            icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}
          />
        }
      />
      <InfoRow
        label={isAr ? 'الحالة' : 'Status'}
        value={
          <div className="w-40">
            <Combobox
              items={statusItems}
              value={status}
              onChange={v => setStatus(v as EmpTaskStatus)}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
              noResultsText={isAr ? 'لا نتائج' : 'No results'}
            />
          </div>
        }
      />
    </div>
  );
}
