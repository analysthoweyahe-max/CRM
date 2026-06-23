import { useLang }              from '@/app/providers/LanguageProvider';
import { PageHeader }           from '@/shared/components/ui/PageHeader';
import { CompanyCard }          from '../components/CompanyCard';
import { LeavePolicyCard }      from '../components/LeavePolicyCard';
import { AppearanceCard }       from '../components/AppearanceCard';
import { AttendancePolicyCard } from '../components/AttendancePolicyCard';

export function SettingsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'الإعدادات' : 'Settings'}
        subtitle={isAr ? 'إعدادات النظام والتفضيلات العامة' : 'System settings and general preferences'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="space-y-5">
          <CompanyCard          isAr={isAr} />
          <LeavePolicyCard      isAr={isAr} />
        </div>
        <div className="space-y-5">
          <AppearanceCard       isAr={isAr} />
          <AttendancePolicyCard isAr={isAr} />
        </div>
      </div>
    </div>
  );
}
