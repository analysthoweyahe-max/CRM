import { useState }         from 'react';
import { Pencil, Trash2 }   from 'lucide-react';
import { Button }            from '@/shared/components/ui/Button';
import { Combobox }          from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import type { Task }         from '../types/task.types';

interface Props {
  task:          Task;
  onDeleteClick: () => void;
  onEditClick:   () => void;
  isAr:          boolean;
}

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function fmtDate(d: string): string {
  const [y, m, day] = d.split('-').map(Number);
  return `${day} ${MONTHS_AR[m - 1]} ${y}`;
}

const STAGE_ITEMS: ComboboxItem[] = [
  { id: 'التطوير',    label: 'التطوير'    },
  { id: 'التصميم',    label: 'التصميم'    },
  { id: 'الاختبار',   label: 'الاختبار'   },
  { id: 'التكاملات',  label: 'التكاملات'  },
  { id: 'المراجعة',   label: 'المراجعة'   },
  { id: 'التخطيط',    label: 'التخطيط'    },
];

const PRIORITY_ITEMS_AR: ComboboxItem[] = [
  { id: 'high',   label: 'عالية'   },
  { id: 'medium', label: 'متوسطة'  },
  { id: 'low',    label: 'منخفضة'  },
];
const PRIORITY_ITEMS_EN: ComboboxItem[] = [
  { id: 'high',   label: 'High'   },
  { id: 'medium', label: 'Medium' },
  { id: 'low',    label: 'Low'    },
];

const STATUS_ITEMS_AR: ComboboxItem[] = [
  { id: 'pending',    label: 'قيد الانتظار' },
  { id: 'inProgress', label: 'قيد التنفيذ'  },
  { id: 'review',     label: 'مراجعة'       },
  { id: 'completed',  label: 'مكتمل'        },
];
const STATUS_ITEMS_EN: ComboboxItem[] = [
  { id: 'pending',    label: 'Pending'     },
  { id: 'inProgress', label: 'In Progress' },
  { id: 'review',     label: 'Review'      },
  { id: 'completed',  label: 'Completed'   },
];

export function TaskInfoTab({ task, onDeleteClick, onEditClick, isAr }: Props) {
  const [stage,      setStage]      = useState(task.categoryAr);
  const [priority,   setPriority]   = useState(task.priority);
  const [taskStatus, setTaskStatus] = useState(task.status);

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
          <p className="text-sm text-gray-600 dark:text-gray-300 text-right leading-relaxed">
            {task.description ?? (isAr ? 'وصف تفصيلي للمهمة وما هو مطلوب إنجازه ضمن هذه المرحلة من المشروع.' : 'Detailed description of the task and what is required.')}
          </p>
        </div>
      </div>

      {/* Stage row */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-44">
          <Combobox
            items={STAGE_ITEMS}
            value={stage}
            onChange={setStage}
            placeholder={isAr ? 'اختر المرحلة' : 'Select stage'}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{isAr ? 'المرحلة' : 'Stage'}</p>
      </div>

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

      {/* Created by */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">أحمد المنصور</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{isAr ? 'تم الإنشاء بواسطة' : 'Created by'}</p>
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-left">
          <p className="text-xs text-gray-400">{isAr ? 'تاريخ البداية' : 'Start Date'}</p>
          <p className="font-medium text-gray-700 dark:text-gray-200 mt-0.5">10 {isAr ? 'يونيو' : 'Jun'} 2026</p>
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
          <Combobox
            items={isAr ? PRIORITY_ITEMS_AR : PRIORITY_ITEMS_EN}
            value={priority}
            onChange={v => setPriority(v as typeof priority)}
            placeholder={isAr ? 'الأولوية' : 'Priority'}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-gray-400 text-right">{isAr ? 'الحالة' : 'Status'}</p>
          <Combobox
            items={isAr ? STATUS_ITEMS_AR : STATUS_ITEMS_EN}
            value={taskStatus}
            onChange={v => setTaskStatus(v as typeof taskStatus)}
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
