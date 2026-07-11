import { Percent } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesCommissionsPage() {
  return (
    <SalesPagePlaceholder
      icon={<Percent size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="العمولات" titleEn="Commissions"
      subtitleAr="حساب ومتابعة عمولات فريق المبيعات" subtitleEn="Calculate and track sales team commissions"
    />
  );
}
