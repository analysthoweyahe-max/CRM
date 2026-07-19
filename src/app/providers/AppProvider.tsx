import { type ReactNode } from 'react';
import { Toaster }          from 'sonner';
import { QueryProvider }    from './QueryProvider';
import { LanguageProvider } from './LanguageProvider';
import { ThemeProvider, useTheme } from './ThemeProvider';

function ThemedToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      theme={isDark ? 'dark' : 'light'}
    />
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <LanguageProvider>
        <ThemeProvider>
          {children}
          <ThemedToaster />
        </ThemeProvider>
      </LanguageProvider>
    </QueryProvider>
  );
}
