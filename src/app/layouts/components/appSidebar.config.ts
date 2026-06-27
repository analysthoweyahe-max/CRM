import {
  LayoutDashboard, Users, Clock, Banknote, MessageSquare, Settings,
  UserPlus, FileText, CalendarDays, TrendingDown, Gift,
  FilePlus2, ClipboardList,
} from 'lucide-react';
import { ROUTES } from '@/app/router/routes';
import type { NavSectionDef } from './appSidebar.types';

// ── HR ────────────────────────────────────────────────────────────────────────

export const HR_NAV: NavSectionDef[] = [
  {
    items: [
      {
        key: 'dashboard', labelAr: 'الصفحة الرئيسية', labelEn: 'Dashboard',
        icon: LayoutDashboard, path: ROUTES.DASHBOARD,
      },
      {
        key: 'employees', labelAr: 'إدارة الموظفين', labelEn: 'Employees', icon: Users,
        children: [
          { key: 'emp-list', labelAr: 'الموظفين',   labelEn: 'Employees',    path: ROUTES.EMPLOYEES.LIST, icon: Users    },
          { key: 'emp-new',  labelAr: 'إضافة موظف', labelEn: 'Add Employee', path: ROUTES.EMPLOYEES.NEW,  icon: UserPlus },
        ],
      },
      {
        key: 'attendance', labelAr: 'الحضور والإجازات', labelEn: 'Attendance & Leaves', icon: Clock,
        children: [
          { key: 'att-daily', labelAr: 'الحضور اليومي',  labelEn: 'Daily Attendance', path: ROUTES.ATTENDANCE.DAILY, icon: Clock        },
          { key: 'att-log',   labelAr: 'سجل الحضور',     labelEn: 'Attendance Log',   path: ROUTES.ATTENDANCE.LOG,   icon: FileText     },
          { key: 'leaves',    labelAr: 'إدارة الإجازات', labelEn: 'Leave Management', path: ROUTES.LEAVES.LIST,      icon: CalendarDays },
        ],
      },
      {
        key: 'payroll', labelAr: 'الرواتب', labelEn: 'Payroll', icon: Banknote,
        children: [
          { key: 'deductions', labelAr: 'الخصومات',          labelEn: 'Deductions', path: ROUTES.PAYROLL.DEDUCTIONS, icon: TrendingDown },
          { key: 'bonuses',    labelAr: 'المكافآت والحوافز', labelEn: 'Bonuses',    path: ROUTES.PAYROLL.BONUSES,    icon: Gift         },
        ],
      },
    ],
  },
  {
    sectionAr: 'التواصل',
    sectionEn: 'Communication',
    items: [
      { key: 'messages', labelAr: 'الرسائل', labelEn: 'Messages', icon: MessageSquare, path: ROUTES.MESSAGES },
    ],
  },
  {
    sectionAr: 'النظام',
    sectionEn: 'System',
    items: [
      { key: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: Settings, path: ROUTES.SETTINGS },
    ],
  },
];

// ── PM ────────────────────────────────────────────────────────────────────────

export const PM_NAV: NavSectionDef[] = [
  {
    items: [
      { key: 'pm-dash',    labelAr: 'الرئيسية',                 labelEn: 'Dashboard',         icon: LayoutDashboard, path: ROUTES.PROJECT_MANAGER.DASHBOARD },
      { key: 'pm-new',     labelAr: 'إنشاء مشروع جديد',        labelEn: 'New Project',        icon: FilePlus2,       path: ROUTES.PROJECT_MANAGER.NEW      },
      { key: 'pm-team',    labelAr: 'فريق العمل',               labelEn: 'Team',               icon: Users,           path: ROUTES.PROJECT_MANAGER.TEAM     },
      { key: 'pm-reports', labelAr: 'التقارير اليومية والطلبات',labelEn: 'Reports & Requests', icon: ClipboardList,   path: ROUTES.PROJECT_MANAGER.REPORTS  },
    ],
  },
];

// ── Employee ──────────────────────────────────────────────────────────────────

export const EMPLOYEE_NAV: NavSectionDef[] = [
  {
    items: [
      { key: 'emp-home',     labelAr: 'الرئيسية',         labelEn: 'Dashboard',     icon: LayoutDashboard, path: ROUTES.EMPLOYEE.DASHBOARD },
      { key: 'emp-messages', labelAr: 'الرسائل',           labelEn: 'Messages',      icon: MessageSquare,   path: ROUTES.EMPLOYEE.MESSAGES  },
      { key: 'emp-requests', labelAr: 'طلباتى',            labelEn: 'My Requests',   icon: FileText,        path: ROUTES.EMPLOYEE.REQUESTS  },
      { key: 'emp-reports',  labelAr: 'التقارير اليومية', labelEn: 'Daily Reports', icon: ClipboardList,   path: ROUTES.EMPLOYEE.REPORTS   },
    ],
  },
];

// ── Lookup maps ───────────────────────────────────────────────────────────────

export const NAV_BY_VARIANT: Record<'hr' | 'pm' | 'employee', NavSectionDef[]> = {
  hr:       HR_NAV,
  pm:       PM_NAV,
  employee: EMPLOYEE_NAV,
};

export const SUBTITLE: Record<'hr' | 'pm' | 'employee', { ar: string; en: string }> = {
  hr:       { ar: 'نظام الموارد البشرية', en: 'HR System'       },
  pm:       { ar: 'مدير المشاريع',        en: 'Project Manager' },
  employee: { ar: 'بوابة الموظف',         en: 'Employee Portal' },
};
