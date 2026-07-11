import { GitBranch } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesPipelinePage() {
  return (
    <SalesPagePlaceholder
      icon={<GitBranch size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="مسار المبيعات" titleEn="Sales Pipeline"
      subtitleAr="متابعة الصفقات عبر مراحل المسار" subtitleEn="Track deals across pipeline stages"
    />
  );
}
