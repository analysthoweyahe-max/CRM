import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SetPasswordForm }      from '@/modules/auth/components/SetPasswordForm';
import { InviteExpiredBanner }  from '@/modules/auth/components/InviteExpiredBanner';
import { useValidateInvite }    from '@/modules/auth/hooks/useValidateInvite';
import { useInviteToken }       from '@/modules/auth/hooks/useInviteToken';
import { useAuth }              from '@/modules/auth/context/AuthContext';
import { useLang }              from '@/app/providers/LanguageProvider';
import { authTranslations }     from '@/modules/auth/i18n';
import { LoadingSpinner }       from '@/shared/components/feedback/LoadingSpinner';
import { ROUTES }               from '@/app/router/routes';

export function SetPasswordPage() {
  const token               = useInviteToken();
  const { status, payload } = useValidateInvite(token);
  const { lang }            = useLang();
  const t                   = authTranslations[lang].invite;
  const { completeInviteLogin } = useAuth();
  const navigate             = useNavigate();

  // Already-activated invite: the backend hands back a finished token instead
  // of asking for a new password — log the user straight in.
  const alreadyActivated = status === 'valid' && !!payload?.accessToken;

  useEffect(() => {
    if (!alreadyActivated || !payload?.accessToken) return;
    const profile = payload.inviteType === 'admin' ? payload.admin : payload.employee;
    completeInviteLogin(payload.accessToken, payload.inviteType, profile)
      .then(() => {
        navigate(
          payload.redirectPath?.startsWith('/') ? payload.redirectPath : ROUTES.DASHBOARD,
          { replace: true },
        );
      });
  }, [alreadyActivated, payload, completeInviteLogin, navigate]);

  if (status === 'loading' || alreadyActivated) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <LoadingSpinner size={28} />
        <p className="text-sm text-gray-500">{t.validating}</p>
      </div>
    );
  }

  if (status === 'expired' || !payload) {
    return <InviteExpiredBanner />;
  }

  return (
    <SetPasswordForm
      inviteToken={token}
      inviteType={payload.inviteType}
      inviteeName={payload.name}
      inviteeEmail={payload.email}
    />
  );
}
