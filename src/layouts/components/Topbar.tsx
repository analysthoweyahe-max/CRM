import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Globe, LogOut, User, ChevronDown, Moon, Sun, KeyRound } from 'lucide-react';
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { useTheme } from '@/app/providers/ThemeProvider';
import { ROUTES } from '@/app/router/routes';

const ROLE_LABELS: Record<string, { ar: string; en: string }> = {
  admin:    { ar: 'مدير النظام',      en: 'System Admin' },
  hr:       { ar: 'مدير موارد بشرية', en: 'HR Manager' },
  manager:  { ar: 'مدير',             en: 'Manager' },
  employee: { ar: 'موظف',             en: 'Employee' },
};

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout }     = useAuth();
  const { lang, toggleLang } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const navigate             = useNavigate();
  const [open, setOpen]           = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const dropdownRef          = useRef<HTMLDivElement>(null);

  const initial   = user?.fullName?.slice(0, 1).toUpperCase() ?? '?';
  const roleLabel = user?.role ? (ROLE_LABELS[user.role]?.[lang] ?? user.role) : '';

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  return (
    <>
    <header className="sticky top-0 z-10 h-16 flex items-center gap-3 px-4 md:px-6
                       bg-white dark:bg-gray-900
                       border-b border-gray-100 dark:border-gray-700/60">

      {/* Greeting + hamburger (right/start side) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile menu toggle — stays with greeting on the start side */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="hidden sm:flex flex-col leading-snug">
          <span className="flex items-center gap-1" style={{ fontSize: '12px', fontWeight: 400, color: '#595959' }}>
            {lang === 'ar' ? 'مرحباً بعودتك' : 'Welcome back'}
            <span style={{ color: '#A0CD39', fontSize: '14px' }}>👋</span>
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
            {user?.fullName ?? ''}
          </span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions (left/end side) */}
      <div className="flex items-center gap-1 shrink-0">

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

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <span className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen((p) => !p)}
            className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#A0CD39] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-gray-900">{initial}</span>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {open && (
            <div className="absolute inset-e-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-gray-800
                            shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">

              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="w-9 h-9 rounded-full bg-[#A0CD39] flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-gray-900">{initial}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{roleLabel}</p>
                </div>
              </div>

              {/* Profile */}
              <button
                type="button"
                onClick={() => { navigate(ROUTES.PROFILE); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                           text-gray-700 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <User size={16} className="text-gray-400 shrink-0" />
                <span>{lang === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
              </button>

              {/* Change password */}
              <button
                type="button"
                onClick={() => { setShowChangePwd(true); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                           text-gray-700 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <KeyRound size={16} className="text-gray-400 shrink-0" />
                <span>{lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</span>
              </button>

              {/* Change language */}
              <button
                type="button"
                onClick={() => { toggleLang(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                           text-gray-700 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Globe size={16} className="text-gray-400 shrink-0" />
                <span>{lang === 'ar' ? 'تغيير اللغة' : 'Change Language'}</span>
              </button>

              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

              {/* Logout */}
              <button
                type="button"
                onClick={async () => { await logout(); navigate(ROUTES.AUTH.LOGIN); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                           text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={16} className="shrink-0" />
                <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
              </button>

            </div>
          )}
        </div>

      </div>
    </header>

    <ChangePasswordModal
      open={showChangePwd}
      onClose={() => setShowChangePwd(false)}
      isAr={lang === 'ar'}
    />
    </>
  );
}
