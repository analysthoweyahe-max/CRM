import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import type { LoginFormValues } from '@/modules/auth/schemas/login.schema';
import { DEFAULT_AFTER_LOGIN } from '@/app/config/constants';

export function useLogin() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function submit(values: LoginFormValues) {
    setError(null);
    try {
      await login({ ...values, rememberMe: values.rememberMe ?? false });
      navigate(DEFAULT_AFTER_LOGIN, { replace: true });
    } catch {
      setError('invalidCredentials');
    }
  }

  return { submit, error };
}
