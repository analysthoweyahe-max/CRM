import { BarChart2 } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesReportsPage() {
  return (
    <SalesPagePlaceholder
      icon={<BarChart2 size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="التقارير" titleEn="Reports"
      subtitleAr="تقارير أداء المبيعات التفصيلية" subtitleEn="Detailed sales performance reports"
    />
  );
}
