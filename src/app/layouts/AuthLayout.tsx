import { Outlet } from 'react-router-dom';
import { Banknote, CalendarDays, Clock, Globe, Users } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { authTranslations } from '@/modules/auth/i18n';
import { ForgotPasswordProvider } from '@/modules/auth/context/ForgotPasswordContext';

const FEATURE_ICONS = [Users, Clock, CalendarDays, Banknote] as const;

export function AuthLayout() {
  const { lang, isRTL, toggleLang } = useLang();
  const t = authTranslations[lang];

  return (
    <div
      className="min-h-screen grid grid-cols-1 bg-[#f7f7f7] lg:grid-cols-[40.5%_59.5%]"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <aside
        className="hidden min-h-screen flex-col bg-gradient-to-br from-[#6f9f1b] via-[#9bd130] to-[#c1e65c]
             px-8 pb-10 pt-8 text-[#263019] lg:flex"
      >
        {/* Logo + Company Name */}
        <div
          className={`flex w-full max-w-[300px] items-center gap-5 ${isRTL ? 'ms-auto flex-row' : 'me-auto flex-row-reverse'
            }`}
        >
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1
              dir="auto"
              className="text-2xl font-bold leading-tight"
            >
              {t.branding.companyName}
            </h1>

            <p
              dir="auto"
              className="mt-1 text-base font-semibold"
            >
              {t.branding.systemName}
            </p>
          </div>

          <div className="flex h-[68px] w-[108px] items-center justify-center rounded-xl bg-white/75 p-2">
            <img
              src="/logo.png"
              alt={t.branding.companyName}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>

        {/* Headline + Description + Features */}
        <div
          className={`mt-[21vh] w-full max-w-[500px] ${isRTL ? 'ms-auto text-right' : 'me-auto text-left'
            }`}
        >    <h2 className="text-3xl font-bold leading-snug">{t.branding.headline}</h2>
          <p className="mt-3 text-xl leading-8">{t.branding.description}</p>

          <ul className="mt-8 space-y-4">
            {t.branding.features.map((feature, index) => {
              const Icon = FEATURE_ICONS[index];

              return (
                <li
                  key={feature}
                  className={`flex items-center gap-4 text-lg ${isRTL ? 'text-right' : 'text-left'
                    }`}
                >
                  <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-white/35 text-[#537319]">
                    <Icon size={18} />
                  </span>

                  <span dir="auto">{feature}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Copyright */}
        <p
          className={`mt-auto w-full max-w-[500px] text-base font-semibold ${isRTL ? 'ms-auto text-right' : 'me-auto text-left'
            }`}
        >    {t.branding.copyright}
        </p>
      </aside>
      <main className="relative flex min-h-screen flex-col items-center bg-[#f7f7f7] px-6 py-6">
        <button
          type="button"
          onClick={toggleLang}
          className="absolute inset-s-6 top-6 flex h-9 items-center gap-2 rounded-lg border border-[#e3e3e3] bg-white px-3
                     text-sm text-[#59657a] transition hover:border-[#9bd130] hover:text-[#537319] lg:inset-s-46"
        >
          <Globe size={15} />
          {t.langToggle}
        </button>

        <div className="mt-20 flex items-center gap-3 lg:hidden">
          <img src="/logo.png" alt={t.branding.companyName} className="h-12 w-16 object-contain" />
          <div className="text-right">
            <span className="text-xl font-bold text-[#263019]">{t.branding.companyName}</span>
            <p className="text-xs text-gray-500">{t.branding.systemName}</p>
          </div>
        </div>

        <div className="flex w-full flex-1 items-center justify-center pt-16 lg:justify-end lg:pt-0">
          <div className="w-full max-w-[510px] lg:me-[7.9vw]">
            <ForgotPasswordProvider>
              <Outlet />
            </ForgotPasswordProvider>
          </div>
        </div>
      </main>
    </div>
  );
}