import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MyProjectCard } from './MyProjectCard';
import type { MyProjectsPageConfig, ProjectSection } from '../types/myProjects.types';

interface Props {
  sections: ProjectSection[];
  config:   MyProjectsPageConfig;
  isAr:     boolean;
}

export function MyProjectsSectionsView({ sections, config, isAr }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map(s => [s.key, s.defaultExpanded])),
  );

  const toggle = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      {sections.map(section => {
        const isOpen = expanded[section.key] ?? section.defaultExpanded;
        return (
          <div
            key={section.key}
            className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(section.key)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-start
                         hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {section.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  {section.total}
                </span>
              </div>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && section.projects.length > 0 && (
              <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.projects.map(project => (
                  <MyProjectCard
                    key={project.id}
                    item={{ kind: 'dashboard', project }}
                    config={config}
                    isAr={isAr}
                  />
                ))}
              </div>
            )}

            {isOpen && section.projects.length === 0 && (
              <p className="px-5 pb-5 text-sm text-gray-400 dark:text-gray-500">
                {isAr ? 'لا توجد مشاريع في هذا القسم' : 'No projects in this section'}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
