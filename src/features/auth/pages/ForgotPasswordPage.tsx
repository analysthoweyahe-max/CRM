import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';

export function ForgotPasswordPage() {
  const { lang, isRTL } = useLang();
  const isAr = lang === 'ar';

  const [employeeId, setEmployeeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId.trim()) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    setEmployeeId('');

    toast.success(
      isAr
        ? 'سيتم إرسال رابط الاستعادة إلى بريدك'
        : 'A recovery link will be sent to your email',
      { duration: 5000 },
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isAr
            ? 'أدخل معرف المستخدم وسنرسل لك رابط الاستعادة'
            : "Enter your user ID and we'll send you a recovery link"}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            {isAr ? 'معرف المستخدم' : 'User ID'}
            <span className="text-red-500 ms-0.5">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="EMP-1000"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pe-11
                         text-sm outline-none focus:border-brand-500 focus:ring-2
                         focus:ring-brand-500/20 transition placeholder:text-gray-400"
            />
            <span className="pointer-events-none absolute inset-y-0 inset-e-0 flex items-center pe-3 text-gray-400">
              <Mail size={17} />
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !employeeId.trim()}
          className="w-full rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700
                     text-white font-semibold py-3 text-sm transition-colors
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? (isAr ? 'جاري الإرسال...' : 'Sending...')
            : (isAr ? 'إرسال رابط الاستعادة' : 'Send Recovery Link')}
        </button>
      </form>

      <Link
        to={ROUTES.AUTH.LOGIN}
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
        {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
      </Link>

    </div>
  );
}
