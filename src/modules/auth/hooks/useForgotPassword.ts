import { useState } from 'react';
import type { UseFormSetError } from 'react-hook-form';
import { authService } from '@/modules/auth/services/auth.service';
import type { ForgotPasswordFormValues } from '@/modules/auth/schemas/forgotPassword.schema';
import {
  extractApiError,
  extractApiFieldErrors,
  extractApiStatus,
} from '@/shared/utils/error.utils';

export function useForgotPassword() {
  const [error, setError]       = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit(
    values: ForgotPasswordFormValues,
    setFieldError?: UseFormSetError<ForgotPasswordFormValues>,
  ) {
    setError(null);
    try {
      await authService.requestPasswordReset(values.email);
      setSubmitted(true);
    } catch (err: unknown) {
      const status = extractApiStatus(err);

      if (status === 422 && setFieldError) {
        const fieldErrors = extractApiFieldErrors(err);
        if (fieldErrors.email) {
          setFieldError('email', { message: fieldErrors.email });
          return;
        }
      }

      const msg = extractApiError(err);
      setError(msg || 'forgotPasswordFailed');
    }
  }

  return { submit, error, submitted };
}
