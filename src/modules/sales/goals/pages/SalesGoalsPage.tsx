import { Target } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesGoalsPage() {
  return (
    <SalesPagePlaceholder
      icon={<Target size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="الأهداف" titleEn="Goals"
      subtitleAr="أهداف المبيعات الفردية والجماعية" subtitleEn="Individual and team sales targets"
    />
  );
}
