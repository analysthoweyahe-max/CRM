import { Check } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { WorkSettingsCard } from '../components/WorkSettingsCard';
import { CompanyInfoCard }  from '../components/CompanyInfoCard';
import { LeavePolicyCard }  from '../components/LeavePolicyCard';
import { useOrgSettingsPage } from '../hooks/useOrgSettings';

export function OrgSettingsPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const { settings, isLoading, set, save, cancel, saving } = useOrgSettingsPage(isAr);

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'إعدادات المؤسسة' : 'Organization Settings'}
        subtitle={isAr
          ? 'إدارة معلومات الشركة وإعدادات العمل وسياسة الإجازات'
          : 'Manage company info, work settings, and leave policy'}
      />

      {isLoading || !settings ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            <CompanyInfoCard  settings={settings} onChange={set} isAr={isAr} />
            <WorkSettingsCard settings={settings} onChange={set} isAr={isAr} />
          </div>

          <LeavePolicyCard settings={settings} onChange={set} isAr={isAr} />

          <div className="flex items-center gap-3">
            <Button variant="primary" startIcon={<Check size={15} />} isLoading={saving} onClick={save}>
              {isAr ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
            <Button variant="ghost" onClick={cancel}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </>
      )}

    </div>
  );
}
