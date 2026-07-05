import { ExternalLink, Link2, Plus, X, Search } from 'lucide-react';
import { Badge }    from '@/shared/components/ui/Badge';
import { fmtDeadline } from '@/modules/employee/tasks/components/useTasksTable';
import { useSeoTaskDetailInfo } from './useSeoTaskDetailInfo';
import type { SeoTaskDetail } from '../types/seoTaskDetail.types';
import type { SeoTaskStatus } from '../types/seoTask.types';

interface Props {
  task:           SeoTaskDetail | undefined;
  isLoading:      boolean;
  isAr:           boolean;
  onStatusChange?: (status: SeoTaskStatus) => void;
}

const PRIORITY_BADGE: Record<string, { ar: string; en: string; variant: 'error' | 'warning' | 'gray' }> = {
  high:   { ar: 'عالية',  en: 'High',   variant: 'error'   },
  normal: { ar: 'عادية',  en: 'Normal', variant: 'warning' },
  low:    { ar: 'منخفضة', en: 'Low',    variant: 'gray'    },
};

const PHASE_COLORS: Record<string, string> = {
  'بحث الكلمات المفتاحية': 'bg-blue-100 text-blue-700',
  'تحسين داخل الصفحة':      'bg-green-100 text-green-700',
  'SEO تقني':               'bg-purple-100 text-purple-700',
  'تحسين المحتوى':           'bg-yellow-100 text-yellow-700',
  'التقارير':                'bg-gray-100 text-gray-600',
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
      <div className="text-sm text-gray-800 dark:text-gray-100 flex-1 min-w-0">{children}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 shrink-0 w-36 text-start">{label}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 py-3 border-b border-gray-100">
          <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded" />
          <div className="w-28 h-4 bg-gray-200 dark:bg-gray-600 rounded shrink-0" />
        </div>
      ))}
    </div>
  );
}

function LinkList({
  links, newLink, setNewLink, onAdd, onRemove, isAr, placeholder,
}: {
  links: string[]; newLink: string; setNewLink: (v: string) => void;
  onAdd: () => void; onRemove: (i: number) => void;
  isAr: boolean; placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {links.map((link, i) => (
        <div key={i} className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
          <button
            onClick={() => onRemove(i)}
            className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
          >
            <X size={13} />
          </button>
          <Link2 size={13} className="text-gray-400 shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{link}</span>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          value={newLink}
          onChange={e => setNewLink(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onAdd()}
          placeholder={placeholder}
          className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <button
          onClick={onAdd}
          disabled={!newLink.trim()}
          className="text-brand-600 dark:text-brand-400 hover:text-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export function SeoTaskDetailInfo({ task, isLoading, isAr, onStatusChange }: Props) {
  const {
    status, setStatus,
    metaTitle, setMetaTitle,
    metaDescription, setMetaDescription,
    notes, setNotes,
    siteLinks, newSiteLink, setNewSiteLink, addSiteLink, removeSiteLink,
    referenceLinks, newRefLink, setNewRefLink, addRefLink, removeRefLink,
  } = useSeoTaskDetailInfo(task);

  if (isLoading || !task) return <Skeleton />;

  const priority  = PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.normal;
  const phaseColor = task.phase ? (PHASE_COLORS[task.phase] ?? 'bg-gray-100 text-gray-600') : '';
  const dueDateFmt = task.dueDate ? fmtDeadline(task.dueDate, isAr) : '—';
  const startDateFmt = task.startDate ? fmtDeadline(task.startDate, isAr) : '—';
  const kd = task.keywordDifficulty ?? 0;

  const STATUS_OPTIONS: { value: SeoTaskStatus; arLabel: string; enLabel: string }[] = [
    { value: 'pending',    arLabel: 'لم تبدأ بعد', enLabel: 'Not Started' },
    { value: 'inProgress', arLabel: 'قيد التنفيذ', enLabel: 'In Progress' },
    { value: 'inReview',   arLabel: 'قيد المراجعة', enLabel: 'In Review'  },
    { value: 'completed',  arLabel: 'مكتملة',       enLabel: 'Completed'  },
    { value: 'blocked',    arLabel: 'محظورة',        enLabel: 'Blocked'    },
  ];

  return (
    <div className="space-y-0">

      {/* ── Basic info ─────────────────────────────────────────────────────── */}
      <InfoRow label={isAr ? 'العنوان' : 'Title'}>
        <span className="font-medium">{task.title}</span>
      </InfoRow>

      {task.description && (
        <InfoRow label={isAr ? 'الوصف التفصيلي' : 'Description'}>
          <p className="leading-relaxed text-gray-700 dark:text-gray-300">{task.description}</p>
        </InfoRow>
      )}

      {task.phase && (
        <InfoRow label={isAr ? 'المرحلة' : 'Phase'}>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${phaseColor}`}>
            {task.phase}
          </span>
        </InfoRow>
      )}

      {task.assignees.length > 0 && (
        <InfoRow label={isAr ? 'المسؤول عن التنفيذ' : 'Assignee'}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full ${task.assignees[0].avatarBg} flex items-center justify-center text-white text-xs font-bold`}>
              {task.assignees[0].initials}
            </div>
            <span>{task.assignees[0].name}</span>
          </div>
        </InfoRow>
      )}

      <InfoRow label={isAr ? 'تم الإنشاء بواسطة' : 'Created by'}>
        {task.createdBy?.name ?? '—'}
      </InfoRow>

      <InfoRow label={isAr ? 'تاريخ البداية' : 'Start date'}>
        {startDateFmt}
      </InfoRow>

      <InfoRow label={isAr ? 'تاريخ التسليم' : 'Due date'}>
        {dueDateFmt}
      </InfoRow>

      <InfoRow label={isAr ? 'الأولوية' : 'Priority'}>
        <Badge
          label={isAr ? priority.ar : priority.en}
          variant={priority.variant}
          icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}
        />
      </InfoRow>

      <InfoRow label={isAr ? 'الحالة' : 'Status'}>
        <select
          value={status}
          onChange={e => {
            const next = e.target.value as SeoTaskStatus;
            setStatus(next);
            onStatusChange?.(next);
          }}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {isAr ? opt.arLabel : opt.enLabel}
            </option>
          ))}
        </select>
      </InfoRow>

      {/* ── SEO details ────────────────────────────────────────────────────── */}
      <div className="pt-5 pb-3 flex items-center gap-2">
        <Search size={15} className="text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {isAr ? 'تفاصيل SEO' : 'SEO Details'}
        </h3>
      </div>

      {task.targetUrl && (
        <InfoRow label={isAr ? 'الرابط المستهدف' : 'Target URL'}>
          <a
            href={task.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 hover:underline truncate"
          >
            <ExternalLink size={13} />
            {task.targetUrl}
          </a>
        </InfoRow>
      )}

      {task.targetKeyword && (
        <InfoRow label={isAr ? 'الكلمة المفتاحية المستهدفة' : 'Target Keyword'}>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
            {task.targetKeyword}
          </span>
        </InfoRow>
      )}

      {task.searchIntent && (
        <InfoRow label={isAr ? 'بيئة البحث' : 'Search Intent'}>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            {task.searchIntent}
          </span>
        </InfoRow>
      )}

      {task.searchVolume !== null && (
        <InfoRow label={isAr ? 'حجم البحث (شهرياً)' : 'Search Volume (monthly)'}>
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            {task.searchVolume.toLocaleString('ar-EG')}
          </span>
        </InfoRow>
      )}

      {task.keywordDifficulty !== null && (
        <InfoRow label={isAr ? 'صعوبة الكلمة (KD)' : 'Keyword Difficulty'}>
          <div className="space-y-1.5 w-full max-w-xs">
            <div className="flex justify-between text-xs text-gray-500">
              <span className={kd >= 60 ? 'text-red-500' : kd >= 30 ? 'text-yellow-600' : 'text-green-600'}>
                {kd}/100
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${kd >= 60 ? 'bg-red-500' : kd >= 30 ? 'bg-yellow-400' : 'bg-green-500'}`}
                style={{ width: `${kd}%` }}
              />
            </div>
          </div>
        </InfoRow>
      )}

      {/* Meta Title */}
      <InfoRow label={isAr ? 'عنوان الميتا (Meta Title)' : 'Meta Title'}>
        <div className="space-y-1 w-full">
          <div className="flex justify-start">
            <span className={`text-xs ${metaTitle.length > 60 ? 'text-red-500' : 'text-orange-500'}`}>
              {metaTitle.length}/60
            </span>
          </div>
          <input
            value={metaTitle}
            onChange={e => setMetaTitle(e.target.value)}
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
      </InfoRow>

      {/* Meta Description */}
      <InfoRow label={isAr ? 'وصف الميتا (Meta Description)' : 'Meta Description'}>
        <div className="space-y-1 w-full">
          <div className="flex justify-start">
            <span className={`text-xs ${metaDescription.length > 160 ? 'text-red-500' : 'text-orange-500'}`}>
              {metaDescription.length}/160
            </span>
          </div>
          <textarea
            value={metaDescription}
            onChange={e => setMetaDescription(e.target.value)}
            rows={3}
            placeholder={isAr ? 'وصف موجز يظهر في نتائج البحث...' : 'Brief description shown in search results...'}
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
          />
        </div>
      </InfoRow>

      {/* Internal links */}
      <InfoRow label={isAr ? 'الروابط الداخلية' : 'Internal Links'}>
        <LinkList
          links={siteLinks}
          newLink={newSiteLink}
          setNewLink={setNewSiteLink}
          onAdd={addSiteLink}
          onRemove={removeSiteLink}
          isAr={isAr}
          placeholder={isAr ? '/مسار-الصفحة' : '/page-path'}
        />
      </InfoRow>

      {/* External links */}
      <InfoRow label={isAr ? 'الروابط الخارجية' : 'External Links'}>
        <LinkList
          links={referenceLinks}
          newLink={newRefLink}
          setNewLink={setNewRefLink}
          onAdd={addRefLink}
          onRemove={removeRefLink}
          isAr={isAr}
          placeholder="https://..."
        />
      </InfoRow>

      {/* SEO Notes */}
      <InfoRow label={isAr ? 'ملاحظات SEO' : 'SEO Notes'}>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder={isAr ? 'ملاحظات الأخصائي حول هذه المهمة...' : 'Specialist notes about this task...'}
          className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
      </InfoRow>

    </div>
  );
}
