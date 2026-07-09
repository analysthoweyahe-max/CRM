import { useNavigate } from 'react-router-dom';
import type { UseFormSetError } from 'react-hook-form';
import { ROUTES } from '@/app/router/routes';
import { authService } from '@/modules/auth/services/auth.service';
import { useForgotPasswordState } from '@/modules/auth/context/ForgotPasswordContext';
import type { ForgotPasswordFormValues } from '@/modules/auth/schemas/forgotPassword.schema';
import {
  extractApiError,
  extractApiFieldErrors,
  extractApiStatus,
} from '@/shared/utils/error.utils';

export function useForgotPassword() {
  const navigate = useNavigate();
  const { setEmailStep } = useForgotPasswordState();

  async function submit(
    values: ForgotPasswordFormValues,
    setFieldError?: UseFormSetError<ForgotPasswordFormValues>,
  ): Promise<string | null> {
    try {
      const expiresAt = await authService.requestEmployeeResetOtp(values.email);
      setEmailStep(values.email, expiresAt);
      navigate(ROUTES.AUTH.FORGOT_PASSWORD_VERIFY, { replace: true });
      return null;
    } catch (err: unknown) {
      const status = extractApiStatus(err);

      if (status === 422 && setFieldError) {
        const fieldErrors = extractApiFieldErrors(err);
        if (fieldErrors.email) {
          setFieldError('email', { message: fieldErrors.email });
          return null;
        }
      }

      if (status === 503) {
        return 'mailSendFailed';
      }

      return extractApiError(err) || 'forgotPasswordFailed';
    }
  }

  return { submit };
}
