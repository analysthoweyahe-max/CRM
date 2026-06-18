import { NavLink, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

export interface NavChild {
  key:   string;
  label: string;
  path:  string;
}


interface NavItemProps {
  label:     string;
  icon:      LucideIcon;
  path?:     string;
  children?: NavChild[];
  isOpen?:   boolean;
  onToggle?: () => void;
}

const base     = 'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150';
const active   = 'bg-brand-500 text-white shadow-sm';
const inactive = 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100';

export function NavItem({ label, icon: Icon, path, children, isOpen, onToggle }: NavItemProps) {
  const location = useLocation();

  const isChildActive = children?.some(
    (c) => location.pathname === c.path || location.pathname.startsWith(c.path + '/'),
  ) ?? false;

  /* ── Simple link ── */
  if (!children) {
    return (
      <NavLink
        to={path!}
        end
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        <Icon size={18} className="shrink-0" />
        <span>{label}</span>
      </NavLink>
    );
  }

  /* ── Expandable parent ── */
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full ${base} ${isChildActive ? active : inactive}`}
      >
        <Icon size={18} className="shrink-0" />
        <span className="flex-1 text-start">{label}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${
            isChildActive ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="mt-1 ps-11 space-y-0.5">
          {children.map((child) => (
            <NavLink
              key={child.key}
              to={child.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150
                 ${isActive
                   ? 'bg-brand-500 text-white font-semibold shadow-sm'
                   : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
