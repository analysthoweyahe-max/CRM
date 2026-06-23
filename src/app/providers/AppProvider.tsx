import { type ReactNode } from 'react';
import { Toaster }          from 'sonner';
import { QueryProvider }    from './QueryProvider';
import { LanguageProvider } from './LanguageProvider';
import { ThemeProvider }    from './ThemeProvider';
import { AuthProvider }     from '@/modules/auth/context/AuthProvider';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryProvider>
  );
}
