import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { authTranslations } from '@/modules/auth/i18n';

interface InviteExpiredBannerProps {
  title?:       string;
  desc?:        string;
  actionTo?:    string;
  actionLabel?: string;
}

export function InviteExpiredBanner({
  title,
  desc,
  actionTo,
  actionLabel,
}: InviteExpiredBannerProps = {}) {
  const { lang } = useLang();
  const t = authTranslations[lang].invite;

  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title ?? t.expiredTitle}</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">{desc ?? t.expiredDesc}</p>
      </div>
      {actionTo && actionLabel && (
        <Link
          to={actionTo}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
