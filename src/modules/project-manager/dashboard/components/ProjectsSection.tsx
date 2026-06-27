import { useState } from 'react';
import { Plus, FolderKanban, Archive } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import type { Project, ProjectStatus } from '../../projects/types/project.types';
import { ProjectCard } from './ProjectCard';

type TabKey = ProjectStatus | 'archived';

const TABS: { key: TabKey; labelAr: string; labelEn: string }[] = [
  { key: 'inProgress', labelAr: 'قيد التنفيذ', labelEn: 'In Progress' },
  { key: 'completed',  labelAr: 'مكتمل',       labelEn: 'Completed'  },
  { key: 'paused',     labelAr: 'متوقف',       labelEn: 'Paused'     },
  { key: 'notStarted', labelAr: 'لم يبدأ',     labelEn: 'Not Started' },
  { key: 'archived',   labelAr: 'الأرشيف',     labelEn: 'Archive'    },
];

interface Props {
  projects:     Project[];
  isAr:         boolean;
  onNewProject: () => void;
}

export function ProjectsSection({ projects, isAr, onNewProject }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('inProgress');

  const active   = projects.filter(p => !p.isArchived);
  const archived = projects.filter(p => p.isArchived);

  function getCount(key: TabKey) {
    if (key === 'archived') return archived.length;
    return active.filter(p => p.status === key).length;
  }

  const visible = activeTab === 'archived'
    ? archived
    : active.filter(p => p.status === activeTab);

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
        {TABS.map(tab => {
          const count    = getCount(tab.key);
          const isActive = activeTab === tab.key;
          const isArchiveTab = tab.key === 'archived';
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium
                          border-b-2 transition-colors duration-150 whitespace-nowrap
                          ${isActive
                            ? isArchiveTab
                              ? 'border-gray-400 text-gray-600 dark:text-gray-300'
                              : 'border-[#A0CD39] text-[#709028] dark:text-[#A0CD39]'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              {isArchiveTab && <Archive size={13} />}
              {isAr ? tab.labelAr : tab.labelEn}
              <span className={`min-w-5 h-5 px-1 rounded-full text-[11px] font-bold
                                flex items-center justify-center
                                ${isActive
                                  ? isArchiveTab
                                    ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                                    : 'bg-[#A0CD39] text-gray-900'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                {count}
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
