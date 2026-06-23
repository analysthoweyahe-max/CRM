import { LayoutDashboard, FilePlus2, Users, ClipboardList, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { NavItem } from './NavItem';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';

interface NavDef {
  key:     string;
  labelAr: string;
  labelEn: string;
  icon:    LucideIcon;
  path:    string;
}

const PM_NAV: NavDef[] = [
  { key: 'pm-dash',    labelAr: 'الرئيسية',                  labelEn: 'Dashboard',         icon: LayoutDashboard, path: ROUTES.PROJECT_MANAGER.DASHBOARD },
  { key: 'pm-new',     labelAr: 'إنشاء مشروع جديد',         labelEn: 'New Project',        icon: FilePlus2,       path: ROUTES.PROJECT_MANAGER.NEW      },
  { key: 'pm-team',    labelAr: 'فريق العمل',                labelEn: 'Team',               icon: Users,           path: ROUTES.PROJECT_MANAGER.TEAM     },
  { key: 'pm-reports', labelAr: 'التقارير اليومية والطلبات', labelEn: 'Reports & Requests', icon: ClipboardList,   path: ROUTES.PROJECT_MANAGER.REPORTS  },
];

interface Props {
  isOpen:           boolean;
  onClose:          () => void;
  collapsed:        boolean;
  onToggleCollapse: () => void;
}

export function ProjectManagerSidebar({ isOpen, onClose, collapsed, onToggleCollapse }: Props) {
  const { lang, isRTL } = useLang();
  const isAr = lang === 'ar';

  const slideOut = isRTL ? 'translate-x-full' : '-translate-x-full';

  // Arrow points inward to signal "expand", outward to signal "collapse"
  const CollapseIcon = isRTL
    ? (collapsed ? ChevronRight : ChevronLeft)
    : (collapsed ? ChevronLeft : ChevronRight);

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
          'fixed inset-y-0 inset-s-0 z-30 flex flex-col',
          'bg-white dark:bg-gray-900',
          'border-e border-gray-100 dark:border-gray-700/60 shadow-sm',
          'transition-all duration-300 ease-in-out',
          'w-64',
          collapsed ? 'lg:w-16' : 'lg:w-64',
          isOpen ? 'translate-x-0' : slideOut,
          'lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100 dark:border-gray-700/60 overflow-hidden">
          <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'lg:justify-center lg:w-full' : ''}`}>
            <img
              src="/logo.png"
              alt="Howaya"
              className={`object-contain shrink-0 transition-all duration-300 ${collapsed ? 'lg:w-8 lg:h-8 w-20 h-12' : 'w-20 h-12'}`}
            />
            <div className={`transition-all duration-200 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight whitespace-nowrap">Howaya HR</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {isAr ? 'مدير المشاريع' : 'Project Manager'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 dark:text-gray-500
                       hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
          >
            <X size={17} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-0.5">
          {PM_NAV.map((item) => (
            <div key={item.key}>
              {/* Desktop collapsed: icon only */}
              {collapsed && (
                <NavLink
                  to={item.path}
                  end
                  title={isAr ? item.labelAr : item.labelEn}
                  className={({ isActive }) =>
                    `hidden lg:flex items-center justify-center h-10 w-10 mx-auto rounded-xl
                     transition-all duration-150
                     ${isActive
                       ? 'bg-[#A0CD39] text-gray-900 shadow-sm'
                       : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'}`
                  }
                >
                  <item.icon size={20} className="shrink-0" />
                </NavLink>
              )}
              {/* Full item: always on mobile; on desktop only when expanded */}
              <div className={collapsed ? 'lg:hidden' : ''}>
                <NavItem
                  label={isAr ? item.labelAr : item.labelEn}
                  icon={item.icon}
                  path={item.path}
                />
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex items-center justify-center px-3 py-2
                        border-t border-gray-100 dark:border-gray-700/60">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isAr ? (collapsed ? 'توسيع' : 'طي') : (collapsed ? 'Expand' : 'Collapse')}
            className="flex items-center justify-center w-8 h-8 rounded-lg
                       text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <CollapseIcon size={16} />
          </button>
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 border-t border-gray-100 dark:border-gray-700/60 ${collapsed ? 'lg:hidden' : ''}`}>
          <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 whitespace-nowrap">
            © 2026 Howaya — {isAr ? 'الإصدار 1.0' : 'Version 1.0'}
          </p>
        </div>
      </aside>
    </>
  );
}
