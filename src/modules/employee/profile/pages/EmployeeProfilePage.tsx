import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';

export function EmployeeProfilePage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'الملف الشخصي' : 'My Profile'}
        subtitle={isAr ? 'بياناتك الشخصية والوظيفية' : 'Your personal and employment details'}
      />
    </div>
  );
}
