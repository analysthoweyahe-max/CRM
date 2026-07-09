import { useEffect, useState } from 'react';
import { authService } from '@/modules/auth/services/auth.service';
import type { PasswordResetTokenPayload } from '@/modules/auth/types/auth.types';

type Status = 'loading' | 'valid' | 'expired';

export function useValidateResetToken(token: string) {
  const [status,  setStatus]  = useState<Status>('loading');
  const [payload, setPayload] = useState<PasswordResetTokenPayload | null>(null);

  useEffect(() => {
    if (!token) { setStatus('expired'); return; }

    authService
      .validateResetToken(token)
      .then((data) => { setPayload(data); setStatus('valid'); })
      .catch(()    => { setStatus('expired'); });
  }, [token]);

  return { status, payload };
}
