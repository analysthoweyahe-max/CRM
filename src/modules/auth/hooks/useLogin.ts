import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import type { LoginFormValues } from '@/modules/auth/schemas/login.schema';
import { ROUTES } from '@/app/router/routes';
import { saveAdminOtpChallenge } from '@/modules/auth/utils/adminOtpChallenge.store';
import type { Role } from '@/shared/types/role.types';

function redirectForRole(role: Role): string {
  if (role === 'admin')       return ROUTES.ADMIN.DASHBOARD;
  if (role === 'employee')    return ROUTES.EMPLOYEE.DASHBOARD;
  if (role === 'seo-member')  return ROUTES.SEO_MEMBER.DASHBOARD;
  if (role === 'manager')     return ROUTES.PROJECT_MANAGER.DASHBOARD;
  if (role === 'seo-leader')  return ROUTES.SEO_LEADER.DASHBOARD;
  return ROUTES.DASHBOARD;
}

function resolveRedirect(redirectPath: string | undefined, role: Role): string {
  if (redirectPath?.startsWith('/')) return redirectPath;
  return redirectForRole(role);
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
      if (result.status === 'otp_required') {
        saveAdminOtpChallenge({
          adminId:    result.adminId,
          expiresAt:  result.expiresAt,
          rememberMe,
          identifier: values.adminId.trim(),
          password:   values.password,
        });
        navigate(ROUTES.AUTH.ADMIN_OTP, {
          replace: true,
          state: { adminId: result.adminId, expiresAt: result.expiresAt, rememberMe },
        });
        return;
      }
      navigate(resolveRedirect(result.redirectPath, result.user.role), { replace: true });
    } catch {
      setError('invalidCredentials');
    }
  }

  return { submit, error };
}
