import { Key, Pencil } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge }  from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import type { AdminEmployeeDetail } from '../types/adminEmployee.types';

const STATUS_VARIANT: Record<AdminEmployeeDetail['status'], 'success' | 'error' | 'warning'> = {
  active:   'success',
  inactive: 'error',
  pending:  'warning',
};

interface Props {
  employee:            AdminEmployeeDetail;
  isAr:                boolean;
  isSuperAdmin?:       boolean;
  onEdit:              () => void;
  onUpdatePassword?:   () => void;
}

export function EmployeeDetailHeader({ employee, isAr, isSuperAdmin, onEdit, onUpdatePassword }: Props) {
  return (
    <Card padding="lg" className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button variant="primary" startIcon={<Pencil size={14} />} onClick={onEdit}>
          {isAr ? 'تعديل الموظف' : 'Edit Employee'}
        </Button>
        {isSuperAdmin && onUpdatePassword && (
          <Button variant="secondary" startIcon={<Key size={14} />} onClick={onUpdatePassword}>
            {isAr ? 'تغيير كلمة المرور' : 'Update Password'}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-end">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{employee.name}</h1>
          <div className="flex items-center justify-end gap-2 mt-1">
            <Badge label={isAr ? employee.statusLabelAr : employee.statusLabelEn} variant={STATUS_VARIANT[employee.status]} />
            <Badge label={employee.role} variant="gray" />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {employee.email} · {employee.department}
          </p>
        </div>
        <Avatar initial={employee.avatarInitial} color={employee.avatarColor} size="lg" className="w-16! h-16! text-2xl!" />
      </div>
    </Card>
  );
}
