import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { authService } from '@/modules/auth/services/auth.service';
import { ROUTES } from '@/app/router/routes';
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

  const state = (location.state ?? {}) as OtpLocationState;
  const adminId    = state.adminId ?? '';
  const rememberMe = state.rememberMe ?? false;

  const [otp, setOtp]           = useState('');
  const [expiresAt, setExpires] = useState(state.expiresAt ?? '');
  const [error, setError]       = useState<string | null>(null);
  const [info, setInfo]         = useState<string | null>(null);
  const [isVerifying, setVerifying] = useState(false);
  const [cooldown, setCooldown]     = useState(0);

  // No admin context (e.g. page opened directly) → back to login.
  useEffect(() => {
    if (!adminId) navigate(ROUTES.AUTH.LOGIN, { replace: true });
  }, [adminId, navigate]);

  // Resend cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function submit() {
    if (isVerifying || otp.trim().length < 4) return;
    setError(null);
    setInfo(null);
    setVerifying(true);
    try {
      const { user, redirectPath } = await verifyOtp(adminId, otp.trim(), rememberMe);
      navigate(resolveRedirect(redirectPath, user.role), { replace: true });
    } catch {
      setError('invalidCode');
      setVerifying(false);
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    setError(null);
    setInfo(null);
    try {
      const newExpiry = await authService.resendAdminOtp(adminId);
      if (newExpiry) setExpires(newExpiry);
      setInfo('resent');
      setCooldown(RESEND_COOLDOWN);
    } catch {
      setError('invalidCode');
    }
  }

  return {
    otp, setOtp,
    expiresAt,
    error, info,
    isVerifying,
    cooldown,
    submit, resend,
    goBack: () => navigate(ROUTES.AUTH.LOGIN, { replace: true }),
  };
}
