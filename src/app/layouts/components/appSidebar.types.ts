import type { LucideIcon } from 'lucide-react';

export interface NavChildDef {
  key:     string;
  labelAr: string;
  labelEn: string;
  path:    string;
  icon?:   LucideIcon;
}

export interface NavItemDef {
  key:       string;
  labelAr:   string;
  labelEn:   string;
  icon:      LucideIcon;
  path?:     string;
  children?: NavChildDef[];
}

export interface NavSectionDef {
  sectionAr?: string;
  sectionEn?: string;
  items:      NavItemDef[];
}

export interface AppSidebarProps {
  variant:          'hr' | 'pm' | 'employee';
  isOpen:           boolean;
  onClose:          () => void;
  collapsed:        boolean;
  onToggleCollapse: () => void;
}
