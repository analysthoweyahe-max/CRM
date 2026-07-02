import { Check } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { WorkSettingsCard }     from '../components/WorkSettingsCard';
import { CompanyInfoCard }      from '../components/CompanyInfoCard';
import { SecuritySettingsCard } from '../components/SecuritySettingsCard';
import { EmployeeDefaultsCard } from '../components/EmployeeDefaultsCard';
import { useOrgSettings } from '../hooks/useOrgSettings';

export function OrgSettingsPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const { settings, set, toggleWorkDay, save, cancel, saving } = useOrgSettings(isAr);

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'إعدادات المؤسسة' : 'Organization Settings'}
        subtitle={isAr
          ? 'إدارة معلومات الشركة وإعدادات العمل والأمان والافتراضيات'
          : "Manage company info, work settings, security, and defaults"}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <WorkSettingsCard settings={settings} onToggleDay={toggleWorkDay} onChange={set} isAr={isAr} />
        <CompanyInfoCard  settings={settings} onChange={set} isAr={isAr} />
      </div>

      <SecuritySettingsCard settings={settings} onChange={set} isAr={isAr} />
      <EmployeeDefaultsCard settings={settings} onChange={set} isAr={isAr} />

      <div className="flex items-center gap-3">
        <Button variant="primary" startIcon={<Check size={15} />} disabled={saving} onClick={save}>
          {isAr ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>
        <Button variant="ghost" onClick={cancel}>
          {isAr ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>

    </div>
  );
}
