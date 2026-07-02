import type { ModuleDef, RoleDef, PermissionMatrix, PermissionAction } from '../types/adminRole.types';

export const ACTION_LABELS: Record<PermissionAction, { ar: string; en: string }> = {
  view:   { ar: 'عرض',   en: 'View'   },
  create: { ar: 'إنشاء', en: 'Create' },
  edit:   { ar: 'تعديل', en: 'Edit'   },
  delete: { ar: 'حذف',   en: 'Delete' },
  export: { ar: 'تصدير', en: 'Export' },
};

export const MODULES: ModuleDef[] = [
  { key: 'employees',  labelAr: 'الموظفون',  labelEn: 'Employees',  actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'projects',   labelAr: 'المشاريع',  labelEn: 'Projects',   actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'tasks',      labelAr: 'المهام',    labelEn: 'Tasks',      actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'attendance', labelAr: 'الحضور',    labelEn: 'Attendance', actions: ['view', 'edit'] },
  { key: 'leaves',     labelAr: 'الإجازات',  labelEn: 'Leaves',     actions: ['view', 'edit'] },
  { key: 'reports',    labelAr: 'التقارير',  labelEn: 'Reports',    actions: ['view', 'export'] },
  { key: 'settings',   labelAr: 'الإعدادات', labelEn: 'Settings',   actions: ['view', 'edit'] },
];

export const INITIAL_ROLES: RoleDef[] = [
  {
    key: 'super_admin', nameAr: 'المشرف العام', nameEn: 'Super Admin',
    descriptionAr: 'صلاحية كاملة على النظام وإدارة المؤسسة والأدوار',
    descriptionEn: 'Full system access and organization/role management',
    usersCount: 2, isSystem: true,
  },
  {
    key: 'hr', nameAr: 'الموارد البشرية', nameEn: 'HR',
    descriptionAr: 'إدارة الموظفين والحضور والإجازات والتقارير',
    descriptionEn: 'Manage employees, attendance, leaves, and reports',
    usersCount: 4,
  },
  {
    key: 'manager', nameAr: 'مدير المشاريع', nameEn: 'Project Manager',
    descriptionAr: 'إدارة المشاريع والمهام وفرق العمل والعملاء',
    descriptionEn: 'Manage projects, tasks, teams, and clients',
    usersCount: 6,
  },
  {
    key: 'employee', nameAr: 'موظف', nameEn: 'Employee',
    descriptionAr: 'الوصول للمهام والمشاريع المسندة والتقارير اليومية',
    descriptionEn: 'Access assigned tasks, projects, and daily reports',
    usersCount: 36,
  },
];

export const INITIAL_MATRIX: PermissionMatrix = {
  hr: {
    employees:  ['view', 'create', 'edit', 'delete'],
    projects:   ['view'],
    tasks:      ['view'],
    attendance: ['view', 'edit'],
    leaves:     ['view', 'edit'],
    reports:    ['view', 'export'],
    settings:   ['view'],
  },
  manager: {
    employees:  ['view', 'create'],
    projects:   ['view', 'create', 'edit', 'delete'],
    tasks:      ['view', 'create', 'edit', 'delete'],
    attendance: ['view', 'edit'],
    leaves:     ['view'],
    reports:    ['view', 'export'],
    settings:   ['view'],
  },
  employee: {
    employees:  ['view'],
    projects:   ['view'],
    tasks:      ['view', 'create', 'edit'],
    attendance: [],
    leaves:     [],
    reports:    ['view'],
    settings:   [],
  },
};
