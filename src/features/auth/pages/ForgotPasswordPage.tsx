import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';

export function ForgotPasswordPage() {
  const { lang, isRTL } = useLang();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {lang === 'ar'
            ? 'تواصل مع مسؤول الموارد البشرية لإعادة تعيين كلمة المرور.'
            : 'Contact your HR administrator to reset your password.'}
        </p>
      </div>

      <Link
        to={ROUTES.AUTH.LOGIN}
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
        {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
      </Link>
    </div>
  );
}
