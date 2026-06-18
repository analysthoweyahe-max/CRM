export type EmployeeStatus = 'active' | 'inactive' | 'pending';

export interface Employee {
  id:         string;
  name:       string;
  nameEn:     string;
  initial:    string;
  avatarBg:   string;
  email:      string;
  phone:      string;
  department: string;
  deptEn:     string;
  jobTitle:   string;
  jobTitleEn: string;
  hireDate:   string;
  status:     EmployeeStatus;
}

export const STATUS_STYLES: Record<EmployeeStatus, {
  bg: string; text: string; dot: string; labelAr: string; labelEn: string;
}> = {
  active:   { bg: '#D8EBAE', text: '#302F33', dot: '#709028', labelAr: 'نشط',   labelEn: 'Active'   },
  inactive: { bg: '#F0A696', text: '#861700', dot: '#BE123C', labelAr: 'مرفوض', labelEn: 'Inactive' },
  pending:  { bg: '#FFF296', text: '#A66B00', dot: '#B45309', labelAr: 'معلق',  labelEn: 'Pending'  },
};

export const EMPLOYEES: Employee[] = [
  { id: 'EMP-001', name: 'حسن الخطيب',  nameEn: 'Hassan Al-Khatib',  initial: 'ح', avatarBg: 'bg-red-400',    email: 'hassan@howeyah.com',  phone: '01252394675', department: 'الموارد البشرية',  deptEn: 'HR',          jobTitle: 'مدير موارد بشرية', jobTitleEn: 'HR Manager',         hireDate: '21/08/2025', status: 'active'   },
  { id: 'EMP-002', name: 'سارة سعيد',   nameEn: 'Sara Saeed',         initial: 'س', avatarBg: 'bg-blue-400',   email: 'sara@howeyah.com',    phone: '01063214789', department: 'العمليات',        deptEn: 'Operations',  jobTitle: 'محللة أعمال',      jobTitleEn: 'Business Analyst',   hireDate: '15/03/2025', status: 'active'   },
  { id: 'EMP-003', name: 'مريم سعيد',   nameEn: 'Mariam Saeed',       initial: 'م', avatarBg: 'bg-purple-400', email: 'mariam@howeyah.com',  phone: '01198765432', department: 'خدمة العملاء',    deptEn: 'Customer Svc',jobTitle: 'متخصصة دعم',     jobTitleEn: 'Support Specialist', hireDate: '01/06/2025', status: 'active'   },
  { id: 'EMP-004', name: 'رنا صبري',    nameEn: 'Rana Sabry',         initial: 'ر', avatarBg: 'bg-orange-400', email: 'rana@howeyah.com',    phone: '01234567890', department: 'المبيعات',        deptEn: 'Sales',       jobTitle: 'مدير مبيعات',      jobTitleEn: 'Sales Manager',      hireDate: '10/01/2025', status: 'active'   },
  { id: 'EMP-005', name: 'نور أحمد',    nameEn: 'Nour Ahmed',         initial: 'ن', avatarBg: 'bg-green-500',  email: 'nour@howeyah.com',    phone: '01512345678', department: 'الموارد البشرية',  deptEn: 'HR',          jobTitle: 'أخصائية تطوير',    jobTitleEn: 'HR Specialist',      hireDate: '05/09/2024', status: 'active'   },
  { id: 'EMP-006', name: 'أحمد محمد',   nameEn: 'Ahmed Mohamed',      initial: 'أ', avatarBg: 'bg-teal-400',   email: 'ahmed@howeyah.com',   phone: '01023456789', department: 'المبيعات',        deptEn: 'Sales',       jobTitle: 'مندوب مبيعات',     jobTitleEn: 'Sales Rep',          hireDate: '20/11/2024', status: 'active'   },
  { id: 'EMP-007', name: 'خالد العمري', nameEn: 'Khaled Al-Omari',    initial: 'خ', avatarBg: 'bg-yellow-500', email: 'khaled@howeyah.com',  phone: '01187654321', department: 'تقنية المعلومات', deptEn: 'IT',          jobTitle: 'مطور واجهات',      jobTitleEn: 'Frontend Developer', hireDate: '12/04/2025', status: 'active'   },
  { id: 'EMP-008', name: 'فاطمة علي',   nameEn: 'Fatima Ali',         initial: 'ف', avatarBg: 'bg-pink-400',   email: 'fatima@howeyah.com',  phone: '01298765432', department: 'المحاسبة',        deptEn: 'Finance',     jobTitle: 'محاسبة',           jobTitleEn: 'Accountant',         hireDate: '07/07/2025', status: 'active'   },
  { id: 'EMP-009', name: 'عمر حسين',    nameEn: 'Omar Hussein',       initial: 'ع', avatarBg: 'bg-indigo-400', email: 'omar@howeyah.com',    phone: '01145678901', department: 'تقنية المعلومات', deptEn: 'IT',          jobTitle: 'مطور خلفية',       jobTitleEn: 'Backend Developer',  hireDate: '30/09/2024', status: 'active'   },
  { id: 'EMP-010', name: 'ليلى منصور',  nameEn: 'Layla Mansour',      initial: 'ل', avatarBg: 'bg-rose-400',   email: 'layla@howeyah.com',   phone: '01067891234', department: 'التسويق',         deptEn: 'Marketing',   jobTitle: 'مديرة تسويق',      jobTitleEn: 'Marketing Manager',  hireDate: '18/02/2025', status: 'active'   },
  { id: 'EMP-011', name: 'يوسف كريم',   nameEn: 'Yousef Kareem',      initial: 'ي', avatarBg: 'bg-cyan-500',   email: 'yousef@howeyah.com',  phone: '01234509876', department: 'التصميم',         deptEn: 'Design',      jobTitle: 'مصمم جرافيك',      jobTitleEn: 'Graphic Designer',   hireDate: '25/05/2025', status: 'pending'  },
  { id: 'EMP-012', name: 'دينا طارق',   nameEn: 'Dina Tarek',         initial: 'د', avatarBg: 'bg-lime-500',   email: 'dina@howeyah.com',    phone: '01512309876', department: 'العمليات',        deptEn: 'Operations',  jobTitle: 'مشرفة عمليات',     jobTitleEn: 'Ops Supervisor',     hireDate: '11/10/2024', status: 'active'   },
  { id: 'EMP-013', name: 'طارق فريد',   nameEn: 'Tarek Fareed',       initial: 'ط', avatarBg: 'bg-amber-500',  email: 'tarek@howeyah.com',   phone: '01023489012', department: 'المبيعات',        deptEn: 'Sales',       jobTitle: 'مدير إقليمي',      jobTitleEn: 'Regional Manager',   hireDate: '03/08/2024', status: 'active'   },
  { id: 'EMP-014', name: 'منى الشريف',  nameEn: 'Mona El-Sherif',     initial: 'م', avatarBg: 'bg-violet-500', email: 'mona@howeyah.com',    phone: '01198760001', department: 'الموارد البشرية',  deptEn: 'HR',          jobTitle: 'مديرة عامة',       jobTitleEn: 'General Manager',    hireDate: '01/01/2024', status: 'inactive' },
];
