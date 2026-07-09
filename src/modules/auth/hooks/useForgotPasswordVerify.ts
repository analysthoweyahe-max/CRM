import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/routes';
import { authService } from '@/modules/auth/services/auth.service';
import { useForgotPasswordState } from '@/modules/auth/context/ForgotPasswordContext';
import {
  extractApiError,
  extractApiFieldErrors,
  extractApiStatus,
} from '@/shared/utils/error.utils';

const RESEND_COOLDOWN = 60;

export function useForgotPasswordVerify() {
  const navigate = useNavigate();
  const { state, setEmailStep, setResetToken } = useForgotPasswordState();

  const email = state?.email ?? '';

  const [otp, setOtp]               = useState('');
  const [expiresAt, setExpiresAt]   = useState(state?.expiresAt ?? '');
  const [codeError, setCodeError]   = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [info, setInfo]             = useState(false);
  const [isVerifying, setVerifying] = useState(false);
  const [cooldown, setCooldown]     = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (!email) {
      navigate(ROUTES.AUTH.FORGOT_PASSWORD, { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (state?.expiresAt) setExpiresAt(state.expiresAt);
  }, [state?.expiresAt]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  function handleOtpChange(value: string) {
    setOtp(value.replace(/\D/g, '').slice(0, 6));
    setCodeError(null);
    setError(null);
  }

  function handleOtpPaste(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 6);
    if (digits) {
      setOtp(digits);
      setCodeError(null);
      setError(null);
    }
  }

  async function submit() {
    if (isVerifying || otp.length !== 6 || !email) return;
    setError(null);
    setCodeError(null);
    setInfo(false);
    setVerifying(true);
    try {
      const token = await authService.verifyEmployeeResetOtp(email, otp);
      setResetToken(token);
      navigate(ROUTES.AUTH.RESET_PASSWORD, { replace: true });
    } catch (err: unknown) {
      const status = extractApiStatus(err);
      if (status === 422) {
        const fieldErrors = extractApiFieldErrors(err);
        const otpError = fieldErrors.code ?? fieldErrors.otp;
        if (otpError) {
          setCodeError(otpError);
          return;
        }
      }
      setError(extractApiError(err) || 'invalidCode');
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    if (cooldown > 0 || !email) return;
    setError(null);
    setCodeError(null);
    setInfo(false);
    try {
      const newExpiry = await authService.requestEmployeeResetOtp(email);
      if (newExpiry) {
        setExpiresAt(newExpiry);
        setEmailStep(email, newExpiry);
      }
      setOtp('');
      setInfo(true);
      setCooldown(RESEND_COOLDOWN);
    } catch (err: unknown) {
      const status = extractApiStatus(err);
      if (status === 503) {
        setError('mailSendFailed');
        return;
      }
      setError(extractApiError(err) || 'resendFailed');
    }
  }

  return {
    email,
    otp,
    handleOtpChange,
    handleOtpPaste,
    expiresAt,
    codeError,
    error,
    info,
    isVerifying,
    cooldown,
    submit,
    resend,
    goBack: () => navigate(ROUTES.AUTH.FORGOT_PASSWORD),
  };
}
