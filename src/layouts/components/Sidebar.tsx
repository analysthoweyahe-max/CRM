import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Clock,
  Banknote, MessageSquare, Settings, X,
  UserPlus, FileText, CalendarDays, TrendingDown, Gift,
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

interface NavSection {
  sectionAr?: string;
  sectionEn?: string;
  items: NavGroupDef[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      {
        key: 'dashboard', labelAr: 'الصفحة الرئيسية', labelEn: 'Dashboard',
        icon: LayoutDashboard, path: ROUTES.DASHBOARD,
      },
      {
        key: 'employees', labelAr: 'إدارة الموظفين', labelEn: 'Employees', icon: Users,
        children: [
          { key: 'emp-list', labelAr: 'الموظفين',    labelEn: 'Employees',    label: '', path: ROUTES.EMPLOYEES.LIST, icon: Users },
          { key: 'emp-new',  labelAr: 'إضافة موظف',  labelEn: 'Add Employee', label: '', path: ROUTES.EMPLOYEES.NEW, icon: UserPlus },
        ],
      },
      {
        key: 'attendance', labelAr: 'الحضور والإجازات', labelEn: 'Attendance & Leaves', icon: Clock,
        children: [
          { key: 'att-daily', labelAr: 'الحضور اليومي', labelEn: 'Daily Attendance', label: '', path: ROUTES.ATTENDANCE.DAILY, icon: Clock },
          { key: 'att-log',   labelAr: 'سجل الحضور',    labelEn: 'Attendance Log',   label: '', path: ROUTES.ATTENDANCE.LOG,   icon: FileText },
          { key: 'leaves',    labelAr: 'إدارة الإجازات', labelEn: 'Leave Management', label: '', path: ROUTES.LEAVES,          icon: CalendarDays },
        ],
      },
      {
        key: 'payroll', labelAr: 'الرواتب', labelEn: 'Payroll', icon: Banknote,
        children: [
          { key: 'deductions', labelAr: 'الخصومات',          labelEn: 'Deductions', label: '', path: ROUTES.PAYROLL.DEDUCTIONS, icon: TrendingDown },
          { key: 'bonuses',    labelAr: 'المكافآت والحوافز',  labelEn: 'Bonuses',    label: '', path: ROUTES.PAYROLL.BONUSES,    icon: Gift },
        ],
      },
    ],
  },
  {
    sectionAr: 'التواصل',
    sectionEn: 'Communication',
    items: [
      {
        key: 'messages', labelAr: 'الرسائل', labelEn: 'Messages',
        icon: MessageSquare, path: ROUTES.MESSAGES,
      },
    ],
  },
  {
    sectionAr: 'النظام',
    sectionEn: 'System',
    items: [
      {
        key: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings',
        icon: Settings, path: ROUTES.SETTINGS,
      },
    ],
  },
];

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

interface SidebarProps {
  isOpen:  boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { lang, isRTL } = useLang();
  const { user }        = useAuth();
  const location        = useLocation();

  const findActiveParent = () =>
    ALL_ITEMS.find((item) =>
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
      icon:  c.icon,
    }));
  }

  const slideOut = isRTL ? 'translate-x-full' : '-translate-x-full';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={[
          'fixed inset-y-0 inset-s-0 z-30 flex flex-col w-64',
          'bg-white dark:bg-gray-900',
          'border-e border-gray-100 dark:border-gray-700/60 shadow-sm',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : slideOut,
          'lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Howaya HR" className="w-20 h-12 object-contain" />
         
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">Howaya HR</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {lang === 'ar' ? 'نظام الموارد البشرية' : 'HR System'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={17} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} className="space-y-0.5">
              {(section.sectionAr || section.sectionEn) && (
                <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {lang === 'ar' ? section.sectionAr : section.sectionEn}
                </p>
              )}
              {si === 0 && (
                <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
                </p>
              )}
              {section.items.map((item) => (
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
            </div>
          ))}
        </nav>

        {/* User chip */}
        {user && (
          <div className="px-3 pt-3 pb-4 border-t border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-xs font-bold text-brand-700">
                  {user.fullName?.slice(0, 1).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user.fullName}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{user.employeeId}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
