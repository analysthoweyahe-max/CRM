import { Settings } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesSettingsPage() {
  return (
    <SalesPagePlaceholder
      icon={<Settings size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="الإعدادات" titleEn="Settings"
      subtitleAr="إعدادات موديول المبيعات" subtitleEn="Sales module configuration"
    />
  );
}
