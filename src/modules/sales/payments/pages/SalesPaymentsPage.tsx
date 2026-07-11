import { Wallet } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesPaymentsPage() {
  return (
    <SalesPagePlaceholder
      icon={<Wallet size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="المدفوعات" titleEn="Payments"
      subtitleAr="سجل المدفوعات الواردة من العملاء" subtitleEn="Incoming customer payment records"
    />
  );
}
