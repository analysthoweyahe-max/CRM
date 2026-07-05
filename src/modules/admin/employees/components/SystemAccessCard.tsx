import { Card }  from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { InfoRow } from './InfoRow';
import type { AdminEmployeeDetail } from '../types/adminEmployee.types';

const STATUS_VARIANT: Record<AdminEmployeeDetail['status'], 'success' | 'error' | 'warning'> = {
  active:   'success',
  inactive: 'error',
  pending:  'warning',
};

interface Props {
  employee: AdminEmployeeDetail;
  isAr:     boolean;
}

export function SystemAccessCard({ employee, isAr }: Props) {
  return (
    <Card padding="lg" className="space-y-1">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
        {isAr ? 'وصول النظام' : 'System Access'}
      </h2>
      <InfoRow label={isAr ? 'الدور الحالي' : 'Current Role'} value={employee.role} />
      <InfoRow
        label={isAr ? 'حالة الحساب' : 'Account Status'}
        value={<Badge label={isAr ? employee.statusLabelAr : employee.statusLabelEn} variant={STATUS_VARIANT[employee.status]} />}
      />
      <InfoRow label={isAr ? 'تاريخ إنشاء الحساب' : 'Account Created'} value={isAr ? employee.accountCreatedAr : employee.accountCreatedEn} />
    </Card>
  );
}
