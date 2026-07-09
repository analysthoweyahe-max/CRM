import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ForgotPasswordState } from '@/modules/auth/types/auth.types';

const STORAGE_KEY = 'hr_employee_forgot_password';

function readStoredState(): ForgotPasswordState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ForgotPasswordState;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredState(state: ForgotPasswordState | null) {
  if (!state?.email) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

interface ForgotPasswordContextValue {
  state: ForgotPasswordState | null;
  setEmailStep: (email: string, expiresAt: string) => void;
  setResetToken: (token: string) => void;
  clearResetToken: () => void;
  clearAll: () => void;
}

const ForgotPasswordContext = createContext<ForgotPasswordContextValue | null>(null);

export function ForgotPasswordProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ForgotPasswordState | null>(() => readStoredState());

  const persist = useCallback((next: ForgotPasswordState | null) => {
    setState(next);
    writeStoredState(next);
  }, []);

  const setEmailStep = useCallback((email: string, expiresAt: string) => {
    persist({ email: email.trim(), expiresAt });
  }, [persist]);

  const setResetToken = useCallback((token: string) => {
    setState((prev) => {
      if (!prev?.email) return prev;
      const next = { ...prev, resetToken: token };
      writeStoredState(next);
      return next;
    });
  }, []);

  const clearResetToken = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const { resetToken: _removed, ...rest } = prev;
      const next = { ...rest };
      writeStoredState(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    persist(null);
  }, [persist]);

  const value = useMemo(
    () => ({ state, setEmailStep, setResetToken, clearResetToken, clearAll }),
    [state, setEmailStep, setResetToken, clearResetToken, clearAll],
  );

  return (
    <ForgotPasswordContext.Provider value={value}>
      {children}
    </ForgotPasswordContext.Provider>
  );
}

export function useForgotPasswordState() {
  const ctx = useContext(ForgotPasswordContext);
  if (!ctx) {
    throw new Error('useForgotPasswordState must be used within ForgotPasswordProvider');
  }
  return ctx;
}
