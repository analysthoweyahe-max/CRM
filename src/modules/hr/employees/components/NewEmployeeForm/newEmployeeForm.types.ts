import { z } from 'zod';
import type { LucideIcon } from 'lucide-react';
import { Briefcase, Clock, FileText, Home, GraduationCap } from 'lucide-react';

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

/* ─── Job types ──────────────────────────────────────────────────────────
   The set of employment types is now fetched live from
   GET /v1/employees/lookups/employment-types (value/label pairs, already
   localized by the backend). These maps only supply presentation extras
   (icon + short description) keyed by the API's `value` — any value the
   API returns that isn't listed here just falls back to a default icon
   and no description. ─────────────────────────────────────────────── */
export const EMPLOYMENT_TYPE_ICONS: Record<string, LucideIcon> = {
  full_time:  Briefcase,
  part_time:  Clock,
  contract:   FileText,
  remote:     Home,
  internship: GraduationCap,
};
export const DEFAULT_EMPLOYMENT_TYPE_ICON: LucideIcon = Briefcase;

export const EMPLOYMENT_TYPE_DESCRIPTIONS: Record<string, { ar: string; en: string }> = {
  full_time:  { ar: '8 ساعات يومياً براتب شهري ثابت', en: '8 hours/day with fixed monthly salary' },
  part_time:  { ar: 'ساعات مرنة أو جدول ثابت',        en: 'Flexible hours or fixed schedule' },
  contract:   { ar: 'تعاقد لمدة أو مشروع محدد',        en: 'Fixed-term or project-based contract' },
  remote:     { ar: 'العمل من أي مكان عن بُعد',        en: 'Work remotely from anywhere' },
  internship: { ar: 'فترة تدريبية محددة',              en: 'Fixed-term training period' },
};

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
  jobType: z.string().min(1),
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
    jobType:    z.string().min(1, ar ? 'نوع التوظيف مطلوب' : 'Job type is required'),
    salary:     z.number({ message: ar ? 'أدخل قيمة صحيحة' : 'Enter a valid number' })
                  .min(1, ar ? 'الراتب يجب أن يكون أكبر من صفر' : 'Salary must be > 0')
                  .optional(),
    currency:   z.string().min(1),
    startTime:  z.string().min(1),
    endTime:    z.string().min(1),
  });
}

export type AllDataValues = z.infer<ReturnType<typeof makeAllDataSchema>>;

export interface AllFormData {
  step1?: AllDataValues;
}
