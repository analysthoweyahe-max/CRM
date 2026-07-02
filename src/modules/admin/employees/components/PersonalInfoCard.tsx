import { Card } from '@/shared/components/ui/Card';
import { InfoRow } from './InfoRow';
import type { AdminEmployeeDetail } from '../types/adminEmployee.types';

interface Props {
  employee: AdminEmployeeDetail;
  isAr:     boolean;
}

export function PersonalInfoCard({ employee, isAr }: Props) {
  return (
    <Card padding="lg" className="space-y-1">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
        {isAr ? 'المعلومات الشخصية' : 'Personal Information'}
      </h2>
      <InfoRow label={isAr ? 'البريد الإلكتروني' : 'Email'} value={employee.email} />
      <InfoRow label={isAr ? 'رقم الهاتف' : 'Phone Number'} value={employee.phone || '—'} />
      <InfoRow label={isAr ? 'العنوان' : 'Address'} value={employee.address || '—'} />
    </Card>
  );
}
