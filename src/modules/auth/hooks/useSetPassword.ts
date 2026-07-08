import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/routes';
import { authService } from '@/modules/auth/services/auth.service';
import type { SetPasswordFormValues } from '@/modules/auth/schemas/setPassword.schema';

export function useSetPassword(
  inviteToken: string,
  inviteType: 'admin' | 'employee' = 'employee',
) {
  const navigate        = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function submit(values: SetPasswordFormValues) {
    setError(null);
    try {
      await authService.activateInvite({
        token:           inviteToken,
        password:        values.password,
        confirmPassword: values.confirmPassword,
        inviteType,
      });
      navigate(`${ROUTES.AUTH.LOGIN}?activated=1`, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'setPasswordFailed');
    }
  }

  return { submit, error };
}
