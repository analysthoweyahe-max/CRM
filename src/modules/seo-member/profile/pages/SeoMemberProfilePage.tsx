import { useLang }                    from '@/app/providers/LanguageProvider';
import { PageHeader }                 from '@/shared/components/ui/PageHeader';
import { SeoMemberProfileInfoCard }    from '../components/SeoMemberProfileInfoCard';
import { SeoMemberProfileSummaryCard } from '../components/SeoMemberProfileSummaryCard';
import { MyPermissionsCard } from '@/shared/components/auth';

export function SeoMemberProfilePage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isAr ? 'الملف الشخصي' : 'My Profile'}
        subtitle={isAr ? 'إدارة معلوماتك الشخصية' : 'Manage your personal information'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <SeoMemberProfileInfoCard isAr={isAr} />
          <MyPermissionsCard />
        </div>
        <div>
          <SeoMemberProfileSummaryCard isAr={isAr} />
        </div>
      </div>
    </div>
  );
}
