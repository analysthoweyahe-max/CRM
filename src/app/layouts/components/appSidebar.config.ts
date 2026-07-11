import {

  LayoutDashboard, Users, Clock, Banknote, MessageSquare, Settings,

  UserPlus, FileText, CalendarDays, TrendingDown, Gift, ShieldCheck,

  FilePlus2, ClipboardList, CheckSquare, BarChart2, Building2, Briefcase, Tags,

  UserCog, FolderKanban, Megaphone, MessagesSquare, ListChecks, Layers, Wallet,

  GitBranch, Receipt, FileSignature, Package, Target, Percent,

} from 'lucide-react';

import { ROUTES } from '@/app/router/routes';

import type { NavSectionDef } from './appSidebar.types';



// ── Admin ─────────────────────────────────────────────────────────────────────



export const ADMIN_NAV: NavSectionDef[] = [

  {

    sectionAr: 'المشرف العام',

    sectionEn: 'Super Admin',

    role: 'super-admin',

    items: [

      { key: 'admin-dash',     labelAr: 'الرئيسية',        labelEn: 'Dashboard',    icon: LayoutDashboard, path: ROUTES.ADMIN.DASHBOARD, role: 'super-admin' },

      { key: 'admin-instructions', labelAr: 'تعليمات فورية', labelEn: 'Realtime Instructions', icon: Megaphone, path: ROUTES.ADMIN.INSTRUCTIONS, role: 'super-admin' },

      { key: 'admin-messages-monitor', labelAr: 'مراقبة الرسائل', labelEn: 'Messages Monitor', icon: MessagesSquare, path: ROUTES.ADMIN.MESSAGES_MONITOR, role: 'super-admin' },

      { key: 'admin-settings', labelAr: 'إعدادات المؤسسة', labelEn: 'Org Settings', icon: Settings,        path: ROUTES.ADMIN.SETTINGS, role: 'super-admin' },

    ],

  },

  {

    sectionAr: 'لوحة الموارد البشرية',

    sectionEn: 'HR Dashboard',

    permissions: ['view-employees', 'view-attendance', 'view-leave', 'view-payroll'],

    items: [

      { key: 'hr-dash',           labelAr: 'الرئيسية',           labelEn: 'Dashboard',           icon: LayoutDashboard, path: ROUTES.DASHBOARD              },

      { key: 'admin-employees',   labelAr: 'إدارة الموظفين',     labelEn: 'Employees',           icon: Users,           path: ROUTES.ADMIN.EMPLOYEES,          permission: 'view-employees' },

      { key: 'admin-managers',    labelAr: 'المديرون',           labelEn: 'Managers',            icon: UserCog,         path: ROUTES.ADMIN.MANAGERS,           permissions: ['view-employees', 'create-admin'] },

      { key: 'admin-departments', labelAr: 'الأقسام',            labelEn: 'Departments',         icon: Building2,       path: ROUTES.ADMIN.DEPARTMENTS,        permission: 'view-employees' },

      { key: 'admin-job-titles',  labelAr: 'المسميات الوظيفية',  labelEn: 'Job Titles',          icon: Briefcase,       path: ROUTES.ADMIN.JOB_TITLES,         permission: 'view-employees' },

      { key: 'admin-roles',       labelAr: 'الأدوار',            labelEn: 'Roles',               icon: ShieldCheck,     path: ROUTES.ADMIN.ROLES,              role: 'super-admin' },

      { key: 'admin-permissions', labelAr: 'الصلاحيات',          labelEn: 'Permissions',         icon: ShieldCheck,     path: ROUTES.ADMIN.PERMISSIONS,        role: 'super-admin' },

      {

        key: 'hr-employees', labelAr: 'الموظفين', labelEn: 'Employees', icon: Users,

        permission: 'view-employees',

        children: [

          { key: 'hr-emp-list', labelAr: 'قائمة الموظفين', labelEn: 'Employee List', path: ROUTES.EMPLOYEES.LIST, icon: Users,    permission: 'view-employees' },

          { key: 'hr-emp-new',  labelAr: 'إضافة موظف',     labelEn: 'Add Employee',  path: ROUTES.EMPLOYEES.NEW,  icon: UserPlus, permission: 'create-employee' },

        ],

      },

      {

        key: 'hr-attendance', labelAr: 'الحضور والإجازات', labelEn: 'Attendance & Leaves', icon: Clock,

        permissions: ['view-attendance', 'view-leave'],

        children: [

          { key: 'hr-att-daily', labelAr: 'الحضور اليومي',  labelEn: 'Daily Attendance', path: ROUTES.ATTENDANCE.DAILY, icon: Clock,        permission: 'view-attendance' },

          { key: 'hr-att-log',   labelAr: 'سجل الحضور',     labelEn: 'Attendance Log',   path: ROUTES.ATTENDANCE.LOG,   icon: FileText,     permission: 'view-attendance' },

          { key: 'hr-att-exceptions', labelAr: 'طلبات الاستثناء', labelEn: 'Exception Requests', path: ROUTES.ATTENDANCE.EXCEPTIONS, icon: FileText, permission: 'view-attendance' },

          { key: 'hr-leaves',    labelAr: 'إدارة الإجازات', labelEn: 'Leave Management', path: ROUTES.LEAVES.LIST,      icon: CalendarDays, permission: 'view-leave' },

        ],

      },

      {

        key: 'hr-payroll', labelAr: 'الرواتب', labelEn: 'Payroll', icon: Banknote,

        permission: 'view-payroll',

        children: [

          { key: 'hr-salary-sheet', labelAr: 'كشف الرواتب', labelEn: 'Salary Sheet', path: ROUTES.PAYROLL.SALARY_SHEET, icon: Wallet, permissions: ['view-payroll', 'manage-payroll'] },

          { key: 'hr-deductions', labelAr: 'الخصومات',          labelEn: 'Deductions', path: ROUTES.PAYROLL.DEDUCTIONS, icon: TrendingDown, permission: 'view-payroll' },

          { key: 'hr-bonuses',    labelAr: 'المكافآت والحوافز', labelEn: 'Bonuses',    path: ROUTES.PAYROLL.BONUSES,    icon: Gift,         permission: 'view-payroll' },

          { key: 'hr-payroll-types', labelAr: 'أنواع المكافآت والخصومات', labelEn: 'Bonus & Deduction Types', path: ROUTES.PAYROLL.TYPES, icon: Layers, permission: 'view-payroll' },

        ],

      },

      { key: 'hr-messages', labelAr: 'الرسائل',    labelEn: 'Messages', icon: MessageSquare, path: ROUTES.MESSAGES },

    ],

  },

  {

    sectionAr: 'لوحة مدير المشاريع',

    sectionEn: 'PM Dashboard',

    permissions: ['view-pm-projects', 'create-pm-project', 'edit-pm-project', 'delete-pm-project'],

    items: [

      { key: 'pm-dash',    labelAr: 'الرئيسية',                  labelEn: 'Dashboard',          icon: LayoutDashboard, path: ROUTES.PROJECT_MANAGER.DASHBOARD },

      { key: 'pm-projects', labelAr: 'مشاريعي',                  labelEn: 'My Projects',        icon: FolderKanban,    path: ROUTES.PROJECT_MANAGER.MY_PROJECTS, permission: 'view-pm-projects' },

      { key: 'pm-messages', labelAr: 'الرسائل',                  labelEn: 'Messages',           icon: MessageSquare,   path: ROUTES.PROJECT_MANAGER.MESSAGES },

      { key: 'pm-new',     labelAr: 'إنشاء مشروع جديد',          labelEn: 'New Project',         icon: FilePlus2,       path: ROUTES.PROJECT_MANAGER.NEW,      permission: 'create-pm-project' },

      { key: 'pm-team',    labelAr: 'فريق العمل',                labelEn: 'Team',                 icon: Users,           path: ROUTES.PROJECT_MANAGER.TEAM,     permissions: ['view-pm-team', 'view-pm-projects'] },

      { key: 'pm-reports', labelAr: 'التقارير اليومية والطلبات', labelEn: 'Reports & Requests',   icon: ClipboardList,   path: ROUTES.PROJECT_MANAGER.REPORTS,  permissions: ['view-pm-reports', 'view-pm-projects'] },

      { key: 'pm-templates', labelAr: 'قوالب مشاريع PM', labelEn: 'PM Project Templates', icon: ListChecks, path: ROUTES.ADMIN.PROJECT_TEMPLATES, role: 'super-admin' },

      { key: 'admin-project-types', labelAr: 'أنواع المشاريع', labelEn: 'Project Types', icon: FolderKanban, path: ROUTES.ADMIN.PROJECT_TYPES, role: 'super-admin' },

    ],

  },

  {

    sectionAr: 'لوحة مدير SEO',

    sectionEn: 'SEO Manager Dashboard',

    permissions: ['view-seo-projects', 'create-seo-project', 'edit-seo-project', 'delete-seo-project'],

    items: [

      { key: 'seo-dash',    labelAr: 'الرئيسية',                  labelEn: 'Dashboard',           icon: LayoutDashboard, path: ROUTES.SEO_LEADER.DASHBOARD      },

      { key: 'seo-projects', labelAr: 'مشاريعي',                  labelEn: 'My Projects',         icon: FolderKanban,    path: ROUTES.SEO_LEADER.MY_PROJECTS,    permission: 'view-seo-projects' },

      { key: 'seo-messages', labelAr: 'الرسائل',                  labelEn: 'Messages',            icon: MessageSquare,   path: ROUTES.SEO_LEADER.MESSAGES },

      { key: 'seo-new',     labelAr: 'إنشاء مشروع جديد',          labelEn: 'New Project',          icon: FilePlus2,       path: ROUTES.SEO_LEADER.NEW,           permission: 'create-seo-project' },

      { key: 'seo-team',    labelAr: 'فريق العمل',                labelEn: 'Team',                  icon: Users,           path: ROUTES.SEO_LEADER.TEAM,          permission: 'view-seo-projects' },

      { key: 'seo-reports', labelAr: 'التقارير اليومية والطلبات', labelEn: 'Reports & Requests',    icon: ClipboardList,   path: ROUTES.SEO_LEADER.REPORTS,       permission: 'view-seo-projects' },

      { key: 'seo-templates', labelAr: 'قوالب مشاريع SEO', labelEn: 'SEO Project Templates', icon: ListChecks, path: ROUTES.ADMIN.SEO_PROJECT_TEMPLATES, role: 'super-admin' },

      { key: 'admin-seo-task-statuses', labelAr: 'حالات مهام SEO', labelEn: 'SEO Task Statuses', icon: Tags,            path: ROUTES.ADMIN.SEO_TASK_STATUSES, role: 'super-admin' },

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

        permission: 'view-employees',

        children: [

          { key: 'emp-list', labelAr: 'الموظفين',   labelEn: 'Employees',    path: ROUTES.EMPLOYEES.LIST, icon: Users,    permission: 'view-employees' },

          { key: 'emp-new',  labelAr: 'إضافة موظف', labelEn: 'Add Employee', path: ROUTES.EMPLOYEES.NEW,  icon: UserPlus, permission: 'create-employee' },

        ],

      },

      {

        key: 'attendance', labelAr: 'الحضور والإجازات', labelEn: 'Attendance & Leaves', icon: Clock,

        permissions: ['view-attendance', 'view-leave'],

        children: [

          { key: 'att-daily', labelAr: 'الحضور اليومي',  labelEn: 'Daily Attendance', path: ROUTES.ATTENDANCE.DAILY, icon: Clock,        permission: 'view-attendance' },

          { key: 'att-log',   labelAr: 'سجل الحضور',     labelEn: 'Attendance Log',   path: ROUTES.ATTENDANCE.LOG,   icon: FileText,     permission: 'view-attendance' },

          { key: 'att-exceptions', labelAr: 'طلبات الاستثناء', labelEn: 'Exception Requests', path: ROUTES.ATTENDANCE.EXCEPTIONS, icon: FileText, permission: 'view-attendance' },

          { key: 'leaves',    labelAr: 'إدارة الإجازات', labelEn: 'Leave Management', path: ROUTES.LEAVES.LIST,      icon: CalendarDays, permission: 'view-leave' },

        ],

      },

      {

        key: 'payroll', labelAr: 'الرواتب', labelEn: 'Payroll', icon: Banknote,

        permission: 'view-payroll',

        children: [

          { key: 'salary-sheet', labelAr: 'كشف الرواتب', labelEn: 'Salary Sheet', path: ROUTES.PAYROLL.SALARY_SHEET, icon: Wallet, permissions: ['view-payroll', 'manage-payroll'] },

          { key: 'deductions', labelAr: 'الخصومات',          labelEn: 'Deductions', path: ROUTES.PAYROLL.DEDUCTIONS, icon: TrendingDown, permission: 'view-payroll' },

          { key: 'bonuses',    labelAr: 'المكافآت والحوافز', labelEn: 'Bonuses',    path: ROUTES.PAYROLL.BONUSES,    icon: Gift,         permission: 'view-payroll' },

          { key: 'payroll-types', labelAr: 'أنواع المكافآت والخصومات', labelEn: 'Bonus & Deduction Types', path: ROUTES.PAYROLL.TYPES, icon: Layers, permission: 'view-payroll' },

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



// ── Shared HR operations (employees, attendance, payroll) ─────────────────────

const HR_OPERATIONS_ITEMS: NavSectionDef['items'] = [
  {
    key: 'employees', labelAr: 'إدارة الموظفين', labelEn: 'Employees', icon: Users,
    permission: 'view-employees',
    children: [
      { key: 'emp-list', labelAr: 'قائمة الموظفين', labelEn: 'Employee List', path: ROUTES.EMPLOYEES.LIST, icon: Users,    permission: 'view-employees' },
      { key: 'emp-new',  labelAr: 'إضافة موظف',     labelEn: 'Add Employee',  path: ROUTES.EMPLOYEES.NEW,  icon: UserPlus, permission: 'create-employee' },
    ],
  },
  {
    key: 'attendance', labelAr: 'الحضور والإجازات', labelEn: 'Attendance & Leaves', icon: Clock,
    permissions: ['view-attendance', 'view-leave', 'approve-leave'],
    children: [
      { key: 'att-daily', labelAr: 'الحضور اليومي',  labelEn: 'Daily Attendance', path: ROUTES.ATTENDANCE.DAILY, icon: Clock,        permission: 'view-attendance' },
      { key: 'att-log',   labelAr: 'سجل الحضور',     labelEn: 'Attendance Log',   path: ROUTES.ATTENDANCE.LOG,   icon: FileText,     permission: 'view-attendance' },
      { key: 'att-exceptions', labelAr: 'طلبات الاستثناء', labelEn: 'Exception Requests', path: ROUTES.ATTENDANCE.EXCEPTIONS, icon: FileText, permission: 'view-attendance' },
      { key: 'leaves',    labelAr: 'إدارة الإجازات', labelEn: 'Leave Management', path: ROUTES.LEAVES.LIST,      icon: CalendarDays, permission: ['view-leave', 'approve-leave'] },
    ],
  },
  {
    key: 'payroll', labelAr: 'الرواتب', labelEn: 'Payroll', icon: Banknote,
    permissions: ['view-payroll', 'manage-payroll'],
    children: [
      { key: 'salary-sheet', labelAr: 'كشف الرواتب', labelEn: 'Salary Sheet', path: ROUTES.PAYROLL.SALARY_SHEET, icon: Wallet, permission: ['view-payroll', 'manage-payroll'] },
      { key: 'deductions', labelAr: 'الخصومات',          labelEn: 'Deductions', path: ROUTES.PAYROLL.DEDUCTIONS, icon: TrendingDown, permission: ['view-payroll', 'manage-payroll'] },
      { key: 'bonuses',    labelAr: 'المكافآت والحوافز', labelEn: 'Bonuses',    path: ROUTES.PAYROLL.BONUSES,    icon: Gift,         permission: ['view-payroll', 'manage-payroll'] },
      { key: 'payroll-types', labelAr: 'أنواع المكافآت والخصومات', labelEn: 'Bonus & Deduction Types', path: ROUTES.PAYROLL.TYPES, icon: Layers, permission: ['view-payroll', 'manage-payroll'] },
    ],
  },
];

const HR_OPERATIONS_SECTION: NavSectionDef = {
  sectionAr:   'الموارد البشرية',
  sectionEn:   'Human Resources',
  permissions: ['view-employees', 'view-attendance', 'view-leave', 'approve-leave', 'view-payroll', 'manage-payroll'],
  items:       HR_OPERATIONS_ITEMS,
};

// ── PM ────────────────────────────────────────────────────────────────────────

export const PM_NAV: NavSectionDef[] = [
  {
    sectionAr: 'المشاريع',
    sectionEn: 'Projects',
    items: [
      { key: 'pm-dash',    labelAr: 'الرئيسية',                 labelEn: 'Dashboard',         icon: LayoutDashboard, path: ROUTES.PROJECT_MANAGER.DASHBOARD },
      { key: 'pm-projects', labelAr: 'مشاريعي',                 labelEn: 'My Projects',       icon: FolderKanban,    path: ROUTES.PROJECT_MANAGER.MY_PROJECTS },
      { key: 'pm-tasks',   labelAr: 'مهامي',                   labelEn: 'My Tasks',          icon: CheckSquare,     path: ROUTES.PROJECT_MANAGER.TASKS },
      { key: 'pm-new',     labelAr: 'إنشاء مشروع جديد',        labelEn: 'New Project',        icon: FilePlus2,       path: ROUTES.PROJECT_MANAGER.NEW },
      { key: 'pm-team',    labelAr: 'فريق العمل',               labelEn: 'Team',               icon: Users,           path: ROUTES.PROJECT_MANAGER.TEAM,     permissions: ['view-pm-team', 'view-pm-projects'] },
      { key: 'pm-reports', labelAr: 'التقارير اليومية والطلبات',labelEn: 'Reports & Requests', icon: ClipboardList,   path: ROUTES.PROJECT_MANAGER.REPORTS,  permissions: ['view-pm-reports', 'view-pm-projects'] },
      { key: 'pm-templates', labelAr: 'قوالب المشاريع', labelEn: 'Project Templates', icon: ListChecks, path: ROUTES.PROJECT_MANAGER.TEMPLATES, permission: 'edit-pm-project' },
    ],
  },
  {
    sectionAr: 'حضوري / راتبي',
    sectionEn: 'My Work & Pay',
    items: [
      { key: 'work_overview', labelAr: 'نظرة عامة على العمل', labelEn: 'Work Overview', icon: BarChart2,     path: ROUTES.PROJECT_MANAGER.WORK_OVERVIEW },
      { key: 'attendance',    labelAr: 'الحضور والانصراف',   labelEn: 'Attendance',    icon: Clock,        path: ROUTES.PROJECT_MANAGER.ATTENDANCE },
      { key: 'deductions',    labelAr: 'خصوماتي',            labelEn: 'My Deductions', icon: TrendingDown, path: ROUTES.PROJECT_MANAGER.DEDUCTIONS },
      { key: 'bonuses',       labelAr: 'مكافآتي',            labelEn: 'My Bonuses',    icon: Gift,         path: ROUTES.PROJECT_MANAGER.BONUSES },
    ],
  },
  HR_OPERATIONS_SECTION,
];



// ── Employee ──────────────────────────────────────────────────────────────────



export const EMPLOYEE_NAV: NavSectionDef[] = [

  {

    items: [

      { key: 'emp-home',    labelAr: 'الرئيسية',          labelEn: 'Dashboard',      icon: LayoutDashboard, path: ROUTES.EMPLOYEE.DASHBOARD     },

      { key: 'emp-projects', labelAr: 'مشاريعي',          labelEn: 'My Projects',    icon: FolderKanban,    path: ROUTES.EMPLOYEE.MY_PROJECTS   },

      { key: 'emp-new',     labelAr: 'إنشاء مشروع جديد', labelEn: 'New Project',    icon: FilePlus2,       path: ROUTES.PROJECT_MANAGER.NEW   },

      { key: 'emp-tasks',   labelAr: 'مهامي',             labelEn: 'My Tasks',       icon: CheckSquare,     path: ROUTES.EMPLOYEE.TASKS         },

      { key: 'emp-msg',     labelAr: 'الرسائل',           labelEn: 'Messages',       icon: MessageSquare,   path: ROUTES.EMPLOYEE.MESSAGES      },

      { key: 'emp-alerts',  labelAr: 'التنبيهات',          labelEn: 'Alerts',         icon: Megaphone,       path: ROUTES.EMPLOYEE.ALERTS        },

      { key: 'emp-req',     labelAr: 'طلباتى',            labelEn: 'My Requests',    icon: FileText,        path: ROUTES.EMPLOYEE.REQUESTS      },

      { key: 'emp-daily',   labelAr: 'التقارير اليومية',  labelEn: 'Daily Reports',  icon: BarChart2,       path: ROUTES.EMPLOYEE.DAILY_REPORTS },

    ],

  },

  {
    sectionAr: 'حضوري / راتبي',
    sectionEn: 'My Work & Pay',
    items: [
      { key: 'work_overview', labelAr: 'نظرة عامة على العمل', labelEn: 'Work Overview', icon: BarChart2,     path: ROUTES.EMPLOYEE.WORK_OVERVIEW },
      { key: 'attendance',    labelAr: 'الحضور والانصراف',   labelEn: 'Attendance',    icon: Clock,        path: ROUTES.EMPLOYEE.ATTENDANCE },
      { key: 'deductions',    labelAr: 'خصوماتي',            labelEn: 'My Deductions', icon: TrendingDown, path: ROUTES.EMPLOYEE.DEDUCTIONS },
      { key: 'bonuses',       labelAr: 'مكافآتي',            labelEn: 'My Bonuses',    icon: Gift,         path: ROUTES.EMPLOYEE.BONUSES },
    ],
  },

];



// ── SEO Leader ────────────────────────────────────────────────────────────────



export const SEO_NAV: NavSectionDef[] = [
  {
    sectionAr: 'SEO',
    sectionEn: 'SEO',
    items: [
      { key: 'seo-dash',    labelAr: 'الرئيسية',                  labelEn: 'Dashboard',         icon: LayoutDashboard, path: ROUTES.SEO_LEADER.DASHBOARD },
      { key: 'seo-projects', labelAr: 'مشاريعي',                  labelEn: 'My Projects',       icon: FolderKanban,    path: ROUTES.SEO_LEADER.MY_PROJECTS },
      { key: 'seo-tasks',   labelAr: 'مهامي',                    labelEn: 'My Tasks',          icon: CheckSquare,     path: ROUTES.SEO_LEADER.TASKS },
      { key: 'seo-new',     labelAr: 'إنشاء مشروع جديد',          labelEn: 'New Project',        icon: FilePlus2,       path: ROUTES.SEO_LEADER.NEW },
      { key: 'seo-team',    labelAr: 'فريق العمل',                labelEn: 'Team',               icon: Users,           path: ROUTES.SEO_LEADER.TEAM,     permission: 'view-seo-projects' },
      { key: 'seo-reports', labelAr: 'التقارير اليومية والطلبات', labelEn: 'Reports & Requests', icon: ClipboardList,   path: ROUTES.SEO_LEADER.REPORTS,  permission: 'view-seo-projects' },
      { key: 'seo-templates', labelAr: 'قوالب مشاريع SEO', labelEn: 'SEO Project Templates', icon: ListChecks, path: ROUTES.SEO_LEADER.TEMPLATES, permission: 'edit-seo-project' },
    ],
  },
  {
    sectionAr: 'حضوري / راتبي',
    sectionEn: 'My Work & Pay',
    items: [
      { key: 'work_overview', labelAr: 'نظرة عامة على العمل', labelEn: 'Work Overview', icon: BarChart2,     path: ROUTES.SEO_LEADER.WORK_OVERVIEW },
      { key: 'attendance',    labelAr: 'الحضور والانصراف',   labelEn: 'Attendance',    icon: Clock,        path: ROUTES.SEO_LEADER.ATTENDANCE },
      { key: 'deductions',    labelAr: 'خصوماتي',            labelEn: 'My Deductions', icon: TrendingDown, path: ROUTES.SEO_LEADER.DEDUCTIONS },
      { key: 'bonuses',       labelAr: 'مكافآتي',            labelEn: 'My Bonuses',    icon: Gift,         path: ROUTES.SEO_LEADER.BONUSES },
    ],
  },
  HR_OPERATIONS_SECTION,
];



// ── SEO Member ────────────────────────────────────────────────────────────────



export const SEO_MEMBER_NAV: NavSectionDef[] = [

  {

    items: [

      { key: 'seo-m-dash',     labelAr: 'الرئيسية',          labelEn: 'Dashboard',      icon: LayoutDashboard, path: ROUTES.SEO_MEMBER.DASHBOARD     },

      { key: 'seo-m-projects', labelAr: 'مشاريعي',          labelEn: 'My Projects',    icon: FolderKanban,    path: ROUTES.SEO_MEMBER.MY_PROJECTS   },

      { key: 'seo-m-new',     labelAr: 'إنشاء مشروع جديد', labelEn: 'New Project',    icon: FilePlus2,       path: ROUTES.SEO_MEMBER.NEW          },

      { key: 'seo-m-tasks',   labelAr: 'مهامي',             labelEn: 'My Tasks',       icon: CheckSquare,     path: ROUTES.SEO_MEMBER.TASKS         },

      { key: 'seo-m-messages',labelAr: 'الرسائل',           labelEn: 'Messages',       icon: MessageSquare,   path: ROUTES.SEO_MEMBER.MESSAGES      },

      { key: 'seo-m-requests',labelAr: 'طلباتى',            labelEn: 'My Requests',    icon: FileText,        path: ROUTES.SEO_MEMBER.REQUESTS      },

      { key: 'seo-m-daily',   labelAr: 'التقارير اليومية',  labelEn: 'Daily Reports',  icon: BarChart2,       path: ROUTES.SEO_MEMBER.DAILY_REPORTS },

    ],

  },

  {
    sectionAr: 'حضوري / راتبي',
    sectionEn: 'My Work & Pay',
    items: [
      { key: 'work_overview', labelAr: 'نظرة عامة على العمل', labelEn: 'Work Overview', icon: BarChart2,     path: ROUTES.SEO_MEMBER.WORK_OVERVIEW },
      { key: 'attendance',    labelAr: 'الحضور والانصراف',   labelEn: 'Attendance',    icon: Clock,        path: ROUTES.SEO_MEMBER.ATTENDANCE },
      { key: 'deductions',    labelAr: 'خصوماتي',            labelEn: 'My Deductions', icon: TrendingDown, path: ROUTES.SEO_MEMBER.DEDUCTIONS },
      { key: 'bonuses',       labelAr: 'مكافآتي',            labelEn: 'My Bonuses',    icon: Gift,         path: ROUTES.SEO_MEMBER.BONUSES },
    ],
  },

];



// ── Sales ─────────────────────────────────────────────────────────────────────

export const SALES_NAV: NavSectionDef[] = [
  {
    sectionAr: 'المبيعات',
    sectionEn: 'Sales',
    items: [
      { key: 'sales-dash',        labelAr: 'لوحة التحكم',           labelEn: 'Dashboard',          icon: LayoutDashboard, path: ROUTES.SALES.DASHBOARD },
      { key: 'sales-leads',       labelAr: 'العملاء المحتملون',      labelEn: 'Leads',              icon: UserPlus,        path: ROUTES.SALES.LEADS },
      { key: 'sales-customers',   labelAr: 'العملاء',               labelEn: 'Customers',          icon: Users,           path: ROUTES.SALES.CUSTOMERS },
      { key: 'sales-pipeline',    labelAr: 'مسار المبيعات',         labelEn: 'Sales Pipeline',     icon: GitBranch,       path: ROUTES.SALES.PIPELINE },
      { key: 'sales-quotes',      labelAr: 'عروض الأسعار',          labelEn: 'Price Quotes',       icon: FileText,        path: ROUTES.SALES.QUOTES },
      { key: 'sales-invoices',    labelAr: 'الفواتير',              labelEn: 'Invoices',           icon: Receipt,         path: ROUTES.SALES.INVOICES },
      { key: 'sales-payments',    labelAr: 'المدفوعات',             labelEn: 'Payments',           icon: Wallet,          path: ROUTES.SALES.PAYMENTS },
      { key: 'sales-contracts',   labelAr: 'العقود',                labelEn: 'Contracts',          icon: FileSignature,  path: ROUTES.SALES.CONTRACTS },
      { key: 'sales-calendar',    labelAr: 'التقويم',               labelEn: 'Calendar',           icon: CalendarDays,   path: ROUTES.SALES.CALENDAR },
      { key: 'sales-tasks',       labelAr: 'المهام',                labelEn: 'Tasks',              icon: ListChecks,      path: ROUTES.SALES.TASKS },
      { key: 'sales-products',    labelAr: 'المنتجات والخدمات',     labelEn: 'Products & Services',icon: Package,         path: ROUTES.SALES.PRODUCTS },
      { key: 'sales-employees',   labelAr: 'الموظفون',              labelEn: 'Employees',          icon: UserCog,         path: ROUTES.SALES.EMPLOYEES },
      { key: 'sales-goals',       labelAr: 'الأهداف',               labelEn: 'Goals',              icon: Target,          path: ROUTES.SALES.GOALS },
      { key: 'sales-commissions', labelAr: 'العمولات',              labelEn: 'Commissions',        icon: Percent,         path: ROUTES.SALES.COMMISSIONS },
      { key: 'sales-reports',     labelAr: 'التقارير',              labelEn: 'Reports',            icon: BarChart2,       path: ROUTES.SALES.REPORTS },
      { key: 'sales-settings',    labelAr: 'الإعدادات',             labelEn: 'Settings',           icon: Settings,        path: ROUTES.SALES.SETTINGS },
    ],
  },
];

// ── Lookup maps ───────────────────────────────────────────────────────────────



export const NAV_BY_VARIANT: Record<'admin' | 'hr' | 'pm' | 'employee' | 'seo' | 'seo-member' | 'sales', NavSectionDef[]> = {

  admin:       ADMIN_NAV,

  hr:          HR_NAV,

  pm:          PM_NAV,

  employee:    EMPLOYEE_NAV,

  seo:         SEO_NAV,

  'seo-member': SEO_MEMBER_NAV,

  sales:       SALES_NAV,

};



export const SUBTITLE: Record<'admin' | 'hr' | 'pm' | 'employee' | 'seo' | 'seo-member' | 'sales', { ar: string; en: string }> = {

  admin:        { ar: 'لوحة المشرف العام',    en: 'Admin Panel'     },

  hr:           { ar: 'نظام الموارد البشرية', en: 'HR System'       },

  pm:           { ar: 'مدير المشاريع',        en: 'Project Manager' },

  employee:     { ar: 'بوابة الموظف',         en: 'Employee Portal' },

  seo:          { ar: 'قائد SEO',             en: 'SEO Leader'      },

  'seo-member': { ar: 'موظف SEO',             en: 'SEO Member'      },

  sales:        { ar: 'منصة المبيعات',        en: 'Sales Platform'  },

};



export const BRAND_NAME: Record<'admin' | 'hr' | 'pm' | 'employee' | 'seo' | 'seo-member' | 'sales', string> = {

  admin:        '',

  hr:           'Howeyah HR',

  pm:           'Howeyah HR',

  employee:     'Howeyah HR',

  seo:          'Howeyah HR',

  'seo-member': 'Howeyah HR',

  sales:        'Howeyah Sales',

};


