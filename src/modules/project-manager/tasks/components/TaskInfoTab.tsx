import { Pencil, Trash2 }   from 'lucide-react';
import { Button }            from '@/shared/components/ui/Button';
import { Combobox }          from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { RichTextView }      from '@/shared/components/form/RichTextView';
import type { Task, TaskStatus } from '../types/task.types';
import { usePmTaskLookups } from '../../projects/hooks/usePmTaskLookups';

interface Props {
  task:            Task;
  onDeleteClick:   () => void;
  onEditClick:     () => void;
  onStatusChange:  (status: string) => void;
  changingStatus:  boolean;
  isAr:            boolean;
}

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function fmtDate(d: string): string {
  const [y, m, day] = d.split('-').map(Number);
  return `${day} ${MONTHS_AR[m - 1]} ${y}`;
}

const PRIORITY_LABEL: Record<Task['priority'], { ar: string; en: string }> = {
  urgent: { ar: 'عاجلة',  en: 'Urgent' },
  high:   { ar: 'عالية',  en: 'High'   },
  normal: { ar: 'متوسطة', en: 'Normal' },
  low:    { ar: 'منخفضة', en: 'Low'    },
};

export function TaskInfoTab({ task, onDeleteClick, onEditClick, onStatusChange, changingStatus, isAr }: Props) {
  const { statuses } = usePmTaskLookups();
  const statusItems: ComboboxItem[] = statuses.map(s => ({ id: s.value, label: s.label }));
  const priorityLabel = PRIORITY_LABEL[task.priority];

  return (
    <div className="space-y-5">
      {/* Title */}
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-right">
        {task.title}
      </h2>

      {/* Description */}
      <div className="space-y-1.5">
        <p className="text-xs text-gray-400 text-right">{isAr ? 'الوصف التفصيلي' : 'Description'}</p>
        <div className="rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 px-4 py-3">
          {task.description
            ? <RichTextView html={task.description} className="text-sm text-gray-600 dark:text-gray-300 text-right" />
            : <p className="text-sm text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                {isAr ? 'وصف تفصيلي للمهمة وما هو مطلوب إنجازه ضمن هذه المرحلة من المشروع.' : 'Detailed description of the task and what is required.'}
              </p>
          }
        </div>
      </div>

      {/* Stage row */}
      {task.phaseName && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{task.phaseName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{isAr ? 'المرحلة' : 'Stage'}</p>
        </div>
      )}

      {/* Assignee row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 h-11">
          <div className={`w-5 h-5 rounded-full ${task.assigneeColor} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
            {task.assigneeInitial}
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{task.assigneeName}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{isAr ? 'المسؤول عن التنفيذ' : 'Assignee'}</p>
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-left">
          <p className="text-xs text-gray-400">{isAr ? 'الساعات المقدرة' : 'Est. Hours'}</p>
          <p className="font-medium text-gray-700 dark:text-gray-200 mt-0.5">{task.estimatedHours ?? '—'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{isAr ? 'تاريخ التسليم' : 'Due Date'}</p>
          <p className="font-medium text-gray-700 dark:text-gray-200 mt-0.5">{fmtDate(task.dueDate)}</p>
        </div>
      </div>

      {/* Priority + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-xs text-gray-400 text-right">{isAr ? 'الأولوية' : 'Priority'}</p>
          <div className="h-11 flex items-center px-3.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-200">
            {isAr ? priorityLabel.ar : priorityLabel.en}
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-gray-400 text-right">{isAr ? 'الحالة' : 'Status'}</p>
          <Combobox
            items={statusItems}
            value={task.status as TaskStatus}
            onChange={onStatusChange}
            disabled={changingStatus}
            placeholder={isAr ? 'الحالة' : 'Status'}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button variant="danger" size="sm" startIcon={<Trash2 size={14} />} onClick={onDeleteClick}>
          {isAr ? 'حذف المهمة' : 'Delete Task'}
        </Button>
        <Button variant="secondary" size="sm" startIcon={<Pencil size={14} />} onClick={onEditClick}>
          {isAr ? 'تعديل المهمة' : 'Edit Task'}
        </Button>
      </div>
    </div>
  );
}
