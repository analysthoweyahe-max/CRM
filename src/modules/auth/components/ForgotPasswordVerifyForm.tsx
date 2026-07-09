import { ShieldCheck } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { authTranslations } from '@/modules/auth/i18n';
import { Button } from '@/shared/components/ui/Button';
import { useForgotPasswordVerify } from '@/modules/auth/hooks/useForgotPasswordVerify';

export function ForgotPasswordVerifyForm() {
  const { lang } = useLang();
  const t = authTranslations[lang].forgotPasswordVerify;

  const {
    email,
    otp,
    handleOtpChange,
    handleOtpPaste,
    expiresAt,
    codeError,
    error,
    info,
    isVerifying,
    cooldown,
    submit,
    resend,
    goBack,
  } = useForgotPasswordVerify();

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        hour:   '2-digit',
        minute: '2-digit',
      })
    : null;

  const displayError = (() => {
    if (codeError) return codeError;
    if (error === 'mailSendFailed') return t.mailSendFailed;
    if (error === 'invalidCode') return t.invalidCode;
    if (error === 'resendFailed') {
      return lang === 'ar' ? 'تعذّر إعادة الإرسال. حاول مرة أخرى.' : 'Could not resend the code. Please try again.';
    }
    return error;
  })();

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      noValidate
      className="w-full space-y-5"
    >
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
          <ShieldCheck size={26} className="text-brand-600" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">{t.title}</h2>
        <p className="mt-2 text-sm text-gray-500">{t.subtitle}</p>
        {email && (
          <p className="mt-1 text-sm font-medium text-gray-700" dir="ltr">{email}</p>
        )}
      </div>

      {info && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {t.resent}
        </div>
      )}
      {displayError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {displayError}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          {t.codeLabel}
          <span className="text-red-500 ms-0.5">*</span>
        </label>
        <input
          value={otp}
          onChange={(e) => handleOtpChange(e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            handleOtpPaste(e.clipboardData.getData('text'));
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder={t.placeholder}
          dir="ltr"
          autoFocus
          className={`w-full rounded-lg border bg-white py-3 text-center text-2xl
                     font-semibold tracking-[0.5em] outline-none focus:border-brand-500
                     focus:ring-2 focus:ring-brand-500/20 transition placeholder:tracking-normal
                     placeholder:text-gray-300 ${codeError ? 'border-red-300' : 'border-gray-300'}`}
        />
        {formattedExpiry && (
          <p className="mt-1 text-xs text-gray-400">{t.expiresLabel}: {formattedExpiry}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={isVerifying}
        disabled={otp.length !== 6}
      >
        {isVerifying ? t.verifying : t.submit}
      </Button>

      <div className="text-center text-sm text-gray-500">
        <span>{t.resendPrompt} </span>
        {cooldown > 0 ? (
          <span className="text-gray-400">
            {t.resendIn.replace('{s}', String(cooldown))}
          </span>
        ) : (
          <button
            type="button"
            onClick={resend}
            className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            {t.resend}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={goBack}
        className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        {t.back}
      </button>
    </form>
  );
}
