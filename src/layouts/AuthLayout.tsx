import { Outlet } from 'react-router-dom';
import { Globe, Users, Clock, CalendarDays, Banknote } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { authTranslations } from '@/features/auth/i18n';

const FEATURE_ICONS = [Users, Clock, CalendarDays, Banknote] as const;

export function AuthLayout() {
  const { lang, isRTL, toggleLang } = useLang();
  const t = authTranslations[lang];

  return (
    /* Force LTR on the grid so brand=left, form=right regardless of language */
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" dir="ltr">

      {/* ── Left panel: brand ── */}
      <div
        className="hidden lg:flex flex-col items-center px-12 pt-8 pb-10 text-white
                   bg-gradient-to-br from-[#a8d832] via-[#8cc21a] to-[#6aa010]"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Logo + company name — logo on right in RTL */}
        <div className="mb-10 w-full max-w-xs flex items-center gap-4">
          {/* logo box — appears on right in RTL (comes first in DOM, flex-row-reverse via RTL dir) */}
          <div className="shrink-0 w-16 h-16 rounded-2xl bg-white border-2 border-white/40
                          flex items-center justify-center shadow-md overflow-hidden">
            <img src="/logo.png" alt={t.branding.companyName} className="w-12 h-12 object-contain" />
          </div>
          {/* text block */}
          <div>
            <h1 className="text-2xl font-bold leading-tight">{t.branding.companyName}</h1>
            <p className="text-white/70 text-sm mt-0.5">{t.branding.systemName}</p>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-3xl font-bold text-center leading-snug mb-4 max-w-sm">
          {t.branding.headline}
        </h2>
        <p className="text-white/80 text-center text-sm leading-relaxed mb-10 max-w-xs">
          {t.branding.description}
        </p>

        {/* Feature bullets — right-aligned text in RTL */}
        <ul className="space-y-3.5 w-full max-w-xs">
          {t.branding.features.map((feature, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <li key={feature} className="flex items-center gap-3">
                {/* Icon always on the outer side — in RTL this is the right */}
                <span className="shrink-0 w-9 h-9 rounded-xl bg-white/20 border border-white/30
                                 flex items-center justify-center text-white">
                  <Icon size={18} />
                </span>
                <span className="text-sm text-white/90 font-medium">{feature}</span>
              </li>
            );
          })}
        </ul>

        <p className="mt-auto pt-10 text-xs text-white/40">{t.branding.copyright}</p>
      </div>

      {/* ── Right panel: form ── */}
      <div
        className="flex flex-col items-center justify-center px-6 py-10 bg-gray-50 relative"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Language switcher — top right corner (always ltr-placed) */}
        <div className="absolute top-6 right-6">
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium
                       text-gray-600 bg-white border border-gray-200
                       hover:border-brand-400 hover:text-brand-600 transition-all shadow-sm"
          >
            <Globe size={15} className="text-gray-400" />
            {t.langToggle}
          </button>
        </div>

        {/* Branding — mobile only */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <img src="/logo.png" alt={t.branding.companyName} className="w-10 h-10 object-contain" />
          <div>
            <span className="text-xl font-bold text-brand-600">{t.branding.companyName}</span>
            <p className="text-xs text-gray-500">{t.branding.systemName}</p>
          </div>
        </div>

        {/* Form content — pushed to right side in RTL via self-end on larger screens */}
        <div className="w-full max-w-md lg:ms-auto lg:me-16">
          <Outlet />
        </div>
      </div>

    </div>
  );
}