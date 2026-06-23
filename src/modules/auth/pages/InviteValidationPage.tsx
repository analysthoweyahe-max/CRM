import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/app/router/routes';

export function InviteValidationPage() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const token     = params.get('token');

  useEffect(() => {
    if (token) {
      navigate(`${ROUTES.AUTH.SET_PASSWORD}?token=${token}`, { replace: true });
    } else {
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    }
  }, [token, navigate]);

  return null;
}
