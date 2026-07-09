import { type ReactNode } from 'react';
import { Toaster }          from 'sonner';
import { QueryProvider }    from './QueryProvider';
import { LanguageProvider } from './LanguageProvider';
import { ThemeProvider }    from './ThemeProvider';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <LanguageProvider>
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </LanguageProvider>
    </QueryProvider>
  );
}
