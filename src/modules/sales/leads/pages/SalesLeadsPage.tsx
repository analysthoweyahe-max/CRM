import { UserPlus } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesLeadsPage() {
  return (
    <SalesPagePlaceholder
      icon={<UserPlus size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="العملاء المحتملون" titleEn="Leads"
      subtitleAr="إدارة ومتابعة العملاء المحتملين" subtitleEn="Manage and track potential customers"
    />
  );
}
