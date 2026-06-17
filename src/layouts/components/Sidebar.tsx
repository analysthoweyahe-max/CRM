import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Clock, CalendarDays,
  Banknote, MessageSquare, Settings, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavItem } from './NavItem';
import type { NavChild } from './NavItem';
import { useLang } from '@/app/providers/LanguageProvider';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ROUTES } from '@/app/router/routes';

interface NavGroupDef {
  key:       string;
  labelAr:   string;
  labelEn:   string;
  icon:      LucideIcon;
  path?:     string;
  children?: (NavChild & { labelAr: string; labelEn: string })[];
}

const MAIN_NAV: NavGroupDef[] = [
  {
    key: 'dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard',
    icon: LayoutDashboard, path: ROUTES.DASHBOARD,
  },
  {
    key: 'employees', labelAr: 'الموظفون', labelEn: 'Employees', icon: Users,
    children: [
      { key: 'emp-list', labelAr: 'قائمة الموظفين', labelEn: 'Employee List', label: '', path: ROUTES.EMPLOYEES.LIST },
      { key: 'emp-new',  labelAr: 'إضافة موظف',     labelEn: 'Add Employee',   label: '', path: ROUTES.EMPLOYEES.NEW },
    ],
  },
  {
    key: 'attendance', labelAr: 'الحضور والانصراف', labelEn: 'Attendance',
    icon: Clock, path: ROUTES.ATTENDANCE,
  },
  {
    key: 'leaves', labelAr: 'الإجازات', labelEn: 'Leave Management',
    icon: CalendarDays, path: ROUTES.LEAVES,
  },
  {
    key: 'payroll', labelAr: 'الرواتب', labelEn: 'Payroll', icon: Banknote,
    children: [
      { key: 'deductions', labelAr: 'الخصومات', labelEn: 'Deductions', label: '', path: ROUTES.PAYROLL.DEDUCTIONS },
      { key: 'bonuses',    labelAr: 'المكافآت',  labelEn: 'Bonuses',    label: '', path: ROUTES.PAYROLL.BONUSES },
    ],
  },
  {
    key: 'messages', labelAr: 'الرسائل', labelEn: 'Messages',
    icon: MessageSquare, path: ROUTES.MESSAGES,
  },
];

const BOTTOM_NAV: NavGroupDef[] = [
  {
    key: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings',
    icon: Settings, path: ROUTES.SETTINGS,
  },
];

const ALL_NAV = [...MAIN_NAV, ...BOTTOM_NAV];

interface SidebarProps {
  isOpen:  boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { lang, isRTL } = useLang();
  const { user }        = useAuth();
  const location        = useLocation();

  const findActiveParent = () =>
    ALL_NAV.find((item) =>
      item.children?.some((c) => location.pathname.startsWith(c.path)),
    );

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const parent = findActiveParent();
    return new Set(parent ? [parent.key] : []);
  });

  useEffect(() => {
    const parent = findActiveParent();
    if (parent) setExpanded((prev) => new Set([...prev, parent.key]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  }

  function navChildren(item: NavGroupDef) {
    return item.children?.map((c) => ({
      key:   c.key,
      label: lang === 'ar' ? c.labelAr : c.labelEn,
      path:  c.path,
    }));
  }

  const slideOut = isRTL ? 'translate-x-full' : '-translate-x-full';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={[
          'fixed inset-y-0 inset-s-0 z-30 flex flex-col w-64 bg-white',
          'border-e border-gray-100 shadow-sm',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : slideOut,
          'lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Howaya HR" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">Howaya HR</p>
              <p className="text-[11px] text-gray-400">
                {lang === 'ar' ? 'نظام الموارد البشرية' : 'HR System'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <X size={17} />
          </button>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-4 mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            {lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
          </p>
          {MAIN_NAV.map((item) => (
            <NavItem
              key={item.key}
              label={lang === 'ar' ? item.labelAr : item.labelEn}
              icon={item.icon}
              path={item.path}
              children={navChildren(item)}
              isOpen={expanded.has(item.key)}
              onToggle={() => toggle(item.key)}
            />
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pt-3 pb-4 border-t border-gray-100 space-y-0.5">
          {BOTTOM_NAV.map((item) => (
            <NavItem
              key={item.key}
              label={lang === 'ar' ? item.labelAr : item.labelEn}
              icon={item.icon}
              path={item.path}
            />
          ))}

          {/* User chip */}
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl bg-gray-50 border border-gray-100">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-xs font-bold text-brand-700">
                  {user.fullName?.slice(0, 1).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">{user.fullName}</p>
                <p className="text-[11px] text-gray-400 truncate">{user.employeeId}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
