import { Plus, FolderKanban } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import type { PmProjectSectionVM } from '../hooks/usePmDashboard';
import { ProjectCard } from './ProjectCard';

interface Props {
  sections:         PmProjectSectionVM[];
  activeKey:        string | undefined;
  onActiveKeyChange: (key: string) => void;
  isAr:             boolean;
  onNewProject:     () => void;
}

export function ProjectsSection({ sections, activeKey, onActiveKeyChange, isAr, onNewProject }: Props) {
  const active  = sections.find(s => s.key === activeKey) ?? sections[0];
  const visible = active?.projects ?? [];

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-end px-5 pt-5 pb-0">
        <Button variant="primary" onClick={onNewProject} startIcon={<Plus size={16} />}>
          {isAr ? 'مشروع جديد' : 'New Project'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-end gap-1 px-5 mt-4 border-b border-gray-100 dark:border-gray-700/60 overflow-x-auto">
        {sections.map(section => {
          const isActive = active?.key === section.key;
          return (
            <button
              key={section.key}
              type="button"
              onClick={() => onActiveKeyChange(section.key)}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium
                          border-b-2 transition-colors duration-150 whitespace-nowrap
                          ${isActive
                            ? 'border-[#A0CD39] text-[#709028] dark:text-[#A0CD39]'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              {isAr ? section.labelAr : section.labelEn}
              <span className={`min-w-5 h-5 px-1 rounded-full text-[11px] font-bold
                                flex items-center justify-center
                                ${isActive
                                  ? 'bg-[#A0CD39] text-gray-900'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                {section.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="p-5">
        {visible.length === 0 ? (
          <div className="py-16 text-center">
            <FolderKanban size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {isAr ? 'لا توجد مشاريع في هذه الحالة' : 'No projects in this status'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visible.map(project => (
              <ProjectCard key={project.id} project={project} isAr={isAr} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
