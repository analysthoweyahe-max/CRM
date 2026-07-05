import { Building2, Trash2 } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import type { ApiDepartment } from '../types/adminDepartment.types';

interface Props {
  department: ApiDepartment;
  isAr:       boolean;
  onDelete:   () => void;
}

export function DepartmentCard({ department, isAr, onDelete }: Props) {
  return (
    <Card padding="lg" className="flex items-center justify-between gap-3">
      <Button
        variant="icon-danger"
        aria-label={isAr ? 'حذف القسم' : 'Delete department'}
        onClick={onDelete}
      >
        <Trash2 size={15} />
      </Button>

      <div className="flex items-center gap-3 text-end">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{department.name}</h3>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]">
          <Building2 size={16} />
        </div>
      </div>
    </Card>
  );
}
