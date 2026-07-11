import { Receipt } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesInvoicesPage() {
  return (
    <SalesPagePlaceholder
      icon={<Receipt size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="الفواتير" titleEn="Invoices"
      subtitleAr="إصدار ومتابعة فواتير العملاء" subtitleEn="Issue and track customer invoices"
    />
  );
}
