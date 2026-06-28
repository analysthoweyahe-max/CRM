import { useLang }                from '@/app/providers/LanguageProvider';
import { PageHeader }             from '@/shared/components/ui/PageHeader';
import { EmployeeProfileInfo }    from '../components/EmployeeProfileInfo';
import { EmployeeProfileSummary } from '../components/EmployeeProfileSummary';

export function EmployeeProfilePage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'الملف الشخصي' : 'My Profile'}
        subtitle={isAr ? 'إدارة معلوماتك الشخصية' : 'Manage your personal information'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2">
          <EmployeeProfileInfo isAr={isAr} />
        </div>
        <div>
          <EmployeeProfileSummary isAr={isAr} />
        </div>
      </div>
    </div>
  );
}
