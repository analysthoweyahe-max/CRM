import { useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { ROUTES } from '@/app/router/routes';
import { setPasswordSchema, type SetPasswordFormValues } from '@/features/auth/schemas/setPassword.schema';
import { useSetPassword } from '@/features/auth/hooks/useSetPassword';
import { useLang } from '@/app/providers/LanguageProvider';
import { authTranslations } from '@/features/auth/i18n';

interface SetPasswordFormProps {
  inviteToken?: string;
  employeeId?: string;
}

export function SetPasswordForm({ inviteToken = '' }: SetPasswordFormProps) {
  const { lang } = useLang();
  const t = authTranslations[lang];
  const v = t.validation;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { submit, error: submitError } = useSetPassword(inviteToken, rememberMe);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordFormValues>({ resolver: zodResolver(setPasswordSchema) });

  const fieldErr = (msg: string | undefined) =>
    msg ? (v[msg as keyof typeof v] ?? msg) : undefined;

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="w-full space-y-7">
      <div className="text-right">
        <h2 className="text-[26px] font-semibold leading-tight text-[#3d3d3d]">
          {t.setPassword.title}
        </h2>
        <p className="mt-1 text-sm text-[#7b7b7b]">
          {t.setPassword.subtitle}
        </p>
      </div>

      {submitError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Please try again.'}
        </div>
      )}

      <div className="space-y-5">
        <PasswordField
          label={t.setPassword.password}
          error={fieldErr(errors.password?.message)}
          inputProps={register('password')}
          isVisible={showPassword}
          onToggle={() => setShowPassword((value) => !value)}
        />

        <PasswordField
          label={t.setPassword.confirmPassword}
          error={fieldErr(errors.confirmPassword?.message)}
          inputProps={register('confirmPassword')}
          isVisible={showConfirm}
          onToggle={() => setShowConfirm((value) => !value)}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <a href={ROUTES.AUTH.FORGOT_PASSWORD} className="text-[#2f2f2f] underline underline-offset-2 hover:text-[#80b51c]">
          {t.setPassword.forgotPassword}
        </a>
        <label className="flex cursor-pointer items-center gap-2 text-[#4f4f4f]">
          <span>{t.setPassword.rememberMe}</span>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-[18px] w-[18px] rounded border border-[#d6d6d6] accent-[#9bd130]"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-md bg-[#9bd130] text-base font-medium text-[#26300f]
                   transition hover:bg-[#8cc51f] active:bg-[#7ab018]
                   disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? t.setPassword.activating : t.setPassword.submit}
      </button>
    </form>
  );
}

interface PasswordFieldProps {
  label: string;
  error?: string;
  inputProps: UseFormRegisterReturn;
  isVisible: boolean;
  onToggle: () => void;
}

function PasswordField({ label, error, inputProps, isVisible, onToggle }: PasswordFieldProps) {
  return (
    <div className="flex flex-col gap-2 text-right">
      <label className="text-sm font-semibold text-[#5c5c5c]">
        {label}
        <span className="me-0.5 text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          {...inputProps}
          type={isVisible ? 'text' : 'password'}
          placeholder="***************"
          autoComplete="new-password"
          className="h-11 w-full rounded-md border border-[#d9d9d9] bg-white px-11 text-right text-sm text-[#353535]
                     outline-none transition placeholder:text-[#8f8f8f]
                     focus:border-[#9bd130] focus:ring-2 focus:ring-[#9bd130]/20"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 left-0 flex w-11 items-center justify-center text-[#686b73] transition hover:text-[#3e424a]"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {isVisible ? <EyeOff size={21} /> : <Eye size={21} />}
        </button>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#686b73]">
          <Lock size={18} fill="currentColor" strokeWidth={0} />
        </span>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
