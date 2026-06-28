import { useState }   from 'react';
import { Modal }       from '@/shared/components/ui/Modal';
import { Button }      from '@/shared/components/ui/Button';
import { Combobox }    from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import type { TaskPriority } from '../../tasks/types/task.types';
import type { TeamMember } from '../types/project.types';
import { addTask } from '../../tasks/store/taskStore';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

const PRIORITY_ITEMS: ComboboxItem[] = [
  { id: 'high',   label: 'عالية'  },
  { id: 'medium', label: 'متوسطة' },
  { id: 'low',    label: 'منخفضة' },
];

interface StageEntry { ar: string; en: string }
const STAGES: StageEntry[] = [
  { ar: 'متطلبات العمل', en: 'Requirements'  },
  { ar: 'التحليل',       en: 'Analysis'      },
  { ar: 'التصميم',       en: 'Design'        },
  { ar: 'التطوير',       en: 'Development'   },
  { ar: 'الاختبار',      en: 'Testing'       },
  { ar: 'التكاملات',     en: 'Integrations'  },
  { ar: 'المراجعة',      en: 'Review'        },
  { ar: 'النشر',         en: 'Deployment'    },
];
const STAGE_ITEMS: ComboboxItem[] = STAGES.map(s => ({ id: s.ar, label: s.ar }));

interface Props {
  open:      boolean;
  onClose:   () => void;
  projectId: string;
  team:      TeamMember[];
  taskCount: number;
  isAr:      boolean;
}

export function AddTaskModal({ open, onClose, projectId, team, taskCount, isAr }: Props) {
  const [title,          setTitle]          = useState('');
  const [description,    setDescription]    = useState('');
  const [priority,       setPriority]       = useState<string>('medium');
  const [assignee,       setAssignee]       = useState('');
  const [dueDate,        setDueDate]        = useState('');
  const [estimatedHours, setEstimatedHours] = useState<string>('');
  const [stage,          setStage]          = useState('');

  const teamItems: ComboboxItem[] = team.map(m => ({ id: m.name, label: m.name }));

  function handleAdd() {
    if (!title.trim()) return;
    const member = team.find(m => m.name === assignee);
    const num    = String(taskCount + 1).padStart(3, '0');
    const stageEntry = STAGES.find(s => s.ar === stage);
    addTask({
      id:              `t-${projectId}-${num}`,
      projectId,
      title:           title.trim(),
      description:     description.trim() || undefined,
      categoryAr:      stageEntry?.ar ?? 'عام',
      categoryEn:      stageEntry?.en ?? 'General',
      priority:        (priority as TaskPriority),
      assigneeName:    member?.name    ?? assignee,
      assigneeInitial: member?.initial ?? (assignee ? assignee[0] : '؟'),
      assigneeColor:   member?.color   ?? 'bg-gray-400',
      dueDate,
      estimatedHours:  estimatedHours ? Number(estimatedHours) : undefined,
      status:          'pending',
      taskNumber:      `#${num}`,
    });
    setTitle(''); setDescription(''); setPriority('medium');
    setAssignee(''); setDueDate(''); setEstimatedHours(''); setStage('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'إضافة مهمة' : 'Add Task'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" disabled={!title.trim()} onClick={handleAdd}>
            {isAr ? 'إضافة مهمة' : 'Add Task'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">

        {/* Title */}
        <div>
          <label className={LABEL}>
            {isAr ? 'عنوان المهمة' : 'Task Title'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <input
            required
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={isAr ? 'عنوان المهمة' : 'Task title'}
            className={INPUT}
          />
        </div>

        {/* Description */}
        <div>
          <label className={LABEL}>{isAr ? 'الوصف' : 'Description'}</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={isAr ? 'وصف المهمة...' : 'Task description…'}
            className={`${INPUT} resize-none`}
          />
        </div>

        {/* Assignee + Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>{isAr ? 'المسؤول' : 'Assignee'}</label>
            <Combobox
              items={teamItems}
              value={assignee}
              onChange={setAssignee}
              placeholder={isAr ? 'اختر عضو' : 'Pick member'}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
              noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
            />
          </div>
          <div>
            <label className={LABEL}>{isAr ? 'الأولوية' : 'Priority'}</label>
            <Combobox
              items={PRIORITY_ITEMS}
              value={priority}
              onChange={setPriority}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
              noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
            />
          </div>
        </div>

        {/* Due Date + Estimated Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>{isAr ? 'تاريخ التسليم' : 'Due Date'}</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>{isAr ? 'الساعات المقدرة' : 'Est. Hours'}</label>
            <input
              type="number"
              min="1"
              value={estimatedHours}
              onChange={e => setEstimatedHours(e.target.value)}
              placeholder="8"
              className={INPUT}
            />
          </div>
        </div>

        {/* Stage */}
        <div>
          <label className={LABEL}>{isAr ? 'المرحلة' : 'Stage'}</label>
          <Combobox
            items={STAGE_ITEMS}
            value={stage}
            onChange={setStage}
            placeholder={isAr ? 'اختر المرحلة' : 'Select stage'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>

      </div>
    </Modal>
  );
}
