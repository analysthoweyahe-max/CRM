import { useSearchParams } from 'react-router-dom';
import { SetPasswordForm }      from '@/modules/auth/components/SetPasswordForm';
import { InviteExpiredBanner }  from '@/modules/auth/components/InviteExpiredBanner';
import { useValidateInvite }    from '@/modules/auth/hooks/useValidateInvite';
import { useLang }              from '@/app/providers/LanguageProvider';
import { authTranslations }     from '@/modules/auth/i18n';
import { LoadingSpinner }       from '@/shared/components/feedback/LoadingSpinner';

export function SetPasswordPage() {
  const [params] = useSearchParams();
  const token    = params.get('token') ?? '';

  const { status, payload } = useValidateInvite(token);
  const { lang }            = useLang();
  const t                   = authTranslations[lang].invite;

  if (status === 'loading') {
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
    />
  );
}
