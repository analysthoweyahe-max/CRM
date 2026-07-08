import { useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import {
  setPasswordSchema,
  type SetPasswordFormValues,
} from '@/modules/auth/schemas/setPassword.schema';
import { useSetPassword } from '@/modules/auth/hooks/useSetPassword';
import { useLang } from '@/app/providers/LanguageProvider';
import { authTranslations } from '@/modules/auth/i18n';
import { Button } from '@/shared/components/ui/Button';

interface PasswordFieldProps {
  label: string;
  error?: string;
  inputProps: UseFormRegisterReturn;
  isVisible: boolean;
  onToggle: () => void;
}

function PasswordField({
  label,
  error,
  inputProps,
  isVisible,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        <span className="text-red-500 ms-0.5">*</span>
      </label>

      <div className="relative">
        <input
          {...inputProps}
          type={isVisible ? 'text' : 'password'}
          placeholder="***************"
          autoComplete="new-password"
          dir="ltr"
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 ps-11 pe-11
                     text-sm outline-none focus:border-brand-500 focus:ring-2
                     focus:ring-brand-500/20 transition placeholder:text-gray-400"
        />

        {/* Eye toggle — logical start */}
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 inset-s-0 flex items-center ps-3 text-gray-400 hover:text-gray-600 transition-colors"
          tabIndex={-1}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>

        {/* Lock icon — logical end */}
        <span className="pointer-events-none absolute inset-y-0 inset-e-0 flex items-center pe-3 text-gray-400">
          <Lock size={17} />
        </span>
      </div>

      {error && (
        <p className="mt-0.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

interface SetPasswordFormProps {
  inviteToken?:  string;
  inviteType?:   'admin' | 'employee';
  inviteeName?:  string;
  inviteeEmail?: string;
}

export function SetPasswordForm({
  inviteToken  = '',
  inviteType   = 'employee',
  inviteeName  = '',
  inviteeEmail = '',
}: SetPasswordFormProps) {
  const { lang } = useLang();
  const t = authTranslations[lang];
  const v = t.validation;
  const ti = t.invite;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { submit, error: submitError } = useSetPassword(inviteToken, inviteType);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
  });

  const fieldErr = (msg: string | undefined) =>
    msg ? (v[msg as keyof typeof v] ?? msg) : undefined;

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="w-full space-y-5"
    >
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t.setPassword.title}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t.setPassword.subtitle}
        </p>
        {(inviteeName || inviteeEmail) && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            {inviteeName && (
              <p>
                {ti.greeting} <span className="font-semibold text-gray-800">{inviteeName}</span>
              </p>
            )}
            {inviteeEmail && (
              <p className="mt-1">
                {ti.accountEmail}:{' '}
                <span className="font-medium text-gray-800" dir="ltr">{inviteeEmail}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Server error */}
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError === 'setPasswordFailed'
            ? (lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Please try again.')
            : submitError}
        </div>
      )}

      {/* Password fields */}
      <div className="space-y-5">
        <PasswordField
          label={t.setPassword.password}
          error={fieldErr(errors.password?.message)}
          inputProps={register('password')}
          isVisible={showPassword}
          onToggle={() => setShowPassword((prev) => !prev)}
        />

        <PasswordField
          label={t.setPassword.confirmPassword}
          error={fieldErr(errors.confirmPassword?.message)}
          inputProps={register('confirmPassword')}
          isVisible={showConfirm}
          onToggle={() => setShowConfirm((prev) => !prev)}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
      >
        {isSubmitting ? t.setPassword.activating : t.setPassword.submit}
      </Button>
    </form>
  );
}