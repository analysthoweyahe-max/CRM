import { Menu, Bell, LogOut, Globe } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';

const PAGE_TITLES: Record<string, { ar: string; en: string }> = {
  '/dashboard':          { ar: 'لوحة التحكم',        en: 'Dashboard' },
  '/employees':          { ar: 'قائمة الموظفين',       en: 'Employee List' },
  '/employees/new':      { ar: 'إضافة موظف جديد',      en: 'Add Employee' },
  '/attendance':         { ar: 'الحضور والانصراف',     en: 'Attendance' },
  '/leaves':             { ar: 'إدارة الإجازات',        en: 'Leave Management' },
  '/payroll/deductions': { ar: 'الخصومات',             en: 'Deductions' },
  '/payroll/bonuses':    { ar: 'المكافآت',             en: 'Bonuses' },
  '/messages':           { ar: 'الرسائل',              en: 'Messages' },
  '/settings':           { ar: 'الإعدادات',             en: 'Settings' },
};

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth();
  const { lang, toggleLang } = useLang();
  const location = useLocation();

  const pathMatch = Object.keys(PAGE_TITLES).find((p) =>
    location.pathname === p || location.pathname.startsWith(p + '/'),
  );
  const titleEntry = pathMatch ? PAGE_TITLES[pathMatch] : { ar: 'لوحة التحكم', en: 'Dashboard' };
  const pageTitle  = lang === 'ar' ? titleEntry.ar : titleEntry.en;

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 md:px-6 h-14 flex items-center gap-3">

      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-base font-semibold text-gray-900 truncate">{pageTitle}</h1>

      {/* Right-side actions */}
      <div className="flex items-center gap-1.5">

        {/* Language toggle */}
        <button
          type="button"
          onClick={toggleLang}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                     text-gray-600 border border-gray-200
                     hover:border-brand-400 hover:text-brand-600 transition-all"
        >
          <Globe size={13} />
          {lang === 'ar' ? 'EN' : 'AR'}
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 inset-e-1.5 w-2 h-2 rounded-full bg-brand-500 border-2 border-white" />
        </button>

        {/* Divider */}
        <span className="w-px h-6 bg-gray-200 mx-1" />

        {/* User + logout */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-brand-700">
              {user?.fullName?.slice(0, 1).toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="hidden md:block leading-none">
            <p className="text-xs font-semibold text-gray-800">{user?.fullName}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{user?.employeeId}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-1.5 ms-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          >
            <LogOut size={16} />
          </button>
        </div>

      </div>
    </header>
  );
}