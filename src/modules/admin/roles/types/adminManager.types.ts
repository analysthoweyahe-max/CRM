export const MANAGER_ROLE_OPTIONS = [
  { id: 'hr-manager',      labelAr: 'مدير موارد بشرية', labelEn: 'HR Manager'       },
  { id: 'project-manager', labelAr: 'مدير مشاريع',      labelEn: 'Project Manager'  },
  { id: 'seo-manager',     labelAr: 'مدير SEO',         labelEn: 'SEO Manager'      },
] as const;

export interface PermissionGroup {
  key:      string;
  labelAr:  string;
  labelEn:  string;
  slugs:    { slug: string; labelAr: string; labelEn: string }[];
}

export const MANAGER_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: 'employees', labelAr: 'الموظفون', labelEn: 'Employees',
    slugs: [
      { slug: 'view-employees',   labelAr: 'عرض',   labelEn: 'View'   },
      { slug: 'create-employee',  labelAr: 'إضافة', labelEn: 'Create' },
      { slug: 'edit-employee',    labelAr: 'تعديل', labelEn: 'Edit'   },
      { slug: 'delete-employee',  labelAr: 'حذف',   labelEn: 'Delete' },
    ],
  },
  {
    key: 'attendance', labelAr: 'الحضور', labelEn: 'Attendance',
    slugs: [
      { slug: 'view-attendance', labelAr: 'عرض', labelEn: 'View' },
    ],
  },
  {
    key: 'leave', labelAr: 'الإجازات', labelEn: 'Leave',
    slugs: [
      { slug: 'view-leave',    labelAr: 'عرض',    labelEn: 'View'    },
      { slug: 'approve-leave', labelAr: 'اعتماد', labelEn: 'Approve' },
    ],
  },
  {
    key: 'payroll', labelAr: 'الرواتب', labelEn: 'Payroll',
    slugs: [
      { slug: 'view-payroll',   labelAr: 'عرض',   labelEn: 'View'   },
      { slug: 'manage-payroll', labelAr: 'إدارة', labelEn: 'Manage' },
    ],
  },
];

export interface CreateAdminPayload {
  name:        string;
  email:       string;
  role:        string;
  permissions: string[];
}

export interface CreateAdminResponse {
  status:  string;
  message: string;
}
