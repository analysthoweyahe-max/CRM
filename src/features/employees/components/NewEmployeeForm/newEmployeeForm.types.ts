import { z } from 'zod';
import type { LucideIcon } from 'lucide-react';
import { User, Briefcase, Clock } from 'lucide-react';

/* ─── Currencies ─────────────────────────────────── */
export const CURRENCIES = [
  { id: 'EGP', label: 'EGP', detail: 'جنيه مصري'    },
  { id: 'USD', label: 'USD', detail: 'دولار أمريكي'  },
  { id: 'EUR', label: 'EUR', detail: 'يورو'          },
  { id: 'SAR', label: 'SAR', detail: 'ريال سعودي'    },
  { id: 'AED', label: 'AED', detail: 'درهم إماراتي'  },
  { id: 'GBP', label: 'GBP', detail: 'جنيه إسترليني' },
  { id: 'QAR', label: 'QAR', detail: 'ريال قطري'     },
  { id: 'KWD', label: 'KWD', detail: 'دينار كويتي'   },
];

/* ─── Combobox data ──────────────────────────────── */
export const DEPARTMENTS = [
  { id: 'hr',        label: 'الموارد البشرية' },
  { id: 'ops',       label: 'العمليات'        },
  { id: 'cs',        label: 'خدمة العملاء'    },
  { id: 'sales',     label: 'المبيعات'        },
  { id: 'it',        label: 'تقنية المعلومات' },
  { id: 'finance',   label: 'المحاسبة'        },
  { id: 'marketing', label: 'التسويق'         },
  { id: 'design',    label: 'التصميم'         },
];

export const JOB_TITLES = [
  { id: 'hr-manager',     label: 'مدير موارد بشرية' },
  { id: 'analyst',        label: 'محلل أعمال'        },
  { id: 'support-spec',   label: 'متخصص دعم'         },
  { id: 'sales-manager',  label: 'مدير مبيعات'       },
  { id: 'hr-spec',        label: 'أخصائي تطوير'      },
  { id: 'marketing-spec', label: 'أخصائي تسويق'      },
  { id: 'sales-rep',      label: 'مندوب مبيعات'      },
  { id: 'frontend-dev',   label: 'مطور واجهات'       },
  { id: 'accountant',     label: 'محاسب'             },
  { id: 'backend-dev',    label: 'مطور خلفية'        },
  { id: 'marketing-mgr',  label: 'مدير تسويق'        },
  { id: 'designer',       label: 'مصمم جرافيك'       },
  { id: 'ops-supervisor', label: 'مشرف عمليات'       },
  { id: 'regional-mgr',   label: 'مدير إقليمي'       },
  { id: 'gm',             label: 'مدير عام'           },
];

export const MANAGERS = [
  { id: 'none',    label: 'بدون مدير مباشر'                        },
  { id: 'EMP-001', label: 'حسن الخطيب',   detail: 'الموارد البشرية' },
  { id: 'EMP-004', label: 'رنا صبري',     detail: 'المبيعات'        },
  { id: 'EMP-010', label: 'ليلى منصور',   detail: 'التسويق'         },
  { id: 'EMP-013', label: 'طارق فريد',    detail: 'المبيعات'        },
  { id: 'EMP-014', label: 'منى الشريف',   detail: 'الموارد البشرية' },
];

/* ─── Job types ──────────────────────────────────── */
export interface JobTypeItem {
  id:      string;
  labelAr: string;
  labelEn: string;
  descAr:  string;
  descEn:  string;
  Icon:    LucideIcon;
}

export const JOB_TYPES: JobTypeItem[] = [
  {
    id: 'full-time', Icon: Briefcase,
    labelAr: 'دوام كامل',   labelEn: 'Full Time',
    descAr:  '8 ساعات يومياً براتب شهري ثابت',
    descEn:  '8 hours/day with fixed monthly salary',
  },
  {
    id: 'part-time', Icon: Clock,
    labelAr: 'دوام جزئي',   labelEn: 'Part Time',
    descAr:  'ساعات مرنة أو جدول ثابت',
    descEn:  'Flexible hours or fixed schedule',
  },
  {
    id: 'freelance', Icon: User,
    labelAr: 'عمل حر',      labelEn: 'Freelance',
    descAr:  'دفع حسب المشروع أو المهمة',
    descEn:  'Pay per project or task',
  },
];

/* ─── Schemas ────────────────────────────────────── */
export function makeStep1Schema(ar: boolean) {
  return z.object({
    fullName:   z.string().min(1, ar ? 'الاسم الكامل مطلوب'         : 'Full name is required'),
    email:      z.string()
                  .min(1,        ar ? 'البريد الإلكتروني مطلوب'    : 'Email is required')
                  .email(        ar ? 'البريد الإلكتروني غير صحيح' : 'Invalid email'),
    phone:      z.string().optional(),
    department: z.string().min(1, ar ? 'القسم مطلوب'                : 'Department is required'),
    jobTitle:   z.string().min(1, ar ? 'المسمى الوظيفي مطلوب'      : 'Job title is required'),
    hireDate:   z.string().min(1, ar ? 'تاريخ الالتحاق مطلوب'      : 'Hire date is required'),
    managerId:  z.string().optional(),
  });
}

export const step2Schema = z.object({
  jobType: z.enum(['full-time', 'part-time', 'freelance']),
});

export function makeStep3Schema(ar: boolean) {
  return z.object({
    salary: z.number({ message: ar ? 'أدخل قيمة صحيحة' : 'Enter a valid number' })
              .min(1, ar ? 'الراتب يجب أن يكون أكبر من صفر' : 'Salary must be greater than zero'),
  });
}

export const step4Schema = z.object({
  startTime: z.string().min(1),
  endTime:   z.string().min(1),
});

/* ─── Types ──────────────────────────────────────── */
export type Step1Values = z.infer<ReturnType<typeof makeStep1Schema>>;
export type Step2Values = z.infer<typeof step2Schema>;
export type Step3Values = z.infer<ReturnType<typeof makeStep3Schema>>;
export type Step4Values = z.infer<typeof step4Schema>;

/* ─── Combined 2-step schema ─────────────────────── */
export function makeAllDataSchema(ar: boolean) {
  return z.object({
    fullName:   z.string().min(1, ar ? 'الاسم الكامل مطلوب'          : 'Full name is required'),
    email:      z.string()
                  .min(1,  ar ? 'البريد الإلكتروني مطلوب'            : 'Email is required')
                  .email(  ar ? 'البريد الإلكتروني غير صحيح'         : 'Invalid email'),
    phone:      z.string().min(1, ar ? 'رقم الهاتف مطلوب'            : 'Phone is required'),
    department: z.string().min(1, ar ? 'القسم مطلوب'                  : 'Department is required'),
    jobTitle:   z.string().min(1, ar ? 'المسمى الوظيفي مطلوب'        : 'Job title is required'),
    hireDate:   z.string().min(1, ar ? 'تاريخ الالتحاق مطلوب'        : 'Hire date is required'),
    managerId:  z.string().optional(),
    jobType:    z.enum(['full-time', 'part-time', 'freelance'], {
                  message: ar ? 'نوع التوظيف مطلوب' : 'Job type is required',
                }),
    salary:     z.number({ message: ar ? 'أدخل قيمة صحيحة' : 'Enter a valid number' })
                  .min(1, ar ? 'الراتب يجب أن يكون أكبر من صفر' : 'Salary must be > 0'),
    currency:   z.string().min(1),
    startTime:  z.string().min(1),
    endTime:    z.string().min(1),
  });
}

export type AllDataValues = z.infer<ReturnType<typeof makeAllDataSchema>>;

export interface AllFormData {
  step1?: AllDataValues;
}
