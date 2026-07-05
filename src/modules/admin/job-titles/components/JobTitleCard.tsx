import { Briefcase, Pencil, Trash2 } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import type { ApiJobTitle } from '../types/adminJobTitle.types';

interface Props {
  jobTitle: ApiJobTitle;
  isAr:     boolean;
  onEdit:   () => void;
  onDelete: () => void;
}

export function JobTitleCard({ jobTitle, isAr, onEdit, onDelete }: Props) {
  return (
    <Card padding="lg" className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        <Button
          variant="icon-danger"
          aria-label={isAr ? 'حذف المسمى الوظيفي' : 'Delete job title'}
          onClick={onDelete}
        >
          <Trash2 size={15} />
        </Button>
        <Button
          variant="icon"
          aria-label={isAr ? 'تعديل المسمى الوظيفي' : 'Edit job title'}
          onClick={onEdit}
        >
          <Pencil size={15} />
        </Button>
      </div>

      <div className="flex items-center gap-3 text-end">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{jobTitle.name}</h3>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]">
          <Briefcase size={16} />
        </div>
      </div>
    </Card>
  );
}
