import { Card }  from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { InfoRow } from './InfoRow';
import { getRoleLabel } from '../types/adminEmployee.types';
import type { AdminEmployeeDetail } from '../types/adminEmployee.types';

const STATUS_VARIANT: Record<AdminEmployeeDetail['status'], 'success' | 'error' | 'warning'> = {
  active:   'success',
  inactive: 'error',
  pending:  'warning',
};

interface Props {
  employee:     AdminEmployeeDetail;
  isAr:         boolean;
  isSuperAdmin?: boolean;
}

export function SystemAccessCard({ employee, isAr, isSuperAdmin }: Props) {
  return (
    <Card padding="lg" className="space-y-1">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
        {isAr ? 'وصول النظام' : 'System Access'}
      </h2>
      {isSuperAdmin && (
        <InfoRow
          label={isAr ? 'معرّف المستخدم' : 'User ID'}
          value={<span dir="ltr" className="font-mono text-sm">{employee.userId}</span>}
        />
      )}
      <InfoRow
        label={isAr ? 'الأدوار' : 'Roles'}
        value={
          employee.roles.length ? (
            <div className="flex flex-wrap items-center gap-1.5 justify-end">
              {employee.roles.map((role) => (
                <Badge key={role} label={getRoleLabel(role, isAr)} variant="gray" />
              ))}
            </div>
          ) : '—'
        }
      />
      <InfoRow
        label={isAr ? 'حالة الحساب' : 'Account Status'}
        value={<Badge label={isAr ? employee.statusLabelAr : employee.statusLabelEn} variant={STATUS_VARIANT[employee.status]} />}
      />
      <InfoRow label={isAr ? 'تاريخ إنشاء الحساب' : 'Account Created'} value={isAr ? employee.accountCreatedAr : employee.accountCreatedEn} />
    </Card>
  );
}
