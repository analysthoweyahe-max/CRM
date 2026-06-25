import { z } from 'zod';

export const makeBonusSchema = (isAr: boolean) =>
  z.object({
    employee_id: z.string().min(1,
      isAr ? 'يرجى اختيار الموظف' : 'Please select an employee'),

    adjustment_type: z.string().min(1,
      isAr ? 'يرجى اختيار نوع المكافأة' : 'Please select a bonus type'),

    financial_month: z.string().min(1,
      isAr ? 'يرجى تحديد الفترة المالية' : 'Please select a financial period'),

    amount: z
      .string()
      .min(1, isAr ? 'يرجى إدخال المبلغ' : 'Please enter an amount')
      .refine((v) => Number(v) > 0,
        isAr ? 'يجب أن يكون المبلغ أكبر من صفر' : 'Amount must be greater than zero'),

    reason: z.string().min(3,
      isAr ? 'يرجى إدخال سبب المكافأة (٣ أحرف على الأقل)' : 'Please enter a reason (min 3 chars)'),

    notes: z.string().optional(),
  });
