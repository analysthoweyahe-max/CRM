import { z } from 'zod';

export const makeDeductionSchema = (isAr: boolean) =>
  z.object({
    employee_id: z.string().min(1,
      isAr ? 'يرجى اختيار الموظف' : 'Please select an employee'),

    deduction_type_id: z.string().min(1,
      isAr ? 'يرجى اختيار نوع الخصم' : 'Please select a deduction type'),

    financial_month: z.string().min(1,
      isAr ? 'يرجى تحديد الشهر المالي' : 'Please select the financial month'),

    amount: z
      .string()
      .min(1, isAr ? 'يرجى إدخال المبلغ' : 'Please enter an amount')
      .refine((v) => Number(v) > 0,
        isAr ? 'يجب أن يكون المبلغ أكبر من صفر' : 'Amount must be greater than zero'),

    reason: z.string().min(3,
      isAr ? 'يرجى إدخال سبب الخصم (٣ أحرف على الأقل)' : 'Please enter a reason (min 3 chars)'),

    notes: z.string().optional(),
  });
