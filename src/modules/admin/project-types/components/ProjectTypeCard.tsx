import { Pencil, Trash2, FolderKanban } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge }  from '@/shared/components/ui/Badge';
import type { PmProjectTypeItem } from '@/modules/project-manager/projects/types/project.types';

interface Props {
  type:     PmProjectTypeItem;
  isAr:     boolean;
  onEdit:   () => void;
  onDelete: () => void;
}

export function ProjectTypeCard({ type, isAr, onEdit, onDelete }: Props) {
  const linkedProjects = type.projectsCount ?? 0;
  const canDelete = linkedProjects === 0;

  return (
    <Card padding="lg" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {canDelete && (
            <Button variant="icon-danger" aria-label={isAr ? 'حذف' : 'Delete'} onClick={onDelete}>
              <Trash2 size={15} />
            </Button>
          )}
          <Button variant="icon" aria-label={isAr ? 'تعديل' : 'Edit'} onClick={onEdit}>
            <Pencil size={15} />
          </Button>
        </div>
        <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]">
          <FolderKanban size={16} />
        </div>
      </div>

      <div className="text-end">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 break-words">
          {isAr ? (type.nameAr || type.name) : type.name}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5" dir="ltr">
          {type.slug}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {isAr
            ? `الترتيب: ${type.sortOrder} · المشاريع: ${linkedProjects}`
            : `Sort: ${type.sortOrder} · Projects: ${linkedProjects}`}
        </p>
        {!type.isActive && (
          <div className="flex justify-end mt-2">
            <Badge label={isAr ? 'معطل' : 'Inactive'} variant="error" />
          </div>
        )}
        {!canDelete && (
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
            {isAr
              ? 'لا يمكن الحذف — عطّل النوع بدلاً من ذلك'
              : 'Cannot delete — deactivate instead'}
          </p>
        )}
      </div>
    </Card>
  );
}
