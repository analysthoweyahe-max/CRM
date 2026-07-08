import { useNavigate } from 'react-router-dom';
import { GitBranch }   from 'lucide-react';
import { Card }        from '@/shared/components/ui/Card';
import { Button }      from '@/shared/components/ui/Button';
import { ROUTES }      from '@/app/router/routes';
import type { PmProjectVM } from '../hooks/usePmDashboard';
import type { PmProjectStatusKey } from '../types/dashboard.types';
import { TeamAvatars } from '@/shared/components/ui/TeamAvatars';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';

const STATUS_DOT: Record<PmProjectStatusKey, string> = {
  in_progress: 'bg-[#A0CD39]',
  completed:   'bg-emerald-500',
  on_hold:     'bg-amber-500',
  not_started: 'bg-gray-400',
};

const STATUS_BADGE: Record<PmProjectStatusKey, string> = {
  in_progress: 'bg-[#D8EBAE] text-[#709028] dark:bg-[#A0CD39]/20 dark:text-[#A0CD39]',
  completed:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  on_hold:     'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
  not_started: 'bg-gray-100   text-gray-500   dark:bg-gray-700      dark:text-gray-400',
};

const STATUS_LABEL_EN: Record<PmProjectStatusKey, string> = {
  in_progress: 'In Progress',
  completed:   'Completed',
  on_hold:     'On Hold',
  not_started: 'Not Started',
};

interface Props {
  project: PmProjectVM;
  isAr:    boolean;
}

export function ProjectCard({ project, isAr }: Props) {
  const navigate = useNavigate();

  return (
    <Card className="p-5 flex flex-col gap-4 transition-all duration-200
                     border-2! border-[#D8EBAE]! dark:border-[#A0CD39]/30!
                     hover:border-[#A0CD39]! hover:shadow-lg">

      {/* Title + category */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug">
            {project.name}
          </h3>
          {project.workspaceUrl && (
            <a
              href={project.workspaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={isAr ? 'رابط GitHub' : 'GitHub link'}
              className="shrink-0 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <GitBranch size={16} />
            </a>
          )}
        </div>
        <span className="shrink-0 text-xs px-2.5 py-1 rounded-full border
                         border-gray-200 dark:border-gray-600
                         text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {translateProjectLookup('', project.projectTypeLabel, isAr)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{isAr ? 'نسبة الإنجاز' : 'Progress'}</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">{project.progressPercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#A0CD39] transition-all duration-500"
            style={{ width: `${project.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span>
            {isAr ? 'المهام:' : 'Tasks:'}
            <span className="ms-1 font-semibold text-gray-800 dark:text-gray-100">
              {project.tasksCompleted}/{project.tasksTotal}
            </span>
          </span>
          <span>{isAr ? 'الحالة:' : 'Status:'}</span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[project.status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[project.status]}`} />
            {isAr
              ? translateProjectLookup(project.status, project.statusLabel, true)
              : STATUS_LABEL_EN[project.status]}
          </span>
        </div>
        <TeamAvatars team={project.team} />
      </div>

      {/* Details button */}
      <Button
        variant="secondary"
        fullWidth
        onClick={() => navigate(ROUTES.PROJECT_MANAGER.DETAILS(String(project.id)))}
        className="hover:border-[#A0CD39] hover:text-[#709028] dark:hover:text-[#A0CD39]"
      >
        {isAr ? 'تفاصيل المشروع' : 'View Details'}
      </Button>
    </Card>
  );
}
