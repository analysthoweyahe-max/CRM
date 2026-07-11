import { Users } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesCustomersPage() {
  return (
    <SalesPagePlaceholder
      icon={<Users size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="العملاء" titleEn="Customers"
      subtitleAr="قائمة العملاء الفعليين وبياناتهم" subtitleEn="Your active customer accounts"
    />
  );
}
