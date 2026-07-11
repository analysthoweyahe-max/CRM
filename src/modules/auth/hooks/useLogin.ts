import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import type { LoginFormValues } from '@/modules/auth/schemas/login.schema';
import { ROUTES } from '@/app/router/routes';
import { extractApiError, extractApiFieldErrors } from '@/shared/utils/error.utils';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import type { Role } from '@/shared/types/role.types';

function redirectForRole(role: Role): string {
  if (role === 'admin')       return ROUTES.ADMIN.DASHBOARD;
  if (role === 'employee')    return ROUTES.EMPLOYEE.DASHBOARD;
  if (role === 'seo-member')  return ROUTES.SEO_MEMBER.DASHBOARD;
  if (role === 'manager')     return ROUTES.PROJECT_MANAGER.DASHBOARD;
  if (role === 'seo-leader')  return ROUTES.SEO_LEADER.DASHBOARD;
  return ROUTES.DASHBOARD;
}

function resolveRedirect(redirectPath: string | undefined, user: AuthUser): string {
  if (redirectPath?.startsWith('/')) return redirectPath;
  if (user.actor === 'admin' && (user.role === 'admin' || user.isSuperAdmin)) {
    return ROUTES.ADMIN.DASHBOARD;
  }
  return redirectForRole(user.role);
}

function extractLoginError(err: unknown): string {
  const fields = extractApiFieldErrors(err);
  return fields.admin_id
    || fields.adminId
    || fields.password
    || extractApiError(err)
    || 'invalidCredentials';
}

export function useLogin() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function submit(values: LoginFormValues) {
    setError(null);
    const rememberMe = values.rememberMe ?? false;
    try {
      const result = await login({ ...values, rememberMe });
      if (result.status !== 'success') {
        setError('invalidCredentials');
        return;
      }
      navigate(resolveRedirect(result.redirectPath, result.user), { replace: true });
    } catch (err) {
      setError(extractLoginError(err));
    }
  }

  return { submit, error };
}
