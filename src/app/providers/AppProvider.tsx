import { type ReactNode } from 'react';
import { QueryProvider }    from './QueryProvider';
import { LanguageProvider } from './LanguageProvider';
import { ThemeProvider }    from './ThemeProvider';
import { AuthProvider }     from '@/features/auth/context/AuthProvider';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryProvider>
  );
}
