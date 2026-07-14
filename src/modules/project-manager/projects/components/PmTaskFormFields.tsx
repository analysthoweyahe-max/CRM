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

const INPUT_ERROR = [
  'w-full rounded-xl border border-red-400 dark:border-red-500',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';
const ERROR_TEXT = 'mt-1 text-xs text-red-500';

export interface PmTaskFormState {
  title:          string;
  description:    string;
  priority:       string;
  status:         string;
  assigneeId:     string;
  dueDate:          string;
  estimatedHours:   string;
  estimatedMinutes: string;
  phaseId:          string;
}

interface Props {
  form:          PmTaskFormState;
  set:           <K extends keyof PmTaskFormState>(key: K, val: PmTaskFormState[K]) => void;
  errors?:       Record<string, string>;
  teamItems:     ComboboxItem[];
  phaseItems:    ComboboxItem[];
  priorityItems: ComboboxItem[];
  statusItems:   ComboboxItem[];
  isAr:          boolean;
}

export function PmTaskFormFields({
  form, set, errors = {}, teamItems, phaseItems, priorityItems, statusItems, isAr,
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
          className={errors.title ? INPUT_ERROR : INPUT}
        />
        {errors.title && <p className={ERROR_TEXT}>{errors.title}</p>}
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
            error={!!errors.assigneeId}
            placeholder={isAr ? 'اختر عضو' : 'Pick member'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
          {errors.assigneeId && <p className={ERROR_TEXT}>{errors.assigneeId}</p>}
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
            error={!!errors.priority}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
          {errors.priority && <p className={ERROR_TEXT}>{errors.priority}</p>}
        </div>
      </div>

      {/* Due Date + Estimated Hours/Minutes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={LABEL}>
            {isAr ? 'تاريخ التسليم' : 'Due Date'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <input
            type="date"
            value={form.dueDate}
            onChange={e => set('dueDate', e.target.value)}
            className={errors.dueDate ? INPUT_ERROR : INPUT}
          />
          {errors.dueDate && <p className={ERROR_TEXT}>{errors.dueDate}</p>}
        </div>
        <div>
          <label className={LABEL}>{isAr ? 'الساعات المقدرة' : 'Est. Hours'}</label>
          <input
            type="number"
            min="0"
            value={form.estimatedHours}
            onChange={e => set('estimatedHours', e.target.value)}
            placeholder="8"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>{isAr ? 'الدقائق المقدرة' : 'Est. Minutes'}</label>
          <input
            type="number"
            min="0"
            max="59"
            value={form.estimatedMinutes}
            onChange={e => set('estimatedMinutes', e.target.value)}
            placeholder="30"
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
            error={!!errors.phaseId}
            placeholder={isAr ? 'اختر المرحلة' : 'Select stage'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
          {errors.phaseId && <p className={ERROR_TEXT}>{errors.phaseId}</p>}
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
            error={!!errors.status}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
          {errors.status && <p className={ERROR_TEXT}>{errors.status}</p>}
        </div>
      </div>

    </div>
  );
}
