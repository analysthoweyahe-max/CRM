import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import type { LoginFormValues } from '@/modules/auth/schemas/login.schema';
import { ROUTES } from '@/app/router/routes';

function redirectForRole(role: string): string {
  if (role === 'admin')       return ROUTES.ADMIN.DASHBOARD;
  if (role === 'employee')    return ROUTES.EMPLOYEE.DASHBOARD;
  if (role === 'seo-member')  return ROUTES.SEO_MEMBER.DASHBOARD;
  if (role === 'manager')     return ROUTES.PROJECT_MANAGER.DASHBOARD;
  if (role === 'seo-leader')  return ROUTES.SEO_LEADER.DASHBOARD;
  return ROUTES.DASHBOARD;
}

export function useLogin() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function submit(values: LoginFormValues) {
    setError(null);
    try {
      const user = await login({ ...values, rememberMe: values.rememberMe ?? false });
      navigate(redirectForRole(user.role), { replace: true });
    } catch {
      setError('invalidCredentials');
    }
  }

  return { submit, error };
}
