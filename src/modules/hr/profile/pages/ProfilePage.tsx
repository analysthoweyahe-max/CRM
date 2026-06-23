import { useLang }           from '@/app/providers/LanguageProvider';
import { useAuth }           from '@/modules/auth/context/AuthContext';
import { PageHeader }        from '@/shared/components/ui/PageHeader';
import { ProfileInfoCard }   from '../components/ProfileInfoCard';
import { ProfileSummaryCard } from '../components/ProfileSummaryCard';

export function ProfilePage() {
  const { lang }  = useLang();
  const { user }  = useAuth();
  const isAr      = lang === 'ar';

  if (!user) return null;

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'الملف الشخصي' : 'My Profile'}
        subtitle={isAr ? 'إدارة معلوماتك الشخصية' : 'Manage your personal information'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Editable form — takes 2/3 width */}
        <div className="lg:col-span-2">
          <ProfileInfoCard user={user} isAr={isAr} />
        </div>

        {/* Summary card — takes 1/3 width */}
        <div>
          <ProfileSummaryCard user={user} isAr={isAr} />
        </div>
      </div>
    </div>
  );
}
