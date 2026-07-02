import type { AdminEmployeeDetail, AdminEmployeeStatus } from '../types/adminEmployee.types';

export const MANAGER_ITEMS = [
  { id: '',  label: 'بدون مدير مباشر' },
  { id: '1', label: 'أحمد المنصور'    },
  { id: '2', label: 'ليلى عمر'        },
  { id: '3', label: 'منى الشريف'      },
];

const STATUS_LABEL: Record<AdminEmployeeStatus, { ar: string; en: string }> = {
  active:   { ar: 'نشط',  en: 'Active'   },
  disabled: { ar: 'معطل', en: 'Disabled' },
  pending:  { ar: 'معلق', en: 'Pending'  },
};

function emp(input: {
  id: string; name: string; email: string; avatarInitial: string; avatarColor: string;
  department: string; jobTitle: string; role: string; status: AdminEmployeeStatus;
  lastLoginAr: string; lastLoginEn: string; phone: string; address: string;
  employeeNumber: string; managerName: string; joiningDateAr: string; joiningDateEn: string;
  employmentTypeAr: string; employmentTypeEn: string; accountCreatedAr: string; accountCreatedEn: string;
  stats: AdminEmployeeDetail['stats']; activity: AdminEmployeeDetail['activity'];
  customPermissions: AdminEmployeeDetail['customPermissions'];
}): AdminEmployeeDetail {
  return {
    ...input,
    statusLabelAr: STATUS_LABEL[input.status].ar,
    statusLabelEn: STATUS_LABEL[input.status].en,
  };
}

export const MOCK_EMPLOYEES: AdminEmployeeDetail[] = [
  emp({
    id: '1', name: 'محمد علي', email: 'mohamed@howeyah.com', avatarInitial: 'مع', avatarColor: 'bg-emerald-500',
    department: 'التطوير', jobTitle: 'مطور واجهات', role: 'موظف', status: 'active',
    lastLoginAr: 'اليوم · 09:14', lastLoginEn: 'Today · 09:14',
    phone: '+966 50 123 4567', address: 'الرياض، المملكة العربية السعودية',
    employeeNumber: 'EMP-0012', managerName: 'ليلى عمر',
    joiningDateAr: '12 مارس 2024', joiningDateEn: 'Mar 12, 2024',
    employmentTypeAr: 'دوام كامل', employmentTypeEn: 'Full Time',
    accountCreatedAr: '12 مارس 2024', accountCreatedEn: 'Mar 12, 2024',
    stats: { projects: 2, tasksAssigned: 8, totalHours: 13, completionRate: 92 },
    activity: [
      { id: 'a1', titleAr: 'تسجيل الدخول',                     titleEn: 'Logged in',                    timeAr: 'اليوم · 09:14',   timeEn: 'Today · 09:14' },
      { id: 'a2', titleAr: 'تحديث الملف الشخصي',               titleEn: 'Updated personal profile',     timeAr: 'أمس · 16:30',     timeEn: 'Yesterday · 16:30' },
      { id: 'a3', titleAr: 'إنشاء مهمة جديدة',                 titleEn: 'Created a new task',           timeAr: '27 يونيو · 11:05', timeEn: 'Jun 27 · 11:05' },
      { id: 'a4', titleAr: 'اعتماد طلب إجازة',                 titleEn: 'Approved a leave request',     timeAr: '25 يونيو · 09:40', timeEn: 'Jun 25 · 09:40' },
      { id: 'a5', titleAr: 'إكمال مهمة «تطوير واجهة»',         titleEn: 'Completed task «UI Development»', timeAr: '24 يونيو · 14:20', timeEn: 'Jun 24 · 14:20' },
    ],
    customPermissions: {
      employees:  ['view'],
      projects:   ['view', 'create', 'edit'],
      tasks:      ['view', 'create', 'edit', 'delete'],
      attendance: ['view'],
      reports:    ['view', 'export'],
    },
  }),
  emp({
    id: '2', name: 'سارة خليل', email: 'sara@howeyah.com', avatarInitial: 'سخ', avatarColor: 'bg-purple-500',
    department: 'التصميم', jobTitle: 'مصممة UI/UX', role: 'موظف', status: 'active',
    lastLoginAr: 'اليوم · 08:50', lastLoginEn: 'Today · 08:50',
    phone: '+966 50 111 2233', address: 'جدة، المملكة العربية السعودية',
    employeeNumber: 'EMP-0013', managerName: 'ليلى عمر',
    joiningDateAr: '3 فبراير 2024', joiningDateEn: 'Feb 3, 2024',
    employmentTypeAr: 'دوام كامل', employmentTypeEn: 'Full Time',
    accountCreatedAr: '3 فبراير 2024', accountCreatedEn: 'Feb 3, 2024',
    stats: { projects: 3, tasksAssigned: 6, totalHours: 10, completionRate: 88 },
    activity: [
      { id: 'a1', titleAr: 'تسجيل الدخول', titleEn: 'Logged in', timeAr: 'اليوم · 08:50', timeEn: 'Today · 08:50' },
    ],
    customPermissions: { projects: ['view'], tasks: ['view', 'edit'] },
  }),
  emp({
    id: '3', name: 'يوسف حسن', email: 'youssef@howeyah.com', avatarInitial: 'يح', avatarColor: 'bg-cyan-500',
    department: 'التطوير', jobTitle: 'مطور خلفية', role: 'موظف', status: 'active',
    lastLoginAr: 'أمس · 17:22', lastLoginEn: 'Yesterday · 17:22',
    phone: '+966 50 222 3344', address: 'الدمام، المملكة العربية السعودية',
    employeeNumber: 'EMP-0014', managerName: 'ليلى عمر',
    joiningDateAr: '20 يناير 2024', joiningDateEn: 'Jan 20, 2024',
    employmentTypeAr: 'دوام كامل', employmentTypeEn: 'Full Time',
    accountCreatedAr: '20 يناير 2024', accountCreatedEn: 'Jan 20, 2024',
    stats: { projects: 2, tasksAssigned: 5, totalHours: 9, completionRate: 80 },
    activity: [
      { id: 'a1', titleAr: 'تسجيل الدخول', titleEn: 'Logged in', timeAr: 'أمس · 17:22', timeEn: 'Yesterday · 17:22' },
    ],
    customPermissions: { tasks: ['view', 'edit'] },
  }),
  emp({
    id: '4', name: 'ليلى عمر', email: 'layla@howeyah.com', avatarInitial: 'لع', avatarColor: 'bg-pink-500',
    department: 'التسويق', jobTitle: 'مختصة جودة', role: 'مدير مشاريع', status: 'active',
    lastLoginAr: 'اليوم · 10:05', lastLoginEn: 'Today · 10:05',
    phone: '+966 50 333 4455', address: 'الرياض، المملكة العربية السعودية',
    employeeNumber: 'EMP-0006', managerName: 'أحمد المنصور',
    joiningDateAr: '5 يونيو 2023', joiningDateEn: 'Jun 5, 2023',
    employmentTypeAr: 'دوام كامل', employmentTypeEn: 'Full Time',
    accountCreatedAr: '5 يونيو 2023', accountCreatedEn: 'Jun 5, 2023',
    stats: { projects: 6, tasksAssigned: 20, totalHours: 40, completionRate: 95 },
    activity: [
      { id: 'a1', titleAr: 'تسجيل الدخول', titleEn: 'Logged in', timeAr: 'اليوم · 10:05', timeEn: 'Today · 10:05' },
    ],
    customPermissions: { projects: ['view', 'create', 'edit', 'delete'], tasks: ['view', 'create', 'edit', 'delete'], employees: ['view'] },
  }),
  emp({
    id: '5', name: 'خالد العمري', email: 'khaled@howeyah.com', avatarInitial: 'خع', avatarColor: 'bg-orange-500',
    department: 'التطوير', jobTitle: 'مطور تطبيقات', role: 'موظف', status: 'disabled',
    lastLoginAr: 'قبل 3 أيام', lastLoginEn: '3 days ago',
    phone: '+966 50 444 5566', address: 'مكة المكرمة، المملكة العربية السعودية',
    employeeNumber: 'EMP-0021', managerName: 'ليلى عمر',
    joiningDateAr: '15 سبتمبر 2023', joiningDateEn: 'Sep 15, 2023',
    employmentTypeAr: 'دوام كامل', employmentTypeEn: 'Full Time',
    accountCreatedAr: '15 سبتمبر 2023', accountCreatedEn: 'Sep 15, 2023',
    stats: { projects: 1, tasksAssigned: 3, totalHours: 4, completionRate: 40 },
    activity: [
      { id: 'a1', titleAr: 'تعطيل الحساب', titleEn: 'Account disabled', timeAr: 'قبل 3 أيام', timeEn: '3 days ago' },
    ],
    customPermissions: { tasks: ['view'] },
  }),
  emp({
    id: '6', name: 'منى الشريف', email: 'mona@howeyah.com', avatarInitial: 'منش', avatarColor: 'bg-blue-500',
    department: 'الموارد البشرية', jobTitle: 'مديرة موارد بشرية', role: 'HR', status: 'active',
    lastLoginAr: 'اليوم · 08:30', lastLoginEn: 'Today · 08:30',
    phone: '+966 50 555 6677', address: 'الرياض، المملكة العربية السعودية',
    employeeNumber: 'EMP-0003', managerName: 'أحمد المنصور',
    joiningDateAr: '10 يناير 2023', joiningDateEn: 'Jan 10, 2023',
    employmentTypeAr: 'دوام كامل', employmentTypeEn: 'Full Time',
    accountCreatedAr: '10 يناير 2023', accountCreatedEn: 'Jan 10, 2023',
    stats: { projects: 0, tasksAssigned: 12, totalHours: 30, completionRate: 90 },
    activity: [
      { id: 'a1', titleAr: 'تسجيل الدخول', titleEn: 'Logged in', timeAr: 'اليوم · 08:30', timeEn: 'Today · 08:30' },
    ],
    customPermissions: { employees: ['view', 'create', 'edit', 'delete'], attendance: ['view', 'edit'], leaves: ['view', 'edit'], reports: ['view', 'export'] },
  }),
  emp({
    id: '7', name: 'عمر فهد', email: 'omar@howeyah.com', avatarInitial: 'عف', avatarColor: 'bg-gray-500',
    department: 'الدعم الفني', jobTitle: 'أخصائي دعم', role: 'موظف', status: 'pending',
    lastLoginAr: 'منذ أسبوع', lastLoginEn: 'A week ago',
    phone: '+966 50 666 7788', address: 'الرياض، المملكة العربية السعودية',
    employeeNumber: 'EMP-0034', managerName: 'ليلى عمر',
    joiningDateAr: '2 يونيو 2026', joiningDateEn: 'Jun 2, 2026',
    employmentTypeAr: 'دوام كامل', employmentTypeEn: 'Full Time',
    accountCreatedAr: '2 يونيو 2026', accountCreatedEn: 'Jun 2, 2026',
    stats: { projects: 0, tasksAssigned: 0, totalHours: 0, completionRate: 0 },
    activity: [
      { id: 'a1', titleAr: 'إنشاء الحساب', titleEn: 'Account created', timeAr: 'منذ أسبوع', timeEn: 'A week ago' },
    ],
    customPermissions: {},
  }),
];
