import { type ReactNode } from 'react';
import { toast } from 'sonner';
import { Badge }    from '@/shared/components/ui/Badge';
import { Combobox } from '@/shared/components/form/Combobox';
import { useAuth }  from '@/modules/auth/context/AuthContext';
import { useUpdateTaskStatus } from '../hooks/useTaskDetail';
import { fmtDeadline, PRIORITY_MAP } from './useTasksTable';
import type { TaskDetail } from '../types/taskDetail.types';
import type { EmpTaskStatus } from '../types/employeeTask.types';

interface Props {
  task:      TaskDetail | undefined;
  isLoading: boolean;
  isAr:      boolean;
  projectId: string;
  taskId:    string;
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

export function TaskDetailInfo({ task, isLoading, isAr, projectId, taskId }: Props) {
  const { user } = useAuth();
  const { mutate: updateStatus, isPending: updatingStatus } = useUpdateTaskStatus(projectId, taskId);

  if (isLoading || !task) return <Skeleton />;

  const priority = PRIORITY_MAP[task.priority];
  const initial  = (user?.fullName ?? 'E').slice(0, 1).toUpperCase();

  const statusItems = STATUS_OPTIONS.map(o => ({ id: o.value, label: isAr ? o.ar : o.en }));

  function handleStatusChange(value: string) {
    updateStatus(value as EmpTaskStatus, {
      onError: () => toast.error(isAr ? 'تعذّر تحديث الحالة' : 'Failed to update status'),
    });
  }

  return (
    <div>
      <InfoRow
        label={isAr ? 'العنوان' : 'Title'}
        value={<span className="font-medium">{task.title}</span>}
      />
      <InfoRow
        label={isAr ? 'الوصف التفصيلي' : 'Description'}
        value={
          <span className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
            {task.description || (isAr ? 'لا يوجد وصف' : 'No description')}
          </span>
        }
      />
      {task.stage && (
        <InfoRow
          label={isAr ? 'المرحلة' : 'Stage'}
          value={
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              {task.stage}
            </span>
          }
        />
      )}
      <InfoRow
        label={isAr ? 'المسؤول عن التنفيذ' : 'Assignee'}
        value={
          <div className="flex items-center gap-2 justify-end">
            <span>{user?.fullName ?? ''}</span>
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold">
              {initial}
            </div>
          </div>
        }
      />
      {task.createdAt && (
        <InfoRow label={isAr ? 'تاريخ الإنشاء' : 'Created At'} value={fmtDeadline(task.createdAt, isAr)} />
      )}
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
              value={task.status}
              onChange={handleStatusChange}
              disabled={updatingStatus}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
              noResultsText={isAr ? 'لا نتائج' : 'No results'}
            />
          </div>
        }
      />
    </div>
  );
}
