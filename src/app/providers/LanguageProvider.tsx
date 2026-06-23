import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { LANG_KEY } from '@/app/config/constants';
import type { AuthLang } from '@/modules/auth/i18n';

interface LangContextValue {
  lang:     AuthLang;
  isRTL:    boolean;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<AuthLang>(() => {
    const stored = localStorage.getItem(LANG_KEY);
    return (stored === 'en' ? 'en' : 'ar') as AuthLang;
  });

  useEffect(() => {
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  function toggleLang() {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }

  return (
    <LangContext.Provider value={{ lang, isRTL: lang === 'ar', toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}
