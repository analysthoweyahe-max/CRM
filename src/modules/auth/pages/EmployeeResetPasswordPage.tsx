import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeResetPasswordForm } from '@/modules/auth/components/EmployeeResetPasswordForm';
import { useForgotPasswordState } from '@/modules/auth/context/ForgotPasswordContext';
import { ROUTES } from '@/app/router/routes';

export function EmployeeResetPasswordPage() {
  const navigate = useNavigate();
  const { state, clearResetToken } = useForgotPasswordState();

  const resetToken = state?.resetToken ?? '';
  const email      = state?.email ?? '';

  /* Guard direct access only — do not re-run when resetToken is cleared during submit. */
  useEffect(() => {
    if (resetToken) return;
    navigate(
      email ? ROUTES.AUTH.FORGOT_PASSWORD_VERIFY : ROUTES.AUTH.FORGOT_PASSWORD,
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!resetToken) return null;

  return (
    <EmployeeResetPasswordForm
      resetToken={resetToken}
      userEmail={email}
      onBack={() => {
        clearResetToken();
        navigate(ROUTES.AUTH.FORGOT_PASSWORD_VERIFY);
      }}
    />
  );
}
