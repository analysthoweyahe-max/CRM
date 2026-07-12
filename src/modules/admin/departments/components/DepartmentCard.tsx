import { Building2, Pencil, Trash2 } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import type { ApiDepartment } from '../types/adminDepartment.types';

interface Props {
  department:    ApiDepartment;
  isAr:          boolean;
  deleteLocked?: boolean;
  onEdit:        () => void;
  onDelete:      () => void;
}

export function DepartmentCard({ department, isAr, deleteLocked, onEdit, onDelete }: Props) {
  return (
    <Card padding="lg" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="icon-danger"
            aria-label={isAr ? 'حذف القسم' : 'Delete department'}
            onClick={onDelete}
            disabled={deleteLocked}
          >
            <Trash2 size={15} />
          </Button>
          <Button
            variant="icon"
            aria-label={isAr ? 'تعديل القسم' : 'Edit department'}
            onClick={onEdit}
          >
            <Pencil size={15} />
          </Button>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]">
          <Building2 size={16} />
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 text-end break-words">
        {department.name}
      </h3>
    </Card>
  );
}
