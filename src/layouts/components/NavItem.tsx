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

const base    = 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border-s-[3px]';
const active  = 'bg-brand-50 text-brand-700 border-brand-500';
const inactive = 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent';

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
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                 ${isActive
                   ? 'text-brand-700 font-semibold bg-brand-50'
                   : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`
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
