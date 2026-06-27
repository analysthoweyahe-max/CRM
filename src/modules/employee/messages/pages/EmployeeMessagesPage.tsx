import { useLang }      from '@/app/providers/LanguageProvider';
import { PageHeader }   from '@/shared/components/ui/PageHeader';

export function EmployeeMessagesPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'الرسائل' : 'Messages'}
        subtitle={isAr ? 'تواصل مع فريقك' : 'Chat with your team'}
      />
    </div>
  );
}
