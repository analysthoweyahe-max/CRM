import { useEffect, useState } from 'react';
import { authService } from '@/modules/auth/services/auth.service';
import type { InviteTokenPayload } from '@/modules/auth/types/auth.types';

type Status = 'loading' | 'valid' | 'expired';

export function useValidateInvite(token: string) {
  const [status,  setStatus]  = useState<Status>('loading');
  const [payload, setPayload] = useState<InviteTokenPayload | null>(null);

  useEffect(() => {
    if (!token) { setStatus('expired'); return; }

    authService
      .validateInvite(token)
      .then((data) => { setPayload(data); setStatus('valid'); })
      .catch(()    => { setStatus('expired'); });
  }, [token]);

  return { status, payload };
}
