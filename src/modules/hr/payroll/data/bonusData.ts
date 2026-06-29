interface Bonus {
  id:              string;
  employeeName:    string;
  department:      string;
  initial:         string;
  avatarColor:     string;
  type:            string;
  amount:          number;
  reason:          string;
  date:            string;
  financialMonth:  string;
  source:          'auto' | 'manual';
}

export const BONUS_DATA: Bonus[] = [
  { id: '1',  employeeName: 'حسن الخطيب',  department: 'الموارد البشرية',  initial: 'ح', avatarColor: 'bg-red-400',    type: 'مكافأة أداء',  amount: 1700, reason: 'تميز في الأداء الوظيفي',                  date: '2026/06/14', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '2',  employeeName: 'حسن الخطيب',  department: 'تقنية المعلومات', initial: 'ح', avatarColor: 'bg-red-400',    type: 'مكافأة أداء',  amount: 800,  reason: 'إنجاز المشروع قبل الموعد',                date: '2026/06/12', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '3',  employeeName: 'سارة سعيد',   department: 'العمليات',        initial: 'س', avatarColor: 'bg-blue-400',   type: 'مكافأة أداء',  amount: 500,  reason: 'الالتزام بالحضور الكامل',                 date: '2026/06/12', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '4',  employeeName: 'سارة سعيد',   department: 'العمليات',        initial: 'س', avatarColor: 'bg-blue-400',   type: 'مكافأة أداء',  amount: 600,  reason: 'تجاوز المبيعات المستهدفة',                date: '2026/06/12', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '5',  employeeName: 'مريم سعيد',   department: 'خدمة العملاء',    initial: 'م', avatarColor: 'bg-purple-400', type: 'ساعات إضافية', amount: 400,  reason: 'ساعات إضافية لإنهاء المشروع',             date: '2026/06/11', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '6',  employeeName: 'رنا صبري',    department: 'المبيعات',        initial: 'ر', avatarColor: 'bg-orange-400', type: 'مكافأة يدوية', amount: 900,  reason: 'مكافأة مديرية استثنائية',                 date: '2026/06/10', financialMonth: 'يونيو 2026', source: 'manual' },
  { id: '7',  employeeName: 'نور أحمد',    department: 'الموارد البشرية',  initial: 'ن', avatarColor: 'bg-green-500',  type: 'ساعات إضافية', amount: 300,  reason: 'عمل إضافي في نهاية الأسبوع',              date: '2026/06/09', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '8',  employeeName: 'نور أحمد',    department: 'الموارد البشرية',  initial: 'ن', avatarColor: 'bg-green-500',  type: 'مكافأة أداء',  amount: 1300, reason: 'تميز في خدمة الموظفين وتحسين الإنتاجية',  date: '2026/06/08', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '9',  employeeName: 'أحمد محمد',   department: 'المبيعات',        initial: 'أ', avatarColor: 'bg-teal-400',   type: 'مكافأة أداء',  amount: 700,  reason: 'تجاوز الهدف الشهري بنسبة 30%',            date: '2026/06/07', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '10', employeeName: 'خالد العمري', department: 'تقنية المعلومات', initial: 'خ', avatarColor: 'bg-yellow-500', type: 'مكافأة أداء',  amount: 600,  reason: 'حل مشكلة تقنية حرجة',                    date: '2026/06/06', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '11', employeeName: 'فاطمة علي',   department: 'المحاسبة',        initial: 'ف', avatarColor: 'bg-pink-400',   type: 'ساعات إضافية', amount: 400,  reason: 'تدقيق الحسابات الشهرية',                  date: '2026/06/05', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '12', employeeName: 'مريم سعيد',   department: 'خدمة العملاء',    initial: 'م', avatarColor: 'bg-purple-400', type: 'مكافأة يدوية', amount: 800,  reason: 'مكافأة رضا العملاء المميز',                date: '2026/06/04', financialMonth: 'يونيو 2026', source: 'manual' },
  { id: '13', employeeName: 'خالد العمري', department: 'تقنية المعلومات', initial: 'خ', avatarColor: 'bg-yellow-500', type: 'ساعات إضافية', amount: 300,  reason: 'دعم فني طارئ ليلاً',                      date: '2026/06/03', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '14', employeeName: 'رنا صبري',    department: 'المبيعات',        initial: 'ر', avatarColor: 'bg-orange-400', type: 'مكافأة يدوية', amount: 400,  reason: 'مكافأة موسمية',                           date: '2026/06/02', financialMonth: 'يونيو 2026', source: 'manual' },
];

export const BONUS_DEPARTMENTS = ['كل الأقسام', ...Array.from(new Set(BONUS_DATA.map((d) => d.department)))];
export const BONUS_TYPES       = ['كل الأنواع', ...Array.from(new Set(BONUS_DATA.map((d) => d.type)))];
