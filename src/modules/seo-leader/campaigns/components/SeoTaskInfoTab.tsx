import { Pencil, Trash2, Plus, X as XIcon } from 'lucide-react';
import { Button }        from '@/shared/components/ui/Button';
import { Combobox }      from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import type { SeoTaskFull } from './SeoTaskModal.types';

/* ── Style tokens ─────────────────────────────────────────────────────── */
const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'text-xs text-gray-400 dark:text-gray-500 mb-1 block text-end';
const ROW   = 'flex items-center justify-between gap-4';

/* ── Lookup data ──────────────────────────────────────────────────────── */
const PHASE_ITEMS: ComboboxItem[] = [
  { id: 'keyword_research',     label: 'بحث الكلمات المفتاحية' },
  { id: 'on_page',              label: 'داخل الصفحة'            },
  { id: 'technical',            label: 'تقنية'                  },
  { id: 'content',              label: 'محتوى'                  },
  { id: 'off_page',             label: 'خارج الصفحة'            },
  { id: 'link_building',        label: 'بناء روابط'             },
  { id: 'reporting',            label: 'تقارير'                 },
  { id: 'content_optimization', label: 'تحسين المحتوى'          },
  { id: 'technical_seo',        label: 'تحسين تقني'             },
  { id: 'competitor_analysis',  label: 'تحليل المنافسين'         },
  { id: 'on_page_seo',          label: 'تحسين على الصفحة'        },
  { id: 'off_page_seo',         label: 'تحسين خارج الصفحة'       },
];

const PRIORITY_ITEMS: ComboboxItem[] = [
  { id: 'high',   label: 'عالية'   },
  { id: 'medium', label: 'متوسطة' },
  { id: 'normal', label: 'عادية'   },
  { id: 'low',    label: 'منخفضة' },
];

const STATUS_ITEMS: ComboboxItem[] = [
  { id: 'pending',     label: 'قيد الانتظار' },
  { id: 'in_progress', label: 'قيد التنفيذ'  },
  { id: 'in_review',   label: 'مراجعة'       },
  { id: 'completed',   label: 'مكتمل'        },
  { id: 'blocked',     label: 'محظورة'       },
];

const INTENT_ITEMS: ComboboxItem[] = [
  { id: 'informational',  label: 'معلوماتية'   },
  { id: 'commercial',     label: 'تجارية'      },
  { id: 'transactional',  label: 'شرائية'      },
  { id: 'navigational',   label: 'تنقلية'      },
];

/* ── Link list field ──────────────────────────────────────────────────── */
function LinkList({
  label, items, onAdd, onRemove, placeholder,
}: {
  label: string;
  items: string[];
  onAdd:    (v: string) => void;
  onRemove: (i: number) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <p className={LABEL}>{label}</p>
      {items.map((link, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <XIcon size={13} />
          </button>
          <input
            type="text"
            value={link}
            onChange={e => {
              const next = [...items];
              next[i] = e.target.value;
              /* bubble change through parent's list */
              onAdd(e.target.value);
              onRemove(i);
            }}
            placeholder={placeholder}
            className={INPUT}
            dir="ltr"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onAdd('')}
        className="flex items-center gap-1.5 text-xs text-[#709028] dark:text-[#A0CD39]
                   hover:underline"
      >
        <Plus size={13} />
        {label === 'الروابط الداخلية' ? '/page-path' : 'https://'}
      </button>
    </div>
  );
}

/* ── Meta counter input ───────────────────────────────────────────────── */
function MetaInput({
  label, value, onChange, max, placeholder, multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  placeholder?: string;
  multiline?: boolean;
}) {
  const len = value.length;
  const cls = `${INPUT}${multiline ? ' resize-none' : ''}`;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[11px] font-mono ${len > max ? 'text-red-500' : 'text-gray-400'}`}>
          {len}/{max}
        </span>
        <p className={LABEL.replace('mb-1 ', '')}>{label}</p>
      </div>
      {multiline ? (
        <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

/* ── KD bar ───────────────────────────────────────────────────────────── */
function KdBar({ kd }: { kd: number }) {
  const clamped = Math.min(100, Math.max(0, kd));
  const color = clamped < 30 ? 'bg-emerald-500' : clamped < 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex justify-between text-[11px] text-gray-400">
        <span>{clamped}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

/* ── Props ────────────────────────────────────────────────────────────── */
export interface SeoTaskInfoTabProps {
  task:              SeoTaskFull;
  isAr:              boolean;
  /* base fields */
  description:       string;  setDescription:  (v: string) => void;
  taskType:          string;  setTaskType:      (v: string) => void;
  priority:          string;  setPriority:      (v: string) => void;
  status:            string;  setStatus:        (v: string) => void;
  startDate:         string;  setStartDate:     (v: string) => void;
  dueDate:           string;  setDueDate:       (v: string) => void;
  /* SEO fields */
  targetUrl:         string;  setTargetUrl:        (v: string) => void;
  targetKeyword:     string;  setTargetKeyword:    (v: string) => void;
  searchIntent:      string;  setSearchIntent:     (v: string) => void;
  searchVolume:      string;  setSearchVolume:     (v: string) => void;
  keywordDifficulty: string;  setKeywordDifficulty:(v: string) => void;
  metaTitle:         string;  setMetaTitle:        (v: string) => void;
  metaDescription:   string;  setMetaDescription:  (v: string) => void;
  siteLinks:         string[]; setSiteLinks:       (v: string[]) => void;
  referenceLinks:    string[]; setReferenceLinks:  (v: string[]) => void;
  notes:             string;  setNotes:            (v: string) => void;
  /* actions */
  isSaving:          boolean;
  onEdit:            () => void;
  onDelete:          () => void;
  assigneeItems:     ComboboxItem[];
  assigneeId:        string;  setAssigneeId:    (v: string) => void;
}

/* ── Component ────────────────────────────────────────────────────────── */
export function SeoTaskInfoTab({
  task, isAr,
  description, setDescription,
  taskType, setTaskType,
  priority, setPriority,
  status, setStatus,
  startDate, setStartDate,
  dueDate, setDueDate,
  targetUrl, setTargetUrl,
  targetKeyword, setTargetKeyword,
  searchIntent, setSearchIntent,
  searchVolume, setSearchVolume,
  keywordDifficulty, setKeywordDifficulty,
  metaTitle, setMetaTitle,
  metaDescription, setMetaDescription,
  siteLinks, setSiteLinks,
  referenceLinks, setReferenceLinks,
  notes, setNotes,
  isSaving, onEdit, onDelete,
  assigneeItems, assigneeId, setAssigneeId,
}: SeoTaskInfoTabProps) {
  const kd = Number(keywordDifficulty) || 0;

  function addSiteLink(v: string)       { setSiteLinks([...siteLinks, v]);         }
  function removeSiteLink(i: number)    { setSiteLinks(siteLinks.filter((_,x)=>x!==i)); }
  function addRefLink(v: string)        { setReferenceLinks([...referenceLinks, v]);}
  function removeRefLink(i: number)     { setReferenceLinks(referenceLinks.filter((_,x)=>x!==i)); }

  return (
    <div className="space-y-5 pb-4">

      {/* ── Title (read-only headline) ── */}
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 text-end">
        {task.title}
      </h2>

      {/* ── Description ── */}
      <div className="space-y-1">
        <p className={LABEL}>{isAr ? 'الوصف التفصيلي' : 'Description'}</p>
        <textarea
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={isAr ? 'وصف تفصيلي للمهمة...' : 'Task description...'}
          className={`${INPUT} resize-none`}
        />
      </div>

      {/* ── Phase row ── */}
      <div className={ROW}>
        <div className="w-44 shrink-0">
          <Combobox
            items={PHASE_ITEMS}
            value={taskType}
            onChange={setTaskType}
            placeholder={isAr ? 'اختر المرحلة' : 'Select phase'}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
          {isAr ? 'المرحلة' : 'Phase'}
        </p>
      </div>

      {/* ── Assignee row ── */}
      <div className={ROW}>
        <div className="w-44 shrink-0">
          <Combobox
            items={assigneeItems}
            value={assigneeId}
            onChange={setAssigneeId}
            placeholder={isAr ? 'اختر المسؤول' : 'Select assignee'}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
          {isAr ? 'المسؤول عن التنفيذ' : 'Assignee'}
        </p>
      </div>

      {/* ── Created by ── */}
      {task.createdBy && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {task.createdBy.name}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {isAr ? 'تم الإنشاء بواسطة' : 'Created by'}
          </p>
        </div>
      )}

      {/* ── Dates ── */}
      <div className="flex items-center justify-between text-sm gap-4">
        <div className="text-start">
          <p className={LABEL}>{isAr ? 'تاريخ التسليم' : 'Due Date'}</p>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className={`${INPUT} w-auto`}
          />
        </div>
        <div className="text-end">
          <p className={LABEL}>{isAr ? 'تاريخ البداية' : 'Start Date'}</p>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className={`${INPUT} w-auto`}
          />
        </div>
      </div>

      {/* ── Priority + Status ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={LABEL}>{isAr ? 'الحالة' : 'Status'}</p>
          <Combobox
            items={STATUS_ITEMS}
            value={status}
            onChange={setStatus}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </div>
        <div>
          <p className={LABEL}>{isAr ? 'الأولوية' : 'Priority'}</p>
          <Combobox
            items={PRIORITY_ITEMS}
            value={priority}
            onChange={setPriority}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </div>
      </div>

      {/* ════════════ SEO Details ════════════ */}
      <div className="pt-1">
        <p className="text-sm font-semibold text-[#709028] dark:text-[#A0CD39] mb-4 text-end">
          {isAr ? 'تفاصيل SEO' : 'SEO Details'} ✦
        </p>

        <div className="space-y-4">

          {/* Target URL */}
          <div>
            <p className={LABEL}>{isAr ? 'الرابط المستهدف' : 'Target URL'}</p>
            <input
              type="url"
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              placeholder="https://example.com/page"
              className={INPUT}
              dir="ltr"
            />
          </div>

          {/* Keyword + Search Intent */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={LABEL}>{isAr ? 'نية البحث' : 'Search Intent'}</p>
              <Combobox
                items={INTENT_ITEMS}
                value={searchIntent}
                onChange={setSearchIntent}
                placeholder={isAr ? 'اختر' : 'Select'}
                searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
                noResultsText={isAr ? 'لا نتائج' : 'No results'}
              />
            </div>
            <div>
              <p className={LABEL}>{isAr ? 'الكلمة المفتاحية المستهدفة' : 'Target Keyword'}</p>
              <input
                type="text"
                value={targetKeyword}
                onChange={e => setTargetKeyword(e.target.value)}
                placeholder={isAr ? 'شركة برمجة' : 'keyword'}
                className={INPUT}
              />
            </div>
          </div>

          {/* Search Volume + KD */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={LABEL}>{isAr ? 'صعوبة الكلمة (KD)' : 'Keyword Difficulty'}</p>
              <input
                type="number"
                min="0"
                max="100"
                value={keywordDifficulty}
                onChange={e => setKeywordDifficulty(e.target.value)}
                placeholder="52"
                className={INPUT}
              />
              {kd > 0 && <KdBar kd={kd} />}
            </div>
            <div>
              <p className={LABEL}>{isAr ? 'حجم البحث (شهرياً)' : 'Search Volume / mo'}</p>
              <input
                type="number"
                min="0"
                value={searchVolume}
                onChange={e => setSearchVolume(e.target.value)}
                placeholder="1900"
                className={INPUT}
              />
            </div>
          </div>

          {/* Meta Title */}
          <MetaInput
            label={isAr ? 'عنوان الميتا (Meta Title)' : 'Meta Title'}
            value={metaTitle}
            onChange={setMetaTitle}
            max={60}
            placeholder={isAr ? 'عنوان فعّال لمحركات البحث' : 'SEO-optimised title'}
          />

          {/* Meta Description */}
          <MetaInput
            label={isAr ? 'وصف الميتا (Meta Description)' : 'Meta Description'}
            value={metaDescription}
            onChange={setMetaDescription}
            max={160}
            multiline
            placeholder={isAr ? 'وصف موجز يظهر في نتائج البحث' : 'Brief description shown in search results'}
          />

          {/* Internal Links */}
          <LinkList
            label={isAr ? 'الروابط الداخلية' : 'Internal Links'}
            items={siteLinks}
            onAdd={addSiteLink}
            onRemove={removeSiteLink}
            placeholder="/page-path"
          />

          {/* External Links */}
          <LinkList
            label={isAr ? 'الروابط الخارجية' : 'External Links'}
            items={referenceLinks}
            onAdd={addRefLink}
            onRemove={removeRefLink}
            placeholder="https://authority-site.com/ref"
          />

          {/* SEO Notes */}
          <div>
            <p className={LABEL}>{isAr ? 'ملاحظات SEO' : 'SEO Notes'}</p>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={isAr ? 'ملاحظات الأخصائي حول هذه المهمة...' : 'Specialist notes...'}
              className={`${INPUT} resize-none`}
            />
          </div>

        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="danger"
          size="sm"
          startIcon={<Trash2 size={14} />}
          onClick={onDelete}
        >
          {isAr ? 'حذف المهمة' : 'Delete Task'}
        </Button>
        <Button
          variant="primary"
          size="sm"
          startIcon={<Pencil size={14} />}
          disabled={isSaving}
          onClick={onEdit}
        >
          {isSaving
            ? (isAr ? 'جاري الحفظ...' : 'Saving…')
            : (isAr ? 'تعديل المهمة' : 'Update Task')}
        </Button>
      </div>
    </div>
  );
}
