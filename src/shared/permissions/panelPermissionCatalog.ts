import type { PermissionGroup } from '@/modules/admin/roles/types/adminRole.types';



/**

 * Permission slugs observed on real roles from GET /v1/roles and GET /v1/permissions.

 * Do not add slugs here unless they exist in the backend Spatie catalogue.

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

      { slug: 'view-attendance', labelAr: 'عرض الحضور', labelEn: 'View Attendance' },

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

      { slug: 'view-pm-projects',  labelAr: 'مشاريعي',               labelEn: 'My Projects'      },

      { slug: 'create-pm-project', labelAr: 'إنشاء مشروع',           labelEn: 'New Project'      },

      { slug: 'edit-pm-project',   labelAr: 'تعديل مشروع / القوالب', labelEn: 'Edit / Templates' },

      { slug: 'delete-pm-project', labelAr: 'حذف مشروع',             labelEn: 'Delete Project'   },

      { slug: 'view-pm-team',      labelAr: 'فريق العمل',            labelEn: 'Team'             },

      { slug: 'view-pm-reports',   labelAr: 'التقارير والطلبات',     labelEn: 'Reports'          },

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


