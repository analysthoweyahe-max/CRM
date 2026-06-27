import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';

export function EmployeeRequestsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'طلباتى' : 'My Requests'}
        subtitle={isAr ? 'إدارة طلبات الإجازات والتقارير' : 'Manage your leave and report requests'}
      />
    </div>
  );
}
