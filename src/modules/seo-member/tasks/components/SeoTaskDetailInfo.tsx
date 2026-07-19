import { Badge }    from '@/shared/components/ui/Badge';
import { RichTextView } from '@/shared/components/form/RichTextView';
import { ImportantLinksDisplay } from '@/shared/components/form/ImportantLinksDisplay';
import { fmtDeadline } from '@/modules/employee/tasks/components/useTasksTable';
import { useSeoTaskLookups } from '@/modules/seo-leader/campaigns/hooks/useSeoTaskLookups';
import type { SeoTaskDetail } from '../types/seoTaskDetail.types';
import type { SeoTaskStatus } from '../types/seoTask.types';

interface Props {
  task:           SeoTaskDetail | undefined;
  isLoading:      boolean;
  isAr:           boolean;
  onStatusChange?: (status: SeoTaskStatus) => void;
  canEdit:        boolean;
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

export function SeoTaskDetailInfo({ task, isLoading, isAr, onStatusChange, canEdit }: Props) {
  const { statusOptions } = useSeoTaskLookups(isAr);
  if (isLoading || !task) return <Skeleton />;

  const priority  = PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.normal;
  const phaseColor = task.phase ? (PHASE_COLORS[task.phase] ?? 'bg-gray-100 text-gray-600') : '';
  const dueDateFmt = task.dueDate ? fmtDeadline(task.dueDate, isAr) : '—';
  const startDateFmt = task.startDate ? fmtDeadline(task.startDate, isAr) : '—';

  return (
    <div className="space-y-0" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Basic info ─────────────────────────────────────────────────────── */}
      <InfoRow label={isAr ? 'العنوان' : 'Title'}>
        <span className="font-medium">{task.title}</span>
      </InfoRow>

      {task.description && (
        <InfoRow label={isAr ? 'الوصف التفصيلي' : 'Description'}>
          <RichTextView html={task.description} className="text-gray-700 dark:text-gray-300" />
        </InfoRow>
      )}

      {!!task.importantLinks?.length && (
        <InfoRow label={isAr ? 'روابط هامة' : 'Important Links'}>
          <ImportantLinksDisplay links={task.importantLinks} isAr={isAr} showLabel={false} />
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
        {canEdit ? (
          <select
            value={task.status}
            onChange={e => onStatusChange?.(e.target.value as SeoTaskStatus)}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {statusOptions.map(opt => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <Badge
            label={statusOptions.find(o => o.key === task.status)?.label ?? task.status}
            variant="gray"
          />
        )}
      </InfoRow>

    </div>
  );
}
