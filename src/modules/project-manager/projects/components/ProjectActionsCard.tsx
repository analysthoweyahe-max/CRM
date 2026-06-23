import { Archive, Download } from 'lucide-react';
import { Button }            from '@/shared/components/ui/Button';
import type { Project }      from '../types/project.types';

interface Props {
  project: Project;
  isAr:    boolean;
}

export function ProjectActionsCard({ project, isAr }: Props) {
  function handleExport() {
    const data = JSON.stringify(project, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `project-${project.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-3">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 text-end">
        {isAr ? 'إجراءات' : 'Actions'}
      </h2>

      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="secondary" startIcon={<Archive size={15} />}>
          {isAr ? 'أرشفة' : 'Archive'}
        </Button>
        <Button variant="secondary" startIcon={<Download size={15} />} onClick={handleExport}>
          {isAr ? 'تصدير البيانات' : 'Export Data'}
        </Button>
      </div>
    </div>
  );
}
