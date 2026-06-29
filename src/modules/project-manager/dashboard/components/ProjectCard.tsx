import { useNavigate } from 'react-router-dom';
import { Card }        from '@/shared/components/ui/Card';
import { Button }      from '@/shared/components/ui/Button';
import { ROUTES }      from '@/app/router/routes';
import type { Project, ProjectStatus } from '../../projects/types/project.types';
import { TeamAvatars } from '@/shared/components/ui/TeamAvatars';

const STATUS_LABEL: Record<ProjectStatus, { ar: string; en: string; dot: string }> = {
  inProgress: { ar: 'قيد التنفيذ', en: 'In Progress', dot: 'bg-[#A0CD39]'    },
  completed:  { ar: 'مكتمل',       en: 'Completed',   dot: 'bg-emerald-500'   },
  paused:     { ar: 'متوقف',       en: 'Paused',      dot: 'bg-amber-500'     },
  notStarted: { ar: 'لم يبدأ',     en: 'Not Started', dot: 'bg-gray-400'      },
};

const STATUS_BADGE: Record<ProjectStatus, string> = {
  inProgress: 'bg-[#D8EBAE] text-[#709028] dark:bg-[#A0CD39]/20 dark:text-[#A0CD39]',
  completed:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  paused:     'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
  notStarted: 'bg-gray-100   text-gray-500   dark:bg-gray-700      dark:text-gray-400',
};

interface Props {
  project: Project;
  isAr:    boolean;
}

export function ProjectCard({ project, isAr }: Props) {
  const navigate = useNavigate();
  const label    = STATUS_LABEL[project.status];
  const badge    = STATUS_BADGE[project.status];

  return (
    <Card className="p-5 flex flex-col gap-4 transition-all duration-200
                     hover:border-[#A0CD39] hover:shadow-lg">

      {/* Title + category */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug">
          {isAr ? project.nameAr : project.nameEn}
        </h3>
        <span className="shrink-0 text-xs px-2.5 py-1 rounded-full border
                         border-gray-200 dark:border-gray-600
                         text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {isAr ? project.categoryAr : project.categoryEn}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{isAr ? 'نسبة الإنجاز' : 'Progress'}</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">{project.progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#A0CD39] transition-all duration-500"
            style={{ width: `${project.progress}%` }}
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
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${label.dot}`} />
            {isAr ? label.ar : label.en}
          </span>
        </div>
        <TeamAvatars team={project.team} />
      </div>

      {/* Details button */}
      <Button
        variant="secondary"
        fullWidth
        onClick={() => navigate(ROUTES.PROJECT_MANAGER.DETAILS(project.id))}
        className="hover:border-[#A0CD39] hover:text-[#709028] dark:hover:text-[#A0CD39]"
      >
        {isAr ? 'تفاصيل المشروع' : 'View Details'}
      </Button>
    </Card>
  );
}
