import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UseFormSetError } from 'react-hook-form';
import { ROUTES } from '@/app/router/routes';
import { authService } from '@/modules/auth/services/auth.service';
import type { SetPasswordFormValues } from '@/modules/auth/schemas/setPassword.schema';
import {
  extractApiError,
  extractApiFieldErrors,
  extractApiStatus,
  hasTokenValidationError,
} from '@/shared/utils/error.utils';

export function useResetPassword(token: string) {
  const navigate          = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function submit(
    values: SetPasswordFormValues,
    setFieldError?: UseFormSetError<SetPasswordFormValues>,
  ) {
    setError(null);
    try {
      await authService.resetPassword({
        token,
        password:        values.password,
        confirmPassword: values.confirmPassword,
        actorType:       'admin',
      });
      navigate(`${ROUTES.AUTH.LOGIN}?reset=1`, { replace: true });
    } catch (err: unknown) {
      if (hasTokenValidationError(err)) {
        navigate(ROUTES.AUTH.FORGOT_PASSWORD, { replace: true });
        return;
      }

      if (extractApiStatus(err) === 422 && setFieldError) {
        const fieldErrors = extractApiFieldErrors(err);
        let hasFieldError = false;

        if (fieldErrors.password) {
          setFieldError('password', { message: fieldErrors.password });
          hasFieldError = true;
        }
        if (fieldErrors.confirmPassword) {
          setFieldError('confirmPassword', { message: fieldErrors.confirmPassword });
          hasFieldError = true;
        }
        if (hasFieldError) return;
      }

      setError(extractApiError(err) || 'resetPasswordFailed');
    }
  }

  return { submit, error };
}
