import { Combobox }     from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import type { AddSeoTaskForm } from './AddSeoTaskModal.types';

/* ── Shared style tokens ─────────────────────────────────────────────── */
const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

const PRIORITY_ITEMS: ComboboxItem[] = [
  { id: 'high',   label: 'عالية'    },
  { id: 'medium', label: 'متوسطة'  },
  { id: 'low',    label: 'منخفضة'  },
];

interface Props {
  form:       AddSeoTaskForm;
  set:        <K extends keyof AddSeoTaskForm>(key: K, val: AddSeoTaskForm[K]) => void;
  teamItems:  ComboboxItem[];
  isAr:       boolean;
}

export function AddSeoTaskForm({ form, set, teamItems, isAr }: Props) {
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
          className={INPUT}
        />
      </div>

      {/* Phase */}
      <div>
        <label className={LABEL}>
          {isAr ? 'المرحلة' : 'Phase'}
          <span className="text-red-500 ms-1">*</span>
        </label>
        <input
          type="text"
          value={form.phase}
          onChange={e => set('phase', e.target.value)}
          placeholder={isAr ? 'مثال: On-Page SEO' : 'e.g. On-Page SEO'}
          className={INPUT}
        />
      </div>

      {/* Description */}
      <div>
        <label className={LABEL}>{isAr ? 'الوصف' : 'Description'}</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder={isAr ? 'وصف المهمة...' : 'Task description…'}
          className={`${INPUT} resize-none`}
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
            value={form.assignee}
            onChange={v => set('assignee', v)}
            placeholder={isAr ? 'اختر عضو' : 'Pick member'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
        <div>
          <label className={LABEL}>{isAr ? 'الأولوية' : 'Priority'}</label>
          <Combobox
            items={PRIORITY_ITEMS}
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
            min="1"
            value={form.estimatedHours}
            onChange={e => set('estimatedHours', e.target.value)}
            placeholder="8"
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

    </div>
  );
}
