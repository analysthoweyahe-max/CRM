import { FolderKanban } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import type { EmpProject } from '../types/dashboard.types';

interface Props {
  projects: EmpProject[];
  isAr:     boolean;
}

export function MyProjectsSection({ projects, isAr }: Props) {
  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {isAr ? 'مشاريعي' : 'My Projects'}
      </h2>

      {projects.length === 0 ? (
        <div className="py-12 text-center">
          <FolderKanban size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {isAr ? 'لا توجد مشاريع مسندة إليك حاليًا' : 'You have no assigned projects yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <a
              key={project.id}
              href={project.tasksUrl ?? undefined}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl
                         bg-white dark:bg-gray-800
                         border border-gray-100 dark:border-gray-700/40
                         hover:border-brand-300 dark:hover:border-brand-700/60 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full bg-[#A0CD39] shrink-0" />
                <p className="text-sm text-gray-800 dark:text-gray-100 truncate">{project.name}</p>
              </div>
              {project.statusLabel && (
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{project.statusLabel}</span>
              )}
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}
