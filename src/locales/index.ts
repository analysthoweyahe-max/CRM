import { ar } from './ar';
import { en } from './en';
import { useLang } from '@/app/providers/LanguageProvider';

export const translations = { ar, en } as const;

export type { Translations } from './ar';

export function useTrans() {
  const { lang } = useLang();
  return translations[lang];
}
