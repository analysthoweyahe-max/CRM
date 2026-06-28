import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';

export function EmployeeDailyReportsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'التقارير اليومية' : 'Daily Reports'}
        subtitle={isAr ? 'سجّل إنجازاتك اليومية وتابع تقاريرك' : 'Log your daily achievements and track your reports'}
      />
    </div>
  );
}
