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

  useEffect(() => {
    if (!resetToken) {
      navigate(
        email ? ROUTES.AUTH.FORGOT_PASSWORD_VERIFY : ROUTES.AUTH.FORGOT_PASSWORD,
        { replace: true },
      );
    }
  }, [resetToken, email, navigate]);

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
