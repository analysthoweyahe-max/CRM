import type { PermissionGroup } from '@/modules/admin/roles/types/adminRole.types';

/**
 * Permission slugs for the `admin` Spatie guard (27 total, backend-authoritative).
 * Do not add slugs here unless they exist in the backend catalogue.
 */
export const PANEL_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: 'administration',
    labelAr: 'الإدارة',
    labelEn: 'Administration',
    slugs: [
      { slug: 'create-admin', labelAr: 'إنشاء مدير', labelEn: 'Create Admin' },
      { slug: 'assign-role',  labelAr: 'تعيين دور',  labelEn: 'Assign Role'  },
    ],
  },
  {
    key: 'roles',
    labelAr: 'الأدوار والصلاحيات',
    labelEn: 'Roles & Permissions',
    slugs: [
      { slug: 'view-roles',        labelAr: 'عرض الأدوار',   labelEn: 'View Roles'        },
      { slug: 'create-role',       labelAr: 'إنشاء دور',     labelEn: 'Create Role'       },
      { slug: 'edit-role',         labelAr: 'تعديل دور',     labelEn: 'Edit Role'         },
      { slug: 'delete-role',       labelAr: 'حذف دور',       labelEn: 'Delete Role'       },
      { slug: 'view-permissions',  labelAr: 'عرض الصلاحيات', labelEn: 'View Permissions'  },
      { slug: 'create-permission', labelAr: 'إنشاء صلاحية', labelEn: 'Create Permission' },
      { slug: 'edit-permission',   labelAr: 'تعديل صلاحية', labelEn: 'Edit Permission'   },
      { slug: 'delete-permission', labelAr: 'حذف صلاحية',   labelEn: 'Delete Permission' },
    ],
  },
  {
    key: 'employees',
    labelAr: 'الموظفون',
    labelEn: 'Employees',
    slugs: [
      { slug: 'view-employees',  labelAr: 'عرض الموظفين', labelEn: 'View Employees'  },
      { slug: 'create-employee', labelAr: 'إضافة موظف',   labelEn: 'Create Employee' },
      { slug: 'edit-employee',   labelAr: 'تعديل موظف',   labelEn: 'Edit Employee'   },
      { slug: 'delete-employee', labelAr: 'حذف موظف',     labelEn: 'Delete Employee' },
    ],
  },
  {
    key: 'attendance',
    labelAr: 'الحضور',
    labelEn: 'Attendance',
    slugs: [
      { slug: 'view-attendance',   labelAr: 'عرض الحضور',   labelEn: 'View Attendance'   },
      { slug: 'manage-attendance', labelAr: 'إدارة الحضور', labelEn: 'Manage Attendance' },
    ],
  },
  {
    key: 'leave',
    labelAr: 'الإجازات',
    labelEn: 'Leave',
    slugs: [
      { slug: 'view-leave',    labelAr: 'عرض الإجازات',  labelEn: 'View Leave'    },
      { slug: 'approve-leave', labelAr: 'اعتماد الإجازات', labelEn: 'Approve Leave' },
    ],
  },
  {
    // Seeded on admin guard (project-manager / seo-manager / also hr-manager via all-admin sync).
    // UI: only show request surfaces in PM/SEO portals — never gate HR shell on these alone.
    key: 'requests',
    labelAr: 'الطلبات الإدارية',
    labelEn: 'Admin Requests',
    slugs: [
      { slug: 'view-requests',   labelAr: 'عرض الطلبات',   labelEn: 'View Requests'   },
      { slug: 'approve-request', labelAr: 'اعتماد الطلبات', labelEn: 'Approve Requests' },
    ],
  },
  {
    key: 'payroll',
    labelAr: 'الرواتب',
    labelEn: 'Payroll',
    slugs: [
      { slug: 'view-payroll',   labelAr: 'عرض الرواتب',  labelEn: 'View Payroll'   },
      { slug: 'manage-payroll', labelAr: 'إدارة الرواتب', labelEn: 'Manage Payroll' },
    ],
  },
  {
    key: 'pm-dashboard',
    labelAr: 'لوحة مدير المشاريع',
    labelEn: 'PM Dashboard',
    slugs: [
      { slug: 'view-pm-projects',  labelAr: 'مشاريعي',     labelEn: 'My Projects'    },
      { slug: 'create-pm-project', labelAr: 'إنشاء مشروع', labelEn: 'New Project'    },
      { slug: 'edit-pm-project',   labelAr: 'تعديل مشروع', labelEn: 'Edit Project'   },
      { slug: 'delete-pm-project', labelAr: 'حذف مشروع',   labelEn: 'Delete Project' },
    ],
  },
  {
    key: 'seo-dashboard',
    labelAr: 'لوحة مدير SEO',
    labelEn: 'SEO Dashboard',
    slugs: [
      { slug: 'view-seo-projects',  labelAr: 'مشاريعي',     labelEn: 'My Projects'  },
      { slug: 'create-seo-project', labelAr: 'إنشاء مشروع', labelEn: 'New Project'  },
      { slug: 'edit-seo-project',   labelAr: 'تعديل مشروع', labelEn: 'Edit Project' },
      { slug: 'delete-seo-project', labelAr: 'حذف مشروع',   labelEn: 'Delete Project' },
    ],
  },
];

/** Flat set of all curated permission slugs. */
export const PANEL_PERMISSION_SLUGS = new Set(
  PANEL_PERMISSION_GROUPS.flatMap((g) => g.slugs.map((s) => s.slug)),
);
