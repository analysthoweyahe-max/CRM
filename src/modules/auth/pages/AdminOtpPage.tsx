import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/routes';
import { clearAdminOtpChallenge } from '@/modules/auth/utils/adminOtpChallenge.store';

/** OTP login was removed — unified login returns the token directly. */
export function AdminOtpPage() {
  const navigate = useNavigate();

  useEffect(() => {
    clearAdminOtpChallenge();
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  }, [navigate]);

  return null;
}
