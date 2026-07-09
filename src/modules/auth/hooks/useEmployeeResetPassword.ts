import { useNavigate } from 'react-router-dom';
import type { UseFormSetError } from 'react-hook-form';
import { ROUTES } from '@/app/router/routes';
import { authService } from '@/modules/auth/services/auth.service';
import { useForgotPasswordState } from '@/modules/auth/context/ForgotPasswordContext';
import type { EmployeeResetPasswordFormValues } from '@/modules/auth/schemas/employeeResetPassword.schema';
import {
  extractApiError,
  extractApiFieldErrors,
  extractApiStatus,
  hasTokenValidationError,
} from '@/shared/utils/error.utils';

export function useEmployeeResetPassword(resetToken: string) {
  const navigate = useNavigate();
  const { clearAll } = useForgotPasswordState();

  async function submit(
    values: EmployeeResetPasswordFormValues,
    setFieldError?: UseFormSetError<EmployeeResetPasswordFormValues>,
  ): Promise<string | null> {
    try {
      await authService.resetEmployeePasswordOtp({
        token:           resetToken,
        password:        values.password,
        confirmPassword: values.confirmPassword,
      });
      /* Navigate before clearing state — clearing first triggers the reset-page
         guard and sends the user back to forgot-password instead of login. */
      navigate(`${ROUTES.AUTH.LOGIN}?reset=1`, { replace: true });
      return null;
    } catch (err: unknown) {
      if (hasTokenValidationError(err) || extractApiStatus(err) === 422) {
        const fieldErrors = extractApiFieldErrors(err);
        if (fieldErrors.token) {
          clearAll();
          navigate(ROUTES.AUTH.FORGOT_PASSWORD, { replace: true });
          return null;
        }
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
        if (hasFieldError) return null;
      }

      if (hasTokenValidationError(err)) {
        clearAll();
        navigate(ROUTES.AUTH.FORGOT_PASSWORD, { replace: true });
        return null;
      }

      return extractApiError(err) || 'resetPasswordFailed';
    }
  }

  return { submit };
}
