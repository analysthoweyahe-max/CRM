import { UserCog } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesEmployeesPage() {
  return (
    <SalesPagePlaceholder
      icon={<UserCog size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="الموظفون" titleEn="Employees"
      subtitleAr="فريق المبيعات وصلاحياتهم" subtitleEn="Sales team members and their access"
    />
  );
}
