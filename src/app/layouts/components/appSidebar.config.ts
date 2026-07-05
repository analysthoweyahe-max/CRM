import {
  LayoutDashboard, Users, Clock, Banknote, MessageSquare, Settings,
  UserPlus, FileText, CalendarDays, TrendingDown, Gift, ShieldCheck,
  FilePlus2, ClipboardList, CheckSquare, BarChart2, Building2, Briefcase,
} from 'lucide-react';
import { ROUTES } from '@/app/router/routes';
import type { NavSectionDef } from './appSidebar.types';

// ── Admin ─────────────────────────────────────────────────────────────────────

export const ADMIN_NAV: NavSectionDef[] = [
  {
    items: [
      { key: 'admin-dash',      labelAr: 'الرئيسية',           labelEn: 'Dashboard',           icon: LayoutDashboard, path: ROUTES.ADMIN.DASHBOARD  },
      { key: 'admin-employees', labelAr: 'إدارة الموظفين',     labelEn: 'Employees',           icon: Users,           path: ROUTES.ADMIN.EMPLOYEES    },
      { key: 'admin-departments', labelAr: 'الأقسام',         labelEn: 'Departments',         icon: Building2,       path: ROUTES.ADMIN.DEPARTMENTS  },
      { key: 'admin-job-titles', labelAr: 'المسميات الوظيفية', labelEn: 'Job Titles',         icon: Briefcase,       path: ROUTES.ADMIN.JOB_TITLES   },
      { key: 'admin-roles',     labelAr: 'الأدوار والصلاحيات', labelEn: 'Roles & Permissions', icon: ShieldCheck,     path: ROUTES.ADMIN.ROLES        },
      { key: 'admin-settings',  labelAr: 'إعدادات المؤسسة',    labelEn: 'Org Settings',        icon: Settings,        path: ROUTES.ADMIN.SETTINGS   },
    ],
  },
];

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
      { key: 'emp-home',    labelAr: 'الرئيسية',          labelEn: 'Dashboard',      icon: LayoutDashboard, path: ROUTES.EMPLOYEE.DASHBOARD     },
      { key: 'emp-tasks',   labelAr: 'مهامي',             labelEn: 'My Tasks',       icon: CheckSquare,     path: ROUTES.EMPLOYEE.TASKS         },
      { key: 'emp-msg',     labelAr: 'الرسائل',           labelEn: 'Messages',       icon: MessageSquare,   path: ROUTES.EMPLOYEE.MESSAGES      },
      { key: 'emp-req',     labelAr: 'طلباتى',            labelEn: 'My Requests',    icon: FileText,        path: ROUTES.EMPLOYEE.REQUESTS      },
      { key: 'emp-reports', labelAr: 'سجل الحضور',        labelEn: 'Attendance',     icon: ClipboardList,   path: ROUTES.EMPLOYEE.REPORTS       },
      { key: 'emp-daily',   labelAr: 'التقارير اليومية',  labelEn: 'Daily Reports',  icon: BarChart2,       path: ROUTES.EMPLOYEE.DAILY_REPORTS },
    ],
  },
];

// ── SEO Leader ────────────────────────────────────────────────────────────────

export const SEO_NAV: NavSectionDef[] = [
  {
    items: [
      { key: 'seo-dash',    labelAr: 'الرئيسية',                  labelEn: 'Dashboard',         icon: LayoutDashboard, path: ROUTES.SEO_LEADER.DASHBOARD },
      { key: 'seo-new',     labelAr: 'إنشاء مشروع جديد',          labelEn: 'New Project',        icon: FilePlus2,       path: ROUTES.SEO_LEADER.NEW      },
      { key: 'seo-team',    labelAr: 'فريق العمل',                labelEn: 'Team',               icon: Users,           path: ROUTES.SEO_LEADER.TEAM     },
      { key: 'seo-reports', labelAr: 'التقارير اليومية والطلبات', labelEn: 'Reports & Requests', icon: ClipboardList,   path: ROUTES.SEO_LEADER.REPORTS  },
    ],
  },
];

// ── SEO Member ────────────────────────────────────────────────────────────────

export const SEO_MEMBER_NAV: NavSectionDef[] = [
  {
    items: [
      { key: 'seo-m-dash',     labelAr: 'الرئيسية',          labelEn: 'Dashboard',      icon: LayoutDashboard, path: ROUTES.SEO_MEMBER.DASHBOARD     },
      { key: 'seo-m-tasks',   labelAr: 'مهامي',             labelEn: 'My Tasks',       icon: CheckSquare,     path: ROUTES.SEO_MEMBER.TASKS         },
      { key: 'seo-m-messages',labelAr: 'الرسائل',           labelEn: 'Messages',       icon: MessageSquare,   path: ROUTES.SEO_MEMBER.MESSAGES      },
      { key: 'seo-m-requests',labelAr: 'طلباتى',            labelEn: 'My Requests',    icon: FileText,        path: ROUTES.SEO_MEMBER.REQUESTS      },
      { key: 'seo-m-reports', labelAr: 'سجل الحضور',        labelEn: 'Attendance',     icon: ClipboardList,   path: ROUTES.SEO_MEMBER.REPORTS       },
      { key: 'seo-m-daily',   labelAr: 'التقارير اليومية',  labelEn: 'Daily Reports',  icon: BarChart2,       path: ROUTES.SEO_MEMBER.DAILY_REPORTS },
    ],
  },
];

// ── Lookup maps ───────────────────────────────────────────────────────────────

export const NAV_BY_VARIANT: Record<'admin' | 'hr' | 'pm' | 'employee' | 'seo' | 'seo-member', NavSectionDef[]> = {
  admin:       ADMIN_NAV,
  hr:          HR_NAV,
  pm:          PM_NAV,
  employee:    EMPLOYEE_NAV,
  seo:         SEO_NAV,
  'seo-member': SEO_MEMBER_NAV,
};

export const SUBTITLE: Record<'admin' | 'hr' | 'pm' | 'employee' | 'seo' | 'seo-member', { ar: string; en: string }> = {
  admin:        { ar: 'لوحة المشرف العام',    en: 'Admin Panel'     },
  hr:           { ar: 'نظام الموارد البشرية', en: 'HR System'       },
  pm:           { ar: 'مدير المشاريع',        en: 'Project Manager' },
  employee:     { ar: 'بوابة الموظف',         en: 'Employee Portal' },
  seo:          { ar: 'قائد SEO',             en: 'SEO Leader'      },
  'seo-member': { ar: 'موظف SEO',             en: 'SEO Member'      },
};

export const BRAND_NAME: Record<'admin' | 'hr' | 'pm' | 'employee' | 'seo' | 'seo-member', string> = {
  admin:        '',
  hr:           'Howaya HR',
  pm:           'Howaya HR',
  employee:     'Howaya HR',
  seo:          'Howaya HR',
  'seo-member': 'Howaya HR',
};
