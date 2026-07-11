import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { authService } from '@/modules/auth/services/auth.service';
import { ROUTES } from '@/app/router/routes';
import {
  clearAdminOtpChallenge,
  patchAdminOtpChallenge,
  readAdminOtpChallenge,
} from '@/modules/auth/utils/adminOtpChallenge.store';
import {
  extractApiError,
  extractApiStatus,
} from '@/shared/utils/error.utils';
import type { Role } from '@/shared/types/role.types';

interface OtpLocationState {
  adminId?:    string;
  expiresAt?:  string;
  rememberMe?: boolean;
}

const RESEND_COOLDOWN = 30; // seconds

function redirectForRole(role: Role): string {
  if (role === 'admin')       return ROUTES.ADMIN.DASHBOARD;
  if (role === 'hr')          return ROUTES.DASHBOARD;
  if (role === 'employee')    return ROUTES.EMPLOYEE.DASHBOARD;
  if (role === 'seo-member')  return ROUTES.SEO_MEMBER.DASHBOARD;
  if (role === 'manager')     return ROUTES.PROJECT_MANAGER.DASHBOARD;
  if (role === 'seo-leader')  return ROUTES.SEO_LEADER.DASHBOARD;
  return ROUTES.ADMIN.DASHBOARD;
}

function resolveRedirect(redirectPath: string | undefined, role: Role): string {
  if (redirectPath?.startsWith('/')) return redirectPath;
  return redirectForRole(role);
}

export function useAdminOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();

  const stored = readAdminOtpChallenge();
  const state = (location.state ?? {}) as OtpLocationState;

  const [adminId, setAdminId]       = useState(state.adminId ?? stored?.adminId ?? '');
  const rememberMe                  = state.rememberMe ?? stored?.rememberMe ?? false;
  const [expiresAt, setExpires]     = useState(state.expiresAt ?? stored?.expiresAt ?? '');
  const [otp, setOtp]               = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [info, setInfo]             = useState<string | null>(null);
  const [isVerifying, setVerifying] = useState(false);
  const [isResending, setResending] = useState(false);
  const [cooldown, setCooldown]     = useState(0);

  useEffect(() => {
    if (!adminId) navigate(ROUTES.AUTH.LOGIN, { replace: true });
  }, [adminId, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function submit() {
    if (isVerifying || otp.trim().length < 6) return;
    setError(null);
    setInfo(null);
    setVerifying(true);
    try {
      const { user, redirectPath } = await verifyOtp(adminId, otp.trim(), rememberMe);
      clearAdminOtpChallenge();
      navigate(resolveRedirect(redirectPath, user.role), { replace: true });
    } catch (err: unknown) {
      const status = extractApiStatus(err);
      if (status === 422 || status === 401) {
        setError('invalidCode');
      } else {
        setError(extractApiError(err) || 'invalidCode');
      }
      setVerifying(false);
    }
  }

  async function resend() {
    if (cooldown > 0 || isResending || !adminId) return;
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      const result = await authService.resendAdminOtp(adminId);
      if (result.adminId && result.adminId !== adminId) {
        setAdminId(result.adminId);
      }
      if (result.expiresAt) {
        setExpires(result.expiresAt);
      }
      patchAdminOtpChallenge({
        adminId:   result.adminId || adminId,
        expiresAt: result.expiresAt || expiresAt,
      });
      setOtp('');
      setInfo('resent');
      setCooldown(RESEND_COOLDOWN);
    } catch (err: unknown) {
      const status = extractApiStatus(err);
      if (status === 503) {
        setError('mailSendFailed');
      } else if (status === 429) {
        setError('resendTooSoon');
      } else {
        setError(extractApiError(err) || 'resendFailed');
      }
    } finally {
      setResending(false);
    }
  }

  function goBack() {
    clearAdminOtpChallenge();
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  }

  return {
    otp, setOtp,
    expiresAt,
    error, info,
    isVerifying,
    isResending,
    cooldown,
    submit, resend,
    goBack,
  };
}
