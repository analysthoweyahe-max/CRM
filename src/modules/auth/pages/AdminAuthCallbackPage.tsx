import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '@/app/providers/LanguageProvider';
import { authTranslations } from '@/modules/auth/i18n';
import { ROUTES } from '@/app/router/routes';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { useAdminAuthCallback } from '@/modules/auth/hooks/useAdminAuthCallback';

export function AdminAuthCallbackPage() {
  const { status } = useAdminAuthCallback();
  const { lang }   = useLang();
  const t          = authTranslations[lang].magicLink;

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <LoadingSpinner size={28} />
        <p className="text-sm text-gray-500">{t.verifying}</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{t.invalidTitle}</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">{t.invalidDesc}</p>
      </div>
      <Link
        to={ROUTES.AUTH.LOGIN}
        className="inline-block text-brand-600 font-medium hover:text-brand-700 transition-colors"
      >
        {t.backToLogin}
      </Link>
    </div>
  );
}
