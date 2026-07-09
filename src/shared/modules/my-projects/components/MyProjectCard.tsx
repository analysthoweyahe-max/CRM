import { type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CheckSquare, FolderOpen } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { formatDateShort } from '@/shared/utils/date.utils';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { ensureHttpUrl } from '@/shared/utils';
import {
  STATUS_BADGE,
  STATUS_BADGE_FALLBACK,
  calcProgress,
  formatContractMonths,
} from '../utils/myProjects.utils';
import type { MyProjectsPageConfig } from '../types/myProjects.types';
import type { DashboardProjectCard, PmProject, SeoProject } from '../types/myProjects.types';

type CardProject =
  | { kind: 'pm'; project: PmProject }
  | { kind: 'seo'; project: SeoProject }
  | { kind: 'dashboard'; project: DashboardProjectCard };

interface Props {
  item:    CardProject;
  config:  MyProjectsPageConfig;
  isAr:    boolean;
}

export function MyProjectCard({ item, config, isAr }: Props) {
  const navigate = useNavigate();

  const p = item.project;
  const statusKey = p.status ?? 'not_started';
  const badgeCfg  = STATUS_BADGE[statusKey] ?? STATUS_BADGE_FALLBACK;

  const name         = p.name;
  const statusLabel  = p.statusLabel;
  const isDraft      = 'isDraft' in p ? p.isDraft : false;

  let typeLabel: string | null = null;
  let dateStart: string | null = null;
  let dateEnd: string | null = null;
  let contractMonths: number | null = null;
  let managerName: string | null = null;
  let githubLink: string | null = null;
  let driveLink: string | null = null;
  let progress: number | null = null;
  let tasksDone: number | undefined;
  let tasksTotal: number | undefined;

  if (item.kind === 'pm') {
    const pm = item.project;
    typeLabel       = pm.projectTypeLabel;
    dateStart       = pm.startDate;
    dateEnd         = pm.deadline;
    contractMonths  = pm.contractDurationMonths;
    managerName     = pm.manager?.name ?? null;
    githubLink      = pm.githubLink;
    driveLink       = pm.driveLink;
    progress        = calcProgress(pm.tasksCompleted, pm.tasksTotal, pm.progressPercent);
    tasksDone       = pm.tasksCompleted;
    tasksTotal      = pm.tasksTotal;
  } else if (item.kind === 'seo') {
    const seo = item.project;
    typeLabel       = seo.campaignTypeLabel;
    dateStart       = seo.startDate;
    dateEnd         = seo.expectedEndDate;
    contractMonths  = seo.contractDurationMonths;
    githubLink      = seo.githubLink;
    driveLink       = seo.driveLink;
    progress        = calcProgress(seo.tasksCompleted, seo.tasksAssigned, seo.progressPercent);
    tasksDone       = seo.tasksCompleted;
    tasksTotal      = seo.tasksAssigned;
  } else {
    const dash = item.project;
    typeLabel  = dash.clientName ?? null;
    progress   = calcProgress(dash.tasksCompleted, dash.tasksAssigned, dash.progressPercent);
    tasksDone  = dash.tasksCompleted;
    tasksTotal = dash.tasksAssigned;
  }

  const contractLabel = formatContractMonths(contractMonths, isAr);

  const goWorkspace = () => navigate(config.workspacePath(p.id));

  const goTasks = (e: MouseEvent) => {
    e.stopPropagation();
    navigate(config.tasksPath(p.id));
  };

  return (
    <Card
      onClick={goWorkspace}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goWorkspace(); } }}
      className="p-5 flex flex-col gap-4 transition-all duration-200 cursor-pointer
                 border-2! border-[#D8EBAE]! dark:border-[#A0CD39]/30!
                 hover:border-[#A0CD39]! hover:shadow-lg
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A0CD39]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug truncate">
            {name}
          </h3>
          {githubLink && (
            <a
              href={ensureHttpUrl(githubLink)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={isAr ? 'رابط GitHub' : 'GitHub link'}
              className="shrink-0 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <span className="text-xs font-mono">GH</span>
            </a>
          )}
          {driveLink && (
            <a
              href={ensureHttpUrl(driveLink)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={isAr ? 'رابط Google Drive' : 'Google Drive link'}
              className="shrink-0 text-gray-400 hover:text-[#709028] dark:hover:text-[#A0CD39] transition-colors"
            >
              <FolderOpen size={16} />
            </a>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 flex-wrap justify-end">
          {isDraft && (
            <span className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium
                             bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {isAr ? 'مسودة' : 'Draft'}
            </span>
          )}
          {typeLabel && (
            <span className="text-xs px-2.5 py-1 rounded-full border
                             border-gray-200 dark:border-gray-600
                             text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {translateProjectLookup('', typeLabel, isAr)}
            </span>
          )}
        </div>
      </div>

      {(dateStart || dateEnd) && (
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
          <CalendarDays size={13} className="shrink-0" />
          <span>{formatDateShort(dateStart, isAr)}</span>
          <span className="text-gray-300 dark:text-gray-600">→</span>
          <span>{formatDateShort(dateEnd, isAr)}</span>
          {contractLabel && (
            <span className="text-gray-400 dark:text-gray-500">· {contractLabel}</span>
          )}
        </div>
      )}

      {progress != null && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{isAr ? 'نسبة الإنجاز' : 'Progress'}</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#A0CD39] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {tasksTotal != null && tasksTotal > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isAr ? 'المهام:' : 'Tasks:'}
              <span className="ms-1 font-semibold text-gray-800 dark:text-gray-100">
                {tasksDone ?? 0}/{tasksTotal}
              </span>
            </span>
          )}
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${badgeCfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badgeCfg.dot}`} />
            {translateProjectLookup(statusKey, statusLabel, isAr)}
          </span>
          {config.showManager && managerName && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {isAr ? 'المدير:' : 'Manager:'}{' '}
              <span className="font-medium text-gray-600 dark:text-gray-300">{managerName}</span>
            </span>
          )}
        </div>

        {config.showTasksButton && (
          <Button
            variant="secondary"
            size="sm"
            startIcon={<CheckSquare size={14} />}
            onClick={goTasks}
          >
            {isAr ? 'المهام' : 'Tasks'}
          </Button>
        )}
      </div>
    </Card>
  );
}
