import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { setPasswordSchema, type SetPasswordFormValues } from '@/features/auth/schemas/setPassword.schema';
import { useSetPassword } from '@/features/auth/hooks/useSetPassword';
import { useLang } from '@/app/providers/LanguageProvider';
import { authTranslations } from '@/features/auth/i18n';

interface SetPasswordFormProps {
  inviteToken: string;
  employeeId:  string;
}

export function SetPasswordForm({ inviteToken, employeeId }: SetPasswordFormProps) {
  const { lang } = useLang();
  const t = authTranslations[lang];
  const v = t.validation;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const { submit, error: submitError } = useSetPassword(inviteToken);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordFormValues>({ resolver: zodResolver(setPasswordSchema) });

  const password = watch('password', '');

  const fieldErr = (msg: string | undefined) =>
    msg ? (v[msg as keyof typeof v] ?? msg) : undefined;

  const strengthChecks = [
    { label: lang === 'ar' ? '٨ أحرف على الأقل' : '8+ characters', pass: password.length >= 8 },
    { label: lang === 'ar' ? 'حرف كبير'         : 'Uppercase',      pass: /[A-Z]/.test(password) },
    { label: lang === 'ar' ? 'حرف صغير'         : 'Lowercase',      pass: /[a-z]/.test(password) },
    { label: lang === 'ar' ? 'رقم'              : 'Number',         pass: /[0-9]/.test(password) },
  ];

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.setPassword.title}</h2>
        <p className="text-sm text-gray-500 mt-1">{t.setPassword.subtitle}</p>
      </div>

      {/* Employee ID badge */}
      <div className="flex items-center gap-3 rounded-lg bg-white border border-gray-200 px-4 py-3">
        <div className="shrink-0 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
          <span className="text-xs font-bold text-brand-700">{employeeId.slice(0, 2).toUpperCase()}</span>
        </div>
        <div>
          <p className="text-xs text-gray-400">{t.setPassword.employeeIdLabel}</p>
          <p className="text-sm font-semibold text-gray-800">{employeeId}</p>
        </div>
      </div>

      {/* Server error */}
      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {lang === 'ar' ? 'حدث خطأ. حاول مجددًا.' : 'Something went wrong. Please try again.'}
        </div>
      )}

      {/* New password */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          {t.setPassword.password}
          <span className="text-red-500 ms-0.5">*</span>
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 ps-11 pe-11
                       text-sm outline-none focus:border-brand-500 focus:ring-2
                       focus:ring-brand-500/20 transition placeholder:text-gray-400"
          />
          {/* Lock icon — logical end (right in RTL) */}
          <span className="pointer-events-none absolute inset-y-0 inset-e-0 flex items-center pe-3 text-gray-400">
            <Lock size={17} />
          </span>
          {/* Eye toggle — logical start (left in RTL) */}
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute inset-y-0 inset-s-0 flex items-center ps-3 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-0.5 text-xs text-red-500">{fieldErr(errors.password.message)}</p>
        )}
      </div>

      {/* Strength checklist */}
      {password.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {strengthChecks.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <span className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center
                               ${c.pass ? 'bg-brand-500' : 'bg-gray-200'}`}>
                {c.pass && (
                  <svg viewBox="0 0 8 6" fill="none" className="w-2 h-2">
                    <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={`text-xs ${c.pass ? 'text-brand-700 font-medium' : 'text-gray-400'}`}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Confirm password */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          {t.setPassword.confirmPassword}
          <span className="text-red-500 ms-0.5">*</span>
        </label>
        <div className="relative">
          <input
            {...register('confirmPassword')}
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 ps-11 pe-11
                       text-sm outline-none focus:border-brand-500 focus:ring-2
                       focus:ring-brand-500/20 transition placeholder:text-gray-400"
          />
          <span className="pointer-events-none absolute inset-y-0 inset-e-0 flex items-center pe-3 text-gray-400">
            <Lock size={17} />
          </span>
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="absolute inset-y-0 inset-s-0 flex items-center ps-3 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-0.5 text-xs text-red-500">{fieldErr(errors.confirmPassword.message)}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700
                   text-white font-semibold py-3 text-sm transition-colors
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? (lang === 'ar' ? 'جارٍ التفعيل...' : 'Activating...')
          : t.setPassword.submit}
      </button>

    </form>
  );
}
