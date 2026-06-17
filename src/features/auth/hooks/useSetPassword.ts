import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { SetPasswordFormValues } from '@/features/auth/schemas/setPassword.schema';
import { DEFAULT_AFTER_LOGIN } from '@/app/config/constants';

export function useSetPassword(inviteToken: string) {
  const { setPassword } = useAuth();
  const navigate        = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function submit(values: SetPasswordFormValues) {
    setError(null);
    try {
      await setPassword({ token: inviteToken, ...values });
      navigate(DEFAULT_AFTER_LOGIN, { replace: true });
    } catch {
      setError('setPasswordFailed');
    }
  }

  return { submit, error };
}
