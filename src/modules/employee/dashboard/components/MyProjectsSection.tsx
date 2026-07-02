import { FolderKanban } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import type { EmpProjectSection } from '../types/dashboard.types';

interface Props {
  sections: EmpProjectSection[];
  isAr:     boolean;
}

export function MyProjectsSection({ sections, isAr }: Props) {
  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {isAr ? 'مشاريعي' : 'My Projects'}
      </h2>

      {sections.length === 0 ? (
        <div className="py-12 text-center">
          <FolderKanban size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {isAr ? 'لا توجد مشاريع مسندة إليك حاليًا' : 'You have no assigned projects yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.key}>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {section.label} {section.total !== undefined && `(${section.total})`}
              </p>
              {section.projects.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {isAr ? 'لا توجد مشاريع في هذا القسم' : 'No projects in this section'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
