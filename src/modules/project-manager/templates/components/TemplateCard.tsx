import { Pencil, Trash2, ListChecks, Star } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge }  from '@/shared/components/ui/Badge';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import type { PmProjectTemplate } from '../types/template.types';

interface Props {
  template: PmProjectTemplate;
  isAr:     boolean;
  onEdit:   () => void;
  onDelete: () => void;
}

export function TemplateCard({ template, isAr, onEdit, onDelete }: Props) {
  const typeLabel = template.projectTypeLabel || template.projectType;

  return (
    <Card padding="lg" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="icon-danger" aria-label={isAr ? 'حذف' : 'Delete'} onClick={onDelete}>
            <Trash2 size={15} />
          </Button>
          <Button variant="icon" aria-label={isAr ? 'تعديل' : 'Edit'} onClick={onEdit}>
            <Pencil size={15} />
          </Button>
        </div>
        <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]">
          <ListChecks size={16} />
        </div>
      </div>

      <div className="text-end space-y-1">
        <div className="flex items-center gap-2 justify-end">
          {template.isDefault && (
            <Star size={14} className="text-amber-500 fill-amber-500 shrink-0" />
          )}
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 break-words">
            {template.name}
          </h3>
        </div>
        {template.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {template.description}
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {isAr ? `عدد المراحل: ${template.stepsCount}` : `Steps: ${template.stepsCount}`}
        </p>
      </div>

      <div className="flex items-center gap-1.5 justify-end flex-wrap">
        {typeLabel
          ? <Badge label={translateProjectLookup(template.projectType ?? '', typeLabel, isAr)} variant="brand" />
          : <Badge label={isAr ? 'عام' : 'Global'} variant="gray" />}
        {template.isDefault && (
          <Badge label={isAr ? 'افتراضي' : 'Default'} variant="success" />
        )}
      </div>
    </Card>
  );
}
