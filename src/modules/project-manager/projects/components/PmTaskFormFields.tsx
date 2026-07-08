import { Combobox }    from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { RichTextEditor } from '@/shared/components/form/RichTextEditor';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

export interface PmTaskFormState {
  title:          string;
  description:    string;
  priority:       string;
  status:         string;
  assigneeId:     string;
  dueDate:        string;
  estimatedHours: string;
  phaseId:        string;
}

interface Props {
  form:          PmTaskFormState;
  set:           <K extends keyof PmTaskFormState>(key: K, val: PmTaskFormState[K]) => void;
  teamItems:     ComboboxItem[];
  phaseItems:    ComboboxItem[];
  priorityItems: ComboboxItem[];
  statusItems:   ComboboxItem[];
  isAr:          boolean;
}

export function PmTaskFormFields({
  form, set, teamItems, phaseItems, priorityItems, statusItems, isAr,
}: Props) {
  return (
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
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder={isAr ? 'عنوان المهمة' : 'Task title'}
          className={INPUT}
        />
      </div>

      {/* Description */}
      <div>
        <label className={LABEL}>{isAr ? 'الوصف' : 'Description'}</label>
        <RichTextEditor
          value={form.description}
          onChange={v => set('description', v)}
          dir={isAr ? 'rtl' : 'ltr'}
          placeholder={isAr ? 'وصف المهمة...' : 'Task description…'}
        />
      </div>

      {/* Assignee + Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>
            {isAr ? 'المسؤول' : 'Assignee'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <Combobox
            items={teamItems}
            value={form.assigneeId}
            onChange={v => set('assigneeId', v)}
            placeholder={isAr ? 'اختر عضو' : 'Pick member'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
        <div>
          <label className={LABEL}>
            {isAr ? 'الأولوية' : 'Priority'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <Combobox
            items={priorityItems}
            value={form.priority}
            onChange={v => set('priority', v)}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
      </div>

      {/* Due Date + Estimated Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>
            {isAr ? 'تاريخ التسليم' : 'Due Date'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <input
            type="date"
            value={form.dueDate}
            onChange={e => set('dueDate', e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>{isAr ? 'الساعات المقدرة' : 'Est. Hours'}</label>
          <input
            type="number"
            min="1"
            value={form.estimatedHours}
            onChange={e => set('estimatedHours', e.target.value)}
            placeholder="8"
            className={INPUT}
          />
        </div>
      </div>

      {/* Stage + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>
            {isAr ? 'المرحلة' : 'Stage'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <Combobox
            items={phaseItems}
            value={form.phaseId}
            onChange={v => set('phaseId', v)}
            placeholder={isAr ? 'اختر المرحلة' : 'Select stage'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
        <div>
          <label className={LABEL}>
            {isAr ? 'الحالة الابتدائية' : 'Initial Status'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <Combobox
            items={statusItems}
            value={form.status}
            onChange={v => set('status', v)}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
      </div>

    </div>
  );
}
