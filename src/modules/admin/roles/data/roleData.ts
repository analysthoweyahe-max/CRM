import type { ModuleDef, PermissionAction } from '../types/adminRole.types';

// Still used by the employee-detail "Custom Permissions" card, which stays
// mock until a per-employee permissions endpoint exists.
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
