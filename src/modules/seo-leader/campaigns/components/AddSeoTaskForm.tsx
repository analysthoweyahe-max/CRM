import { Combobox }     from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { MultiCombobox } from '@/shared/components/form/MultiCombobox';
import { RichTextEditor } from '@/shared/components/form/RichTextEditor';
import { ImportantLinksField } from '@/shared/components/form/ImportantLinksField';
import { useSeoTaskLookups, SEO_TASK_PHASE_ITEMS } from '../hooks/useSeoTaskLookups';
import { SeoTaskFilesInput } from './SeoTaskFilesInput';
import type { AddSeoTaskForm } from './AddSeoTaskModal.types';

/** Phase is a free-text API field — store the display label, not the slug id. */
const PHASE_ITEMS = SEO_TASK_PHASE_ITEMS.map(({ label }) => ({ id: label, label }));

/* ── Shared style tokens ─────────────────────────────────────────────── */
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

interface Props {
  form:       AddSeoTaskForm;
  set:        <K extends keyof AddSeoTaskForm>(key: K, val: AddSeoTaskForm[K]) => void;
  errors?:    Record<string, string>;
  teamItems:  ComboboxItem[];
  isAr:       boolean;
  files?:     File[];
  onFilesChange?: (files: File[]) => void;
  fileError?: string | null;
  onFileError?: (msg: string | null) => void;
}

export function AddSeoTaskForm({ form, set, errors = {}, teamItems, isAr, files = [], onFilesChange, fileError, onFileError }: Props) {
  const { priorityItems } = useSeoTaskLookups(isAr);
  return (
    <div className="space-y-4">

      {/* Title */}
      <div>
        <label className={LABEL}>
          {isAr ? 'عنوان المهمة' : 'Task Title'}
          <span className="text-red-500 ms-1">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder={isAr ? 'عنوان المهمة' : 'Task title'}
          className={errors.title ? INPUT_ERROR : INPUT}
        />
        {errors.title && <p className={ERROR_TEXT}>{errors.title}</p>}
      </div>

      {/* Phase */}
      <div>
        <label className={LABEL}>
          {isAr ? 'المرحلة' : 'Phase'}
          <span className="text-red-500 ms-1">*</span>
        </label>
        <Combobox
          items={PHASE_ITEMS}
          value={form.phase}
          onChange={v => set('phase', v)}
          error={!!errors.phase}
          placeholder={isAr ? 'اختر المرحلة' : 'Select phase'}
          searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
          noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
        />
        {errors.phase && <p className={ERROR_TEXT}>{errors.phase}</p>}
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

      {/* Assignees + Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>
            {isAr ? 'المسؤولون' : 'Assignees'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <MultiCombobox
            items={teamItems}
            values={form.assignees}
            onChange={v => set('assignees', v)}
            error={!!errors.assignees}
            placeholder={isAr ? 'اختر عضواً أو أكثر' : 'Pick members'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
          {errors.assignees && <p className={ERROR_TEXT}>{errors.assignees}</p>}
        </div>
        <div>
          <label className={LABEL}>{isAr ? 'الأولوية' : 'Priority'}</label>
          <Combobox
            items={priorityItems}
            value={form.priority}
            onChange={v => set('priority', v)}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
      </div>

      {/* Due Date + Estimated Hours/Minutes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={LABEL}>{isAr ? 'تاريخ التسليم' : 'Due Date'}</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={e => set('dueDate', e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>{isAr ? 'الساعات المقدّرة' : 'Est. Hours'}</label>
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
          <label className={LABEL}>{isAr ? 'الدقائق المقدّرة' : 'Est. Minutes'}</label>
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

      {/* SEO Details */}
      <div className="pt-1">
        <p className="text-sm font-semibold text-[#709028] dark:text-[#A0CD39] mb-3">
          {isAr ? 'تفاصيل SEO' : 'SEO Details'}
        </p>

        <div className="space-y-4">
          <div>
            <label className={LABEL}>
              {isAr ? 'الكلمة المفتاحية المستهدفة' : 'Target Keyword'}
            </label>
            <input
              type="text"
              value={form.targetKeyword}
              onChange={e => set('targetKeyword', e.target.value)}
              placeholder={isAr ? 'مثال: خدمات تصميم مواقع' : 'e.g. web design services'}
              className={INPUT}
            />
          </div>

          <div>
            <label className={LABEL}>
              {isAr ? 'الرابط المستهدف' : 'Target URL'}
            </label>
            <input
              type="url"
              value={form.targetUrl}
              onChange={e => set('targetUrl', e.target.value)}
              placeholder="https://"
              className={INPUT}
              dir="ltr"
            />
          </div>
        </div>
      </div>

      <ImportantLinksField
        values={form.importantLinks}
        onChange={v => set('importantLinks', v)}
        isAr={isAr}
        error={errors.importantLinks}
      />

      {onFilesChange && (
        <SeoTaskFilesInput
          files={files}
          onChange={onFilesChange}
          isAr={isAr}
          error={fileError}
          onError={onFileError}
        />
      )}

    </div>
  );
}
