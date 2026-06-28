import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '@/modules/auth/schemas/login.schema';
import { useLogin } from '@/modules/auth/hooks/useLogin';
import { useLang } from '@/app/providers/LanguageProvider';
import { authTranslations } from '@/modules/auth/i18n';
import { ROUTES } from '@/app/router/routes';
import { Button } from '@/shared/components/ui/Button';

export function LoginForm() {
  const { lang } = useLang();
  const t = authTranslations[lang];
  const v = t.validation;

  const [showPassword, setShowPassword] = useState(false);
  const { submit, error: submitError } = useLogin();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const fieldErr = (msg: string | undefined) =>
    msg ? (v[msg as keyof typeof v] ?? msg) : undefined;

  const empIdDir = /[؀-ۿ]/.test(watch('employeeId') ?? '') ? 'rtl' : 'ltr';

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.login.title}</h2>
        <p className="text-sm text-gray-500 mt-1">{t.login.subtitle}</p>
      </div>

      {/* Server error */}
      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {lang === 'ar'
            ? 'معرّف المستخدم أو كلمة المرور غير صحيحة'
            : 'Invalid employee ID or password'}
        </div>
      )}

      {/* Employee ID */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          {t.login.employeeId}
          <span className="text-red-500 ms-0.5">*</span>
        </label>
        <div className="relative" dir={empIdDir}>
          <input
            {...register('employeeId')}
            type="text"
            placeholder={t.login.employeeIdPlaceholder}
            autoComplete="username"
            aria-invalid={!!errors.employeeId}
            className={`w-full rounded-lg border bg-white py-2.5 ps-11 pe-4
                       text-sm outline-none focus:border-brand-500 focus:ring-2
                       focus:ring-brand-500/20 transition placeholder:text-gray-400 ${
                         errors.employeeId ? 'border-red-300' : 'border-gray-300'
                       }`}
          />
          <span className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-gray-400">
            <User size={17} />
          </span>
        </div>
        {errors.employeeId && (
          <p className="mt-0.5 text-xs text-red-500">{fieldErr(errors.employeeId.message)}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          {t.login.password}
          <span className="text-red-500 ms-0.5">*</span>
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t.login.passwordPlaceholder}
            autoComplete="current-password"
            dir="ltr"
            aria-invalid={!!errors.password}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 ps-11 pe-11
                       text-sm outline-none focus:border-brand-500 focus:ring-2
                       focus:ring-brand-500/20 transition placeholder:text-gray-400 ${
                         errors.password ? 'border-red-300' : 'border-gray-300'
                       }`}
          />
          {/* Eye toggle — logical start */}
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute inset-y-0 inset-s-0 flex items-center ps-3 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
          {/* Lock icon — logical end */}
          <span className="pointer-events-none absolute inset-y-0 inset-e-0 flex items-center pe-3 text-gray-400">
            <Lock size={17} />
          </span>
        </div>
        {errors.password && (
          <p className="mt-0.5 text-xs text-red-500">{fieldErr(errors.password.message)}</p>
        )}
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.AUTH.FORGOT_PASSWORD}
          className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
        >
          {t.login.forgotPassword}
        </Link>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-sm text-gray-600">{t.login.rememberMe}</span>
          <input
            {...register('rememberMe')}
            type="checkbox"
            className="w-4 h-4 rounded accent-brand-500"
          />
        </label>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
      >
        {isSubmitting
          ? (lang === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Signing in...')
          : t.login.submit}
      </Button>

      {/* Activation link */}
      <p className="text-center text-sm text-gray-500">
        {t.login.activationPrompt}{' '}
        <Link
          to={ROUTES.AUTH.SET_PASSWORD}
          className="text-brand-600 font-medium hover:text-brand-700 transition-colors"
        >
          {t.login.activationAction}
        </Link>
      </p>

    </form>
  );
}
