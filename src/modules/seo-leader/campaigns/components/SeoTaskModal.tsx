import { useRef }       from 'react';
import { X, Upload, Download, UserMinus, Users, Paperclip } from 'lucide-react';
import { Button }        from '@/shared/components/ui/Button';
import { Combobox }      from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { useSeoTaskModal }   from './useSeoTaskModal';
import type { SeoTaskTab }   from './SeoTaskModal.types';

/* ── Style tokens ────────────────────────────────────────────────────── */
const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

/* ── Lookup data ─────────────────────────────────────────────────────── */
const PRIORITY_ITEMS: ComboboxItem[] = [
  { id: 'high',   label: 'عالية'   },
  { id: 'medium', label: 'متوسطة' },
  { id: 'low',    label: 'منخفضة' },
];

const STATUS_ITEMS: ComboboxItem[] = [
  { id: 'pending',     label: 'قيد الانتظار' },
  { id: 'in_progress', label: 'جارية'         },
  { id: 'in_review',   label: 'مراجعة'        },
  { id: 'completed',   label: 'مكتملة'        },
];

const STAGE_ITEMS: ComboboxItem[] = [
  { id: 'keyword_research',     label: 'بحث الكلمات المفتاحية' },
  { id: 'content_optimization', label: 'تحسين المحتوى'          },
  { id: 'link_building',        label: 'بناء الروابط'           },
  { id: 'competitor_analysis',  label: 'تحليل المنافسين'         },
  { id: 'technical_seo',        label: 'تحسين تقني'             },
  { id: 'on_page_seo',          label: 'تحسين على الصفحة'        },
  { id: 'off_page_seo',         label: 'تحسين خارج الصفحة'       },
  { id: 'reporting',            label: 'التقارير والتحليل'       },
];

const TABS: { key: SeoTaskTab; ar: string; en: string; }[] = [
  { key: 'info',        ar: 'المعلومات',  en: 'Info'        },
  { key: 'assignees',   ar: 'المسؤولون', en: 'Assignees'   },
  { key: 'attachments', ar: 'المرفقات',   en: 'Attachments' },
];

function getInitial(name: string) { return name ? name[0].toUpperCase() : '?'; }
const AVATAR_COLORS = ['bg-violet-500','bg-sky-500','bg-amber-500','bg-rose-500','bg-teal-500','bg-indigo-500'];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/* ── Props ───────────────────────────────────────────────────────────── */
interface Props {
  taskId:    string | null;
  projectId: string;
  onClose:   () => void;
  isAr:      boolean;
}

/* ── Component ───────────────────────────────────────────────────────── */
export function SeoTaskModal({ taskId, projectId, onClose, isAr }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const m       = useSeoTaskModal(projectId, taskId);

  if (!taskId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={[
          'fixed inset-y-0 z-50 flex flex-col w-full max-w-xl',
          'bg-white dark:bg-gray-800 shadow-2xl',
          isAr ? 'left-0' : 'right-0',
        ].join(' ')}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          {m.isLoading ? (
            <div className="h-5 w-48 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          ) : (
            <div className="min-w-0">
              <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                #{m.task?.id}
              </span>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate leading-snug">
                {m.task?.title}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <div className="flex items-end gap-1 px-6 border-b border-gray-100 dark:border-gray-700/60 shrink-0">
          {TABS.map(t => {
            const isActive = m.tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => m.setTab(t.key)}
                className={[
                  'px-3 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap',
                  isActive
                    ? 'border-[#A0CD39] text-[#709028] dark:text-[#A0CD39]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                ].join(' ')}
              >
                {isAr ? t.ar : t.en}
              </button>
            );
          })}
        </div>

        {/* ── Scrollable content ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {m.isLoading ? (
            <div className="p-6 space-y-4 animate-pulse">
              {[1,2,3,4].map(n => <div key={n} className="h-11 rounded-xl bg-gray-100 dark:bg-gray-700" />)}
            </div>
          ) : m.tab === 'info' ? (

            /* ══ INFO TAB ═══════════════════════════════════════════════ */
            <div className="p-6 space-y-4">

              {/* Title */}
              <div>
                <label className={LABEL}>
                  {isAr ? 'عنوان المهمة' : 'Task Title'}
                  <span className="text-red-500 ms-1">*</span>
                </label>
                <input
                  type="text"
                  value={m.title}
                  onChange={e => m.setTitle(e.target.value)}
                  className={INPUT}
                />
              </div>

              {/* Description */}
              <div>
                <label className={LABEL}>{isAr ? 'الوصف' : 'Description'}</label>
                <textarea
                  rows={3}
                  value={m.description}
                  onChange={e => m.setDescription(e.target.value)}
                  className={`${INPUT} resize-none`}
                />
              </div>

              {/* Status + Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>{isAr ? 'الحالة' : 'Status'}</label>
                  <Combobox
                    items={STATUS_ITEMS}
                    value={m.status}
                    onChange={m.setStatus}
                    searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
                    noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
                  />
                </div>
                <div>
                  <label className={LABEL}>{isAr ? 'الأولوية' : 'Priority'}</label>
                  <Combobox
                    items={PRIORITY_ITEMS}
                    value={m.priority}
                    onChange={m.setPriority}
                    searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
                    noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
                  />
                </div>
              </div>

              {/* Due Date + Est. Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>{isAr ? 'تاريخ التسليم' : 'Due Date'}</label>
                  <input
                    type="date"
                    value={m.dueDate}
                    onChange={e => m.setDueDate(e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>{isAr ? 'الساعات المقدّرة' : 'Est. Hours'}</label>
                  <input
                    type="number"
                    min="1"
                    value={m.estimatedHours}
                    onChange={e => m.setEstimatedHours(e.target.value)}
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
                  value={m.stage}
                  onChange={m.setStage}
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
                    <label className={LABEL}>{isAr ? 'الكلمة المفتاحية المستهدفة' : 'Target Keyword'}</label>
                    <input
                      type="text"
                      value={m.targetKeyword}
                      onChange={e => m.setTargetKeyword(e.target.value)}
                      placeholder={isAr ? 'مثال: خدمات تصميم مواقع' : 'e.g. web design services'}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>{isAr ? 'الرابط المستهدف' : 'Target URL'}</label>
                    <input
                      type="url"
                      value={m.targetUrl}
                      onChange={e => m.setTargetUrl(e.target.value)}
                      placeholder="https://"
                      className={INPUT}
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>

          ) : m.tab === 'assignees' ? (

            /* ══ ASSIGNEES TAB ══════════════════════════════════════════ */
            <div className="p-6">
              {(!m.task?.assignees || m.task.assignees.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 dark:text-gray-500">
                  <Users size={36} strokeWidth={1.2} />
                  <p className="text-sm">{isAr ? 'لا يوجد مسؤولون' : 'No assignees yet'}</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {m.task.assignees.map(a => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-700/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white ${avatarColor(a.name)}`}>
                          {getInitial(a.name)}
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {a.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => m.removeAssignee(a.id)}
                        disabled={m.isRemoving}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                        title={isAr ? 'إزالة' : 'Remove'}
                      >
                        <UserMinus size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          ) : (

            /* ══ ATTACHMENTS TAB ════════════════════════════════════════ */
            <div className="p-6 space-y-4">
              {/* Upload zone */}
              <div
                className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6
                           flex flex-col items-center gap-3 cursor-pointer
                           hover:border-[#A0CD39] hover:bg-[#D8EBAE]/10 dark:hover:bg-[#A0CD39]/5
                           transition-colors duration-150"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) m.uploadFile(file);
                }}
              >
                {m.isUploading ? (
                  <div className="flex items-center gap-2 text-sm text-[#709028] dark:text-[#A0CD39]">
                    <Upload size={18} className="animate-bounce" />
                    {isAr ? 'جاري الرفع...' : 'Uploading…'}
                  </div>
                ) : (
                  <>
                    <Paperclip size={22} className="text-gray-400 dark:text-gray-500" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      {isAr
                        ? 'اسحب ملفاتك هنا أو اضغط للاختيار'
                        : 'Drag files here or click to browse'}
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) { m.uploadFile(file); e.target.value = ''; }
                }}
              />

              {/* Attachment list */}
              {m.task?.attachments && m.task.attachments.length > 0 ? (
                <ul className="space-y-2">
                  {m.task.attachments.map(att => (
                    <li
                      key={att.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-700/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Paperclip size={15} className="text-gray-400 dark:text-gray-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{att.name}</p>
                          {att.size && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">{att.size}</p>
                          )}
                        </div>
                      </div>
                      {att.url && (
                        <a
                          href={att.url}
                          download={att.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE]/30 dark:hover:bg-[#A0CD39]/10 transition-colors shrink-0"
                        >
                          <Download size={15} />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                  {isAr ? 'لا توجد مرفقات' : 'No attachments yet'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer (Info tab only) ──────────────────────────────────── */}
        {m.tab === 'info' && !m.isLoading && (
          <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <Button variant="ghost" onClick={onClose}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              disabled={!m.title.trim() || m.isSaving}
              onClick={m.handleSave}
            >
              {m.isSaving
                ? (isAr ? 'جاري الحفظ...' : 'Saving…')
                : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
