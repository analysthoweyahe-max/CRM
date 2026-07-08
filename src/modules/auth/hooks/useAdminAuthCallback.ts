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
 * The backend verifies the magic-link token itself and 302-redirects here with
 * the finished accessToken + redirect_path already in the query string — this
 * page never calls an API, it just consumes the redirect.
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
    completeMagicLogin(token);
    window.history.replaceState({}, '', window.location.pathname); // strip token from the URL
    navigate(redirectPath, { replace: true });
  }, [params, completeMagicLogin, navigate]);

  return { status };
}
