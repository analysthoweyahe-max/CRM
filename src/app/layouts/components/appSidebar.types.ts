import type { LucideIcon } from 'lucide-react';

export interface NavChildDef {
  key:          string;
  labelAr:      string;
  labelEn:      string;
  path:         string;
  icon?:        LucideIcon;
  permission?:  string | string[];
  permissions?: string[];
  role?:        string | string[];
  roles?:       string[];
}

export interface NavItemDef {
  key:          string;
  labelAr:      string;
  labelEn:      string;
  icon:         LucideIcon;
  path?:        string;
  children?:    NavChildDef[];
  permission?:  string | string[];
  permissions?: string[];
  role?:        string | string[];
  roles?:       string[];
}

export interface NavSectionDef {
  sectionAr?:   string;
  sectionEn?:   string;
  /** Hide the whole section unless the user passes this check. */
  permission?:  string | string[];
  permissions?: string[];
  role?:        string | string[];
  roles?:       string[];
  items:        NavItemDef[];
}

export interface AppSidebarProps {
  variant:          'admin' | 'hr' | 'pm' | 'employee' | 'seo' | 'seo-member' | 'sales';
  isOpen:           boolean;
  onClose:          () => void;
  collapsed:        boolean;
  onToggleCollapse: () => void;
}
