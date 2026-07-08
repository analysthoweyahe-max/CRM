import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { ROUTES } from '@/app/router/routes';

type Status = 'processing' | 'invalid';

function safeRedirectPath(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return ROUTES.ADMIN.DASHBOARD;
}

/**
 * The super-admin email link carries a one-time magic-login token. This page
 * exchanges it for a real session (via the backend) and, on success, drops the
 * admin straight into the dashboard.
 */
export function useAdminAuthCallback() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const { completeMagicLogin } = useAuth();
  const [status, setStatus] = useState<Status>('processing');
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const token = params.get('token');
    const error = params.get('error');

    if (!token || error) {
      setStatus('invalid');
      return;
    }

    const redirectPath = safeRedirectPath(params.get('redirect_path'));

    completeMagicLogin(token)
      .then(() => {
        window.history.replaceState({}, '', window.location.pathname); // strip token from the URL
        navigate(redirectPath, { replace: true });
      })
      .catch(() => {
        setStatus('invalid');
      });
  }, [params, completeMagicLogin, navigate]);

  return { status };
}
