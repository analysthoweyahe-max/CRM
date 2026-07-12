import type { PermissionGroup } from '@/modules/admin/roles/types/adminRole.types';

/**
 * Permission slugs for the `employee` Spatie guard (20 total, backend-authoritative) —
 * seo-employee / pm-employee / employee. Distinct catalogue from PANEL_PERMISSION_GROUPS,
 * which covers the `admin` guard.
 */
export const EMPLOYEE_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: 'seo',
    labelAr: 'SEO',
    labelEn: 'SEO',
    slugs: [
      { slug: 'view-seo-projects',      labelAr: 'عرض مشاريع SEO',    labelEn: 'View SEO Projects' },
      { slug: 'create-seo-project',     labelAr: 'إنشاء مشروع SEO',   labelEn: 'Create SEO Project' },
      { slug: 'edit-seo-project',       labelAr: 'تعديل مشروع SEO',   labelEn: 'Edit SEO Project' },
      { slug: 'view-seo-tasks',         labelAr: 'عرض مهام SEO',      labelEn: 'View SEO Tasks' },
      { slug: 'edit-seo-tasks',         labelAr: 'تعديل مهام SEO',    labelEn: 'Edit SEO Tasks' },
      { slug: 'view-seo-reports',       labelAr: 'عرض تقارير SEO',    labelEn: 'View SEO Reports' },
      { slug: 'view-seo-messages',      labelAr: 'رسائل SEO',         labelEn: 'View SEO Messages' },
      { slug: 'view-seo-notifications', labelAr: 'إشعارات SEO',       labelEn: 'View SEO Notifications' },
    ],
  },
  {
    key: 'pm',
    labelAr: 'إدارة المشاريع',
    labelEn: 'Project Management',
    slugs: [
      { slug: 'view-pm-projects',      labelAr: 'عرض مشاريع PM',   labelEn: 'View PM Projects' },
      { slug: 'create-pm-project',     labelAr: 'إنشاء مشروع PM',  labelEn: 'Create PM Project' },
      { slug: 'edit-pm-project',       labelAr: 'تعديل مشروع PM',  labelEn: 'Edit PM Project' },
      { slug: 'view-pm-tasks',         labelAr: 'عرض مهام PM',     labelEn: 'View PM Tasks' },
      { slug: 'edit-pm-tasks',         labelAr: 'تعديل مهام PM',   labelEn: 'Edit PM Tasks' },
      { slug: 'view-pm-messages',      labelAr: 'رسائل PM',        labelEn: 'View PM Messages' },
      { slug: 'view-pm-notifications', labelAr: 'إشعارات PM',      labelEn: 'View PM Notifications' },
    ],
  },
  {
    key: 'general',
    labelAr: 'عام',
    labelEn: 'General',
    slugs: [
      { slug: 'view-attendance',  labelAr: 'عرض الحضور',      labelEn: 'View Attendance' },
      { slug: 'view-leave',       labelAr: 'عرض الإجازات',    labelEn: 'View Leave' },
      { slug: 'request-leave',    labelAr: 'طلب إجازة',       labelEn: 'Request Leave' },
      { slug: 'view-notifications', labelAr: 'الإشعارات',     labelEn: 'View Notifications' },
      { slug: 'view-messages',    labelAr: 'الرسائل',         labelEn: 'View Messages' },
    ],
  },
];

/** Flat set of all employee-guard permission slugs. */
export const EMPLOYEE_PERMISSION_SLUGS = new Set(
  EMPLOYEE_PERMISSION_GROUPS.flatMap((g) => g.slugs.map((s) => s.slug)),
);
