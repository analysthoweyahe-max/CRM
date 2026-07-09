import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/modules/auth/schemas/forgotPassword.schema';
import { useForgotPassword } from '@/modules/auth/hooks/useForgotPassword';
import { useLang } from '@/app/providers/LanguageProvider';
import { authTranslations } from '@/modules/auth/i18n';
import { ROUTES } from '@/app/router/routes';
import { Button } from '@/shared/components/ui/Button';

export function ForgotPasswordForm() {
  const { lang, isRTL } = useLang();
  const t = authTranslations[lang];
  const tf = t.forgotPassword;
  const v = t.validation;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const { submit } = useForgotPassword();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const fieldErr = (msg: string | undefined) =>
    msg ? (v[msg as keyof typeof v] ?? msg) : undefined;

  const displayError = (() => {
    if (!submitError) return null;
    if (submitError === 'forgotPasswordFailed') {
      return lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Please try again.';
    }
    if (submitError === 'mailSendFailed') {
      return tf.mailSendFailed;
    }
    return submitError;
  })();

  async function onSubmit(values: ForgotPasswordFormValues) {
    setSubmitError(null);
    const err = await submit(values, setFieldError);
    if (err) setSubmitError(err);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full space-y-5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{tf.title}</h2>
        <p className="mt-1 text-sm text-gray-500">{tf.subtitle}</p>
      </div>

      {displayError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {displayError}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          {tf.emailLabel}
          <span className="text-red-500 ms-0.5">*</span>
        </label>
        <div className="relative">
          <input
            {...register('email')}
            type="email"
            placeholder={tf.emailPlaceholder}
            autoComplete="email"
            dir="ltr"
            className={`w-full rounded-lg border bg-white py-2.5 ps-11 pe-4
                       text-sm outline-none focus:border-brand-500 focus:ring-2
                       focus:ring-brand-500/20 transition placeholder:text-gray-400 ${
                         errors.email ? 'border-red-300' : 'border-gray-300'
                       }`}
          />
          <span className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-gray-400">
            <Mail size={17} />
          </span>
        </div>
        {errors.email && (
          <p className="mt-0.5 text-xs text-red-500">{fieldErr(errors.email.message)}</p>
        )}
      </div>

      <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
        {isSubmitting ? tf.submitting : tf.submit}
      </Button>

      <Link
        to={ROUTES.AUTH.LOGIN}
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        <BackIcon size={16} />
        {tf.backToLogin}
      </Link>
    </form>
  );
}
