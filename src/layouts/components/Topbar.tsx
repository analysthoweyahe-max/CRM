import { useState } from 'react';
import { Menu, Bell, Moon, Sun, LogOut, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { useTheme } from '@/app/providers/ThemeProvider';

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout }         = useAuth();
  const { lang, toggleLang }     = useLang();
  const { isDark, toggleTheme }  = useTheme();
  const [menuOpen, setMenuOpen]  = useState(false);

  const initial = user?.fullName?.slice(0, 1).toUpperCase() ?? '?';

  return (
    <header className="sticky top-0 z-10 h-16 flex items-center gap-3 px-4 md:px-6
                       bg-white dark:bg-gray-900
                       border-b border-gray-100 dark:border-gray-700/60">

      {/* ── Logo + company (RTL: appears on the RIGHT) ── */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
          <img src="/logo.png" alt="Howaya HR" className="w-7 h-7 object-contain" />
        </div>
        <div className="hidden sm:block leading-tight">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Howaya HR</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {lang === 'ar' ? 'نظام الموارد البشرية' : 'HR System'}
          </p>
        </div>
      </div>

      {/* ── Greeting (center, flex-1) ── */}
      <div className="flex-1 text-end px-2">
      
     
      </div>

      {/* ── Actions (RTL: appears on the LEFT) ── */}
      <div className="flex items-center gap-0.5 shrink-0">

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Language toggle */}
        <button
          type="button"
          onClick={toggleLang}
          title={lang === 'ar' ? 'Switch to English' : 'تبديل للعربية'}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Globe size={18} />
        </button>

        {/* Dark / light mode toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-1 inset-e-1 min-w-4 h-4 px-0.5 rounded-full
                           bg-red-500 text-white text-[10px] font-bold
                           flex items-center justify-center leading-none">
            2
          </span>
        </button>

        {/* Divider */}
        <span className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Avatar + dropdown chevron */}
        <button
          type="button"
          onClick={() => setMenuOpen((p) => !p)}
          className="flex items-center gap-1 px-1.5 py-1 rounded-lg
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">{initial}</span>
          </div>
          <ChevronDown
            size={14}
            className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500
                     hover:text-red-500 dark:hover:text-red-400
                     hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={16} />
        </button>

      </div>
    </header>
  );
}
