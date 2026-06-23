import { ClipboardList } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';

export function ProjectReportsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-400">
      <ClipboardList size={48} className="opacity-20" />
      <p className="text-base font-medium">{isAr ? 'التقارير اليومية والطلبات' : 'Reports & Requests'}</p>
      <p className="text-sm">{isAr ? 'قريباً...' : 'Coming soon...'}</p>
    </div>
  );
}
