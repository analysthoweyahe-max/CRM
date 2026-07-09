import { ResetPasswordForm } from '@/modules/auth/components/ResetPasswordForm';
import { InviteExpiredBanner } from '@/modules/auth/components/InviteExpiredBanner';
import { useValidateResetToken } from '@/modules/auth/hooks/useValidateResetToken';
import { useInviteToken } from '@/modules/auth/hooks/useInviteToken';
import { useLang } from '@/app/providers/LanguageProvider';
import { authTranslations } from '@/modules/auth/i18n';
import { ROUTES } from '@/app/router/routes';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';

export function ResetPasswordPage() {
  const token               = useInviteToken();
  const { status, payload } = useValidateResetToken(token);
  const { lang }            = useLang();
  const tr                  = authTranslations[lang].resetPassword;

  if (!token) {
    return (
      <InviteExpiredBanner
        title={tr.invalidTitle}
        desc={tr.invalidDesc}
      />
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <LoadingSpinner size={28} />
        <p className="text-sm text-gray-500">{tr.validating}</p>
      </div>
    );
  }

  if (status === 'expired' || !payload) {
    return (
      <InviteExpiredBanner
        title={tr.expiredTitle}
        desc={tr.expiredDesc}
        actionTo={ROUTES.AUTH.FORGOT_PASSWORD}
        actionLabel={tr.requestNewLink}
      />
    );
  }

  return (
    <ResetPasswordForm
      resetToken={token}
      actorType={payload.actorType}
      userName={payload.name}
      userEmail={payload.email}
    />
  );
}
