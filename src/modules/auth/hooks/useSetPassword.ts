import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import type { SetPasswordFormValues } from '@/modules/auth/schemas/setPassword.schema';
import { DEFAULT_AFTER_LOGIN } from '@/app/config/constants';

export function useSetPassword(
  inviteToken: string,
  rememberMe  = false,
  inviteType: 'admin' | 'employee' = 'employee',
) {
  const { setPassword } = useAuth();
  const navigate        = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function submit(values: SetPasswordFormValues) {
    setError(null);
    try {
      await setPassword({ token: inviteToken, rememberMe, inviteType, ...values });
      navigate(DEFAULT_AFTER_LOGIN, { replace: true });
    } catch {
      setError('setPasswordFailed');
    }
  }

  return { submit, error };
}
