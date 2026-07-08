import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/routes';
import { useInviteToken } from '@/modules/auth/hooks/useInviteToken';

export function InviteValidationPage() {
  const token    = useInviteToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate(ROUTES.AUTH.SET_PASSWORD_TOKEN(token), { replace: true });
    } else {
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    }
  }, [token, navigate]);

  return null;
}
