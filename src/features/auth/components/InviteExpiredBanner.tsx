import { useLang } from '@/app/providers/LanguageProvider';
import { authTranslations } from '@/features/auth/i18n';

export function InviteExpiredBanner() {
  const { lang } = useLang();
  const t = authTranslations[lang].invite;

  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8 text-red-500">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{t.expiredTitle}</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">{t.expiredDesc}</p>
      </div>
    </div>
  );
}
