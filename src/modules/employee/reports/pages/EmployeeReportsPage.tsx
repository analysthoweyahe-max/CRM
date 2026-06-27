import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';

export function EmployeeReportsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'التقارير اليومية' : 'Daily Reports'}
        subtitle={isAr ? 'تقاريرك اليومية وسجل العمل' : 'Your daily reports and work log'}
      />
    </div>
  );
}
