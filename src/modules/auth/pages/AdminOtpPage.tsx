import { ShieldCheck } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { authTranslations } from '@/modules/auth/i18n';
import { Button } from '@/shared/components/ui/Button';
import { useAdminOtp } from '@/modules/auth/hooks/useAdminOtp';
import { parseBackendTimestamp } from '@/shared/utils/date.utils';

function resolveOtpError(
  error: string | null,
  t: (typeof authTranslations)['ar']['otp'],
): string | null {
  if (!error) return null;
  if (error === 'invalidCode') return t.invalidCode;
  if (error === 'resendFailed') return t.resendFailed;
  if (error === 'mailSendFailed') return t.mailSendFailed;
  if (error === 'resendTooSoon') return t.resendTooSoon;
  return error;
}

export function AdminOtpPage() {
  const { lang } = useLang();
  const t  = authTranslations[lang].otp;

  const {
    otp, setOtp,
    expiresAt,
    error, info,
    isVerifying,
    isResending,
    cooldown,
    submit, resend,
    goBack,
  } = useAdminOtp();

  const errorMessage = resolveOtpError(error, t);

  const formattedExpiry = expiresAt
    ? parseBackendTimestamp(expiresAt).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        hour:   '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      noValidate
      className="w-full space-y-5"
    >
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
          <ShieldCheck size={26} className="text-brand-600" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">{t.title}</h2>
        <p className="mt-2 text-sm text-gray-500">{t.subtitle}</p>
      </div>

      {/* Info / error banners */}
      {info && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          {t.resent}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* OTP input */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          {t.codeLabel}
          <span className="text-red-500 ms-0.5">*</span>
        </label>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder={t.placeholder}
          dir="ltr"
          autoFocus
          className="w-full rounded-lg border border-gray-300 bg-white py-3 text-center text-2xl
                     font-semibold tracking-[0.5em] outline-none focus:border-brand-500
                     focus:ring-2 focus:ring-brand-500/20 transition placeholder:tracking-normal
                     placeholder:text-gray-300"
        />
        {formattedExpiry && (
          <p className="mt-1 text-xs text-gray-400">{t.expiresLabel}: {formattedExpiry}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={isVerifying}
        disabled={otp.length < 6}
      >
        {isVerifying ? t.verifying : t.submit}
      </Button>

      {/* Resend */}
      <p className="text-center text-sm text-gray-500">
        {t.resendPrompt}{' '}
        {cooldown > 0 ? (
          <span className="text-gray-400">{t.resendIn.replace('{s}', String(cooldown))}</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={isResending}
            className="text-brand-600 font-medium hover:text-brand-700 transition-colors disabled:opacity-50"
          >
            {isResending ? t.verifying : t.resend}
          </button>
        )}
      </p>

      {/* Back */}
      <p className="text-center">
        <button
          type="button"
          onClick={goBack}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          {t.back}
        </button>
      </p>
    </form>
  );
}
