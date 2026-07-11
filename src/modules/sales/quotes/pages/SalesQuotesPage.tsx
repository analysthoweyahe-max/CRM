import { FileText } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesQuotesPage() {
  return (
    <SalesPagePlaceholder
      icon={<FileText size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="عروض الأسعار" titleEn="Price Quotes"
      subtitleAr="إنشاء ومتابعة عروض الأسعار" subtitleEn="Create and track price quotes"
    />
  );
}
