import { Card } from '@/shared/components/ui/Card';
import { InfoRow } from './InfoRow';
import type { AdminEmployeeDetail } from '../types/adminEmployee.types';

interface Props {
  employee: AdminEmployeeDetail;
  isAr:     boolean;
}

export function EmploymentInfoCard({ employee, isAr }: Props) {
  return (
    <Card padding="lg" className="space-y-1">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
        {isAr ? 'معلومات التوظيف' : 'Employment Information'}
      </h2>
      <InfoRow label={isAr ? 'الرقم الوظيفي' : 'Employee Number'} value={employee.employeeNumber} />
      <InfoRow label={isAr ? 'القسم' : 'Department'} value={employee.department} />
      <InfoRow label={isAr ? 'المسمى الوظيفي' : 'Job Title'} value={employee.jobTitle} />
      <InfoRow label={isAr ? 'المدير المباشر' : 'Direct Manager'} value={employee.managerName || '—'} />
      <InfoRow label={isAr ? 'تاريخ الالتحاق' : 'Joining Date'} value={isAr ? employee.joiningDateAr : employee.joiningDateEn} />
      <InfoRow label={isAr ? 'حالة التوظيف' : 'Employment Type'} value={isAr ? employee.employmentTypeAr : employee.employmentTypeEn} />
    </Card>
  );
}
