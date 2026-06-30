import { Modal }        from '@/shared/components/ui/Modal';
import { Button }       from '@/shared/components/ui/Button';
import { Combobox }     from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { useAddSeoTask } from './useAddSeoTask';
import type { SeoTask }  from '../api/campaign.api';

/* ── Shared style tokens ─────────────────────────────────────────────── */
const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

/* ── Static lookup data ──────────────────────────────────────────────── */
const PRIORITY_ITEMS: ComboboxItem[] = [
  { id: 'high',   label: 'عالية'    },
  { id: 'medium', label: 'متوسطة'  },
  { id: 'low',    label: 'منخفضة'  },
];

const STAGE_ITEMS: ComboboxItem[] = [
  { id: 'keyword_research',    label: 'بحث الكلمات المفتاحية' },
  { id: 'content_optimization',label: 'تحسين المحتوى'          },
  { id: 'link_building',       label: 'بناء الروابط'           },
  { id: 'competitor_analysis', label: 'تحليل المنافسين'         },
  { id: 'technical_seo',       label: 'تحسين تقني'             },
  { id: 'on_page_seo',         label: 'تحسين على الصفحة'        },
  { id: 'off_page_seo',        label: 'تحسين خارج الصفحة'       },
  { id: 'reporting',           label: 'التقارير والتحليل'       },
];

/* ── Props ───────────────────────────────────────────────────────────── */
interface Props {
  open:          boolean;
  onClose:       () => void;
  campaignId:    string;
  prefillUrl?:   string;
  teamItems?:    ComboboxItem[];
  isAr:          boolean;
  onCreated?:    (task: SeoTask) => void;
}

/* ── Component ───────────────────────────────────────────────────────── */
export function AddSeoTaskModal({
  open,
  onClose,
  campaignId,
  prefillUrl  = '',
  teamItems   = [],
  isAr,
  onCreated,
}: Props) {
  const { form, apiError, set, isValid, isSaving, handleAdd } =
    useAddSeoTask(campaignId, prefillUrl, onClose, onCreated);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'إضافة مهمة' : 'Add Task'}
      size="md"
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          {apiError ? (
            <p className="text-xs text-red-500 dark:text-red-400 flex-1">{apiError}</p>
          ) : <span />}
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="ghost" onClick={onClose}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              disabled={!isValid || isSaving}
              onClick={handleAdd}
            >
              {isSaving
                ? (isAr ? 'جاري الحفظ...' : 'Saving…')
                : (isAr ? 'إضافة مهمة'  : 'Add Task')}
            </Button>
          </div>
        </div>
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
          <textarea
            rows={3}
            value={form.description}
            onChange={e => set('description', e.target.value)}
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
        <div className="grid grid-cols-2 gap-4">
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

        {/* Stage */}
        <div>
          <label className={LABEL}>{isAr ? 'المرحلة' : 'Stage'}</label>
          <Combobox
            items={STAGE_ITEMS}
            value={form.stage}
            onChange={v => set('stage', v)}
            placeholder={isAr ? 'اختر المرحلة' : 'Select stage'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
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
    </Modal>
  );
}
