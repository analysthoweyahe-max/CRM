import { CalendarDays } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesCalendarPage() {
  return (
    <SalesPagePlaceholder
      icon={<CalendarDays size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="التقويم" titleEn="Calendar"
      subtitleAr="مواعيد المكالمات والاجتماعات والمتابعات" subtitleEn="Calls, meetings, and follow-up schedule"
    />
  );
}
