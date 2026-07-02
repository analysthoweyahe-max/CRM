import type { AdminDashboardData } from '../types/adminDashboard.types';

// TODO: swap for a real endpoint once one is provided — shape matches the mock below.
const MOCK_DATA: AdminDashboardData = {
  stats: {
    totalEmployees:  48,
    activeEmployees: 42,
    hrUsers:         4,
    projectManagers: 6,
    employees:       38,
    activeProjects:  12,
  },
  roleDistribution: [
    { labelAr: 'الموظفون',       labelEn: 'Employees',        value: 38, percent: 79, color: '#A0CD39' },
    { labelAr: 'مديرو المشاريع', labelEn: 'Project Managers', value: 6,  percent: 13, color: '#3B82F6' },
    { labelAr: 'مستخدمو HR',     labelEn: 'HR Users',         value: 4,  percent: 8,  color: '#F59E0B' },
  ],
  departmentDistribution: [
    { labelAr: 'التطوير',         labelEn: 'Development',    value: 18 },
    { labelAr: 'إدارة المشاريع',  labelEn: 'Project Mgmt.',  value: 6  },
    { labelAr: 'التصميم',         labelEn: 'Design',         value: 8  },
    { labelAr: 'التسويق',         labelEn: 'Marketing',      value: 6  },
    { labelAr: 'الموارد البشرية', labelEn: 'HR',             value: 4  },
    { labelAr: 'الدعم الفني',     labelEn: 'Tech Support',   value: 6  },
  ],
  activity: [
    {
      id: '1', type: 'create',
      titleAr: 'إضافة موظف جديد', titleEn: 'New employee added',
      descriptionAr: 'تمت إضافة «خالد العمري» إلى قسم التطوير',
      descriptionEn: 'Added «Khaled Al-Omari» to the Development department',
      timeAr: 'قبل 5 دقائق', timeEn: '5 minutes ago',
    },
    {
      id: '2', type: 'update',
      titleAr: 'تحديث بيانات موظف', titleEn: 'Employee data updated',
      descriptionAr: 'تم تحديث بيانات «سارة خليل»',
      descriptionEn: 'Updated data for «Sarah Khalil»',
      timeAr: 'قبل 22 دقيقة', timeEn: '22 minutes ago',
    },
    {
      id: '3', type: 'permission',
      titleAr: 'تغيير صلاحيات', titleEn: 'Permissions changed',
      descriptionAr: 'تم تعديل صلاحيات دور «مدير المشاريع»',
      descriptionEn: 'Updated permissions for the «Project Manager» role',
      timeAr: 'قبل ساعة', timeEn: '1 hour ago',
    },
    {
      id: '4', type: 'delete',
      titleAr: 'حذف حساب موظف', titleEn: 'Employee account deleted',
      descriptionAr: 'تم حذف حساب «عمر فهد»',
      descriptionEn: 'Deleted account for «Omar Fahad»',
      timeAr: 'قبل 3 ساعات', timeEn: '3 hours ago',
    },
    {
      id: '5', type: 'update',
      titleAr: 'تحديث دور', titleEn: 'Role updated',
      descriptionAr: 'تم تحديث وصف دور «الموارد البشرية»',
      descriptionEn: 'Updated description for the «HR» role',
      timeAr: 'أمس، 28 يونيو 2026', timeEn: 'Yesterday, Jun 28 2026',
    },
  ],
};

export function useAdminDashboard() {
  return { isLoading: false, ...MOCK_DATA };
}
