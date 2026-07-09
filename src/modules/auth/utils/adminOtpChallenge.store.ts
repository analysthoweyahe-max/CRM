export interface AdminOtpChallenge {
  adminId:    string;
  expiresAt:  string;
  rememberMe: boolean;
  identifier: string;
  password:   string;
}

const STORAGE_KEY = 'hr_admin_otp_challenge';

export function saveAdminOtpChallenge(challenge: AdminOtpChallenge): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
  } catch {
    // sessionStorage unavailable
  }
}

export function readAdminOtpChallenge(): AdminOtpChallenge | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminOtpChallenge;
    if (!parsed?.adminId || !parsed?.identifier || !parsed?.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearAdminOtpChallenge(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // sessionStorage unavailable
  }
}

export function patchAdminOtpChallenge(patch: Partial<AdminOtpChallenge>): void {
  const current = readAdminOtpChallenge();
  if (!current) return;
  saveAdminOtpChallenge({ ...current, ...patch });
}
