import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';

export function EmployeeTasksPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'مهامي' : 'My Tasks'}
        subtitle={isAr ? 'قائمة المهام المُسندة إليك' : 'Tasks assigned to you'}
      />
    </div>
  );
}
