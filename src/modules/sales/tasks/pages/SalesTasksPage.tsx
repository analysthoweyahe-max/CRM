import { ListChecks } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesTasksPage() {
  return (
    <SalesPagePlaceholder
      icon={<ListChecks size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="المهام" titleEn="Tasks"
      subtitleAr="مهام فريق المبيعات اليومية" subtitleEn="Daily tasks for the sales team"
    />
  );
}
