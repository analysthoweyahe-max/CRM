import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import { SetPasswordForm }      from '@/modules/auth/components/SetPasswordForm';
import { InviteExpiredBanner }  from '@/modules/auth/components/InviteExpiredBanner';
import { useValidateInvite }    from '@/modules/auth/hooks/useValidateInvite';
import { useInviteToken }       from '@/modules/auth/hooks/useInviteToken';
import { useAuth }              from '@/modules/auth/context/AuthContext';
import { useLang }              from '@/app/providers/LanguageProvider';
import { authTranslations }     from '@/modules/auth/i18n';
import { LoadingSpinner }       from '@/shared/components/feedback/LoadingSpinner';
import { ROUTES }               from '@/app/router/routes';

// Password reset is handled through the same invitation "set-password" flow:
// the emailed link carries a token (path param or `?token=`), which we validate
// and then let the user set a new password via /invitations/{token}/set-password.
export function ForgotPasswordPage() {
  const token               = useInviteToken();
  const { status, payload } = useValidateInvite(token);
  const { lang, isRTL }     = useLang();
  const t                   = authTranslations[lang].invite;
  const tr                  = authTranslations[lang].resetPassword;
  const { completeInviteLogin } = useAuth();
  const navigate             = useNavigate();

  // Already-activated token: the backend hands back a finished token instead of
  // asking for a new password — log the user straight in.
  const alreadyActivated = status === 'valid' && !!payload?.accessToken;

  useEffect(() => {
    if (!alreadyActivated || !payload?.accessToken) return;
    completeInviteLogin(payload.accessToken, payload.inviteType);
    navigate(payload.redirectPath && payload.redirectPath.startsWith('/') ? payload.redirectPath : ROUTES.DASHBOARD, { replace: true });
  }, [alreadyActivated, payload, completeInviteLogin, navigate]);

  // No token means the user opened this page directly (e.g. via the login
  // "forgot password" link) rather than from an emailed reset link. There's no
  // self-service reset endpoint, so guide them to request one instead of
  // showing the misleading "link expired" error.
  if (!token) {
    const BackIcon = isRTL ? ArrowRight : ArrowLeft;
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-50 border-2 border-brand-200 flex items-center justify-center mx-auto">
            <KeyRound size={30} className="text-brand-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{tr.noTokenTitle}</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">{tr.noTokenDesc}</p>
          </div>
        </div>

        <Link
          to={ROUTES.AUTH.LOGIN}
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          <BackIcon size={16} />
          {tr.backToLogin}
        </Link>
      </div>
    );
  }

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
