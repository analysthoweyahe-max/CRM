import { Users } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';

export function ProjectTeamPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-400">
      <Users size={48} className="opacity-20" />
      <p className="text-base font-medium">{isAr ? 'فريق العمل' : 'Team'}</p>
      <p className="text-sm">{isAr ? 'قريباً...' : 'Coming soon...'}</p>
    </div>
  );
}
