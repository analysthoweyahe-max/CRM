import { useMemo, useState, type ReactNode } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { NavItem } from './NavItem';
import { useLang } from '@/app/providers/LanguageProvider';
import { NAV_BY_VARIANT, SUBTITLE, BRAND_NAME } from './appSidebar.config';
import type { AppSidebarProps as _Base } from './appSidebar.types';

export interface AppSidebarProps extends _Base {
  footerWidget?: ReactNode;
  isCheckedIn?:  boolean;
}

export function AppSidebar({ variant, isOpen, onClose, collapsed, onToggleCollapse, footerWidget, isCheckedIn }: AppSidebarProps) {
  const { lang, isRTL } = useLang();
  const isAr             = lang === 'ar';
  const location         = useLocation();

  const sections = NAV_BY_VARIANT[variant];
  const allItems = sections.flatMap(s => s.items);

  const activeParentKey = allItems.find(item =>
    item.children?.some(c => location.pathname.startsWith(c.path))
  )?.key;

  const [manualExpanded, setManualExpanded] = useState<Set<string>>(
    () => new Set(activeParentKey ? [activeParentKey] : []),
  );

  const expanded = useMemo(
    () => new Set([...manualExpanded, ...(activeParentKey ? [activeParentKey] : [])]),
    [manualExpanded, activeParentKey],
  );

  function toggle(key: string) {
    setManualExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const slideOut     = isRTL ? 'translate-x-full' : '-translate-x-full';
  const subtitle     = SUBTITLE[variant];
  const CollapseIcon = isRTL
    ? (collapsed ? ChevronRight : ChevronLeft)
    : (collapsed ? ChevronLeft  : ChevronRight);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={onClose} />
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
        {/* ── Logo ── */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100 dark:border-gray-700/60 overflow-hidden">
          <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'lg:justify-center lg:w-full' : ''}`}>
            <img
              src="/logo.png"
              alt="Howeyah"
              className={`object-contain shrink-0 transition-all duration-300 ${
                collapsed ? 'lg:w-8 lg:h-8 w-20 h-12' : 'w-20 h-12'
              }`}
            />
            <div className={`min-w-0 transition-all duration-200 ${collapsed ? 'lg:hidden' : ''}`}>
              {BRAND_NAME[variant] && (
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight whitespace-nowrap">
                  {BRAND_NAME[variant]}
                </p>
              )}
              <p className="text-[11px] text-[#709028] dark:text-[#A0CD39] whitespace-nowrap font-medium">
                {isAr ? subtitle.ar : subtitle.en}
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

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-4">
          {sections.map((section, si) => (
            <div key={si} className="space-y-0.5">

              {(section.sectionAr || section.sectionEn) && (
                <p className={`px-4 mb-2 text-sm font-bold tracking-wide
                               text-brand-700 dark:text-brand-400 ${collapsed ? 'lg:hidden' : ''}`}>
                  {isAr ? section.sectionAr : section.sectionEn}
                </p>
              )}

              {section.items.map(item => {
                const collapsedPath = item.path ?? item.children?.[0]?.path ?? '/';
                const isChildActive = item.children?.some(c => location.pathname.startsWith(c.path)) ?? false;

                return (
                  <div key={item.key}>
                    {/* Collapsed icon (desktop only) */}
                    <NavLink
                      to={collapsedPath}
                      end={!item.children}
                      title={isAr ? item.labelAr : item.labelEn}
                      className={({ isActive }) =>
                        `${collapsed ? 'hidden lg:flex' : 'hidden'} items-center justify-center
                         h-10 w-10 mx-auto rounded-xl transition-all duration-150
                         ${(isActive || isChildActive)
                           ? 'bg-[#A0CD39] text-gray-900 shadow-sm'
                           : 'text-gray-600 dark:text-gray-300 hover:bg-[#D8EBAE] dark:hover:bg-[#A0CD39]/15 hover:text-[#709028]'}`
                      }
                    >
                      <item.icon size={20} className="shrink-0" />
                    </NavLink>

                    {/* Full item */}
                    <div className={collapsed ? 'lg:hidden' : ''}>
                      <NavItem
                        label={isAr ? item.labelAr : item.labelEn}
                        icon={item.icon}
                        path={item.path}
                        children={item.children?.map(c => ({
                          key:   c.key,
                          label: isAr ? c.labelAr : c.labelEn,
                          path:  c.path,
                          icon:  c.icon,
                        }))}
                        isOpen={item.children ? expanded.has(item.key) : undefined}
                        onToggle={item.children ? () => toggle(item.key) : undefined}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Footer widget (optional, e.g. attendance check-in) ── */}
        {footerWidget && (
          <div className={collapsed ? 'lg:hidden' : ''}>{footerWidget}</div>
        )}

        {/* ── Attendance dot (collapsed + checked-in indicator) ── */}
        {isCheckedIn && collapsed && (
          <div className="hidden lg:flex items-center justify-center py-2">
            <div className="relative w-2.5 h-2.5">
              <div className="absolute inset-0 rounded-full bg-[#A0CD39] animate-ping opacity-60" />
              <div className="relative rounded-full bg-[#A0CD39] w-2.5 h-2.5" />
            </div>
          </div>
        )}

        {/* ── Collapse toggle (desktop only) ── */}
        <div className="hidden lg:flex items-center justify-center px-3 py-2
                        border-t border-gray-100 dark:border-gray-700/60">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isAr ? (collapsed ? 'توسيع' : 'طي') : (collapsed ? 'Expand' : 'Collapse')}
            className="flex items-center justify-center w-8 h-8 rounded-lg
                       text-gray-400 hover:text-[#709028] dark:hover:text-[#A0CD39]
                       hover:bg-[#D8EBAE] dark:hover:bg-[#A0CD39]/15 transition-all"
          >
            <CollapseIcon size={16} />
          </button>
        </div>

        {/* ── Footer ── */}
        <div className={`px-4 py-3 border-t border-gray-100 dark:border-gray-700/60 ${collapsed ? 'lg:hidden' : ''}`}>
          <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 whitespace-nowrap">
            © 2026 Howeyah — {isAr ? 'الإصدار 1.0' : 'Version 1.0'}
          </p>
        </div>
      </aside>
    </>
  );
}
