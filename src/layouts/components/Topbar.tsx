import { useState } from 'react';
import { Menu, Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout }      = useAuth();
  const { lang }              = useLang();
  const [darkMode, setDarkMode] = useState(false);

  const initial = user?.fullName?.slice(0, 1).toUpperCase() ?? '?';

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 md:px-6 h-16 flex items-center gap-3">

      {/* ── Logo + company (RTL: appears on the RIGHT) ── */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
          <img src="/logo.png" alt="Howaya HR" className="w-7 h-7 object-contain" />
        </div>
        <div className="hidden sm:block leading-tight">
          <p className="text-sm font-bold text-gray-900">Howaya HR</p>
          <p className="text-[11px] text-gray-400">
            {lang === 'ar' ? 'نظام الموارد البشرية' : 'HR System'}
          </p>
        </div>
      </div>

      {/* ── Greeting (center, flex-1) ── */}
      <div className="flex-1 text-end px-2">
        <p className="text-[11px] text-gray-400 leading-tight">
          {lang === 'ar' ? 'مرحبا بعودتك 👋' : 'Welcome back 👋'}
        </p>
        <p className="text-sm font-bold text-gray-900 leading-tight">
          {user?.fullName ?? '—'}
        </p>
      </div>

      {/* ── Actions (RTL: appears on the LEFT) ── */}
      <div className="flex items-center gap-1 shrink-0">

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={() => setDarkMode((p) => !p)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1 inset-e-1 min-w-4 h-4 px-0.5 rounded-full
                           bg-red-500 text-white text-[10px] font-bold
                           flex items-center justify-center leading-none">
            2
          </span>
        </button>

        {/* Divider */}
        <span className="w-px h-6 bg-gray-200 mx-1" />

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-white">{initial}</span>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="p-1.5 ms-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
        >
          <LogOut size={16} />
        </button>

      </div>
    </header>
  );
}
