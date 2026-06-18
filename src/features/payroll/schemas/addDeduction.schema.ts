import { z } from 'zod';

export const makeDeductionSchema = (isAr: boolean) =>
  z.object({
    employeeId: z.string().min(1, isAr ? 'يرجى اختيار الموظف' : 'Please select an employee'),
    date: z.string().min(1, isAr ? 'يرجى تحديد تاريخ الخصم' : 'Please select a deduction date'),
    amount: z
      .string()
      .min(1, isAr ? 'يرجى إدخال المبلغ' : 'Please enter an amount')
      .refine(
        (v) => Number(v) > 0,
        isAr ? 'يجب أن يكون المبلغ أكبر من صفر' : 'Amount must be greater than zero',
      ),
    reason: z
      .string()
      .min(3, isAr ? 'يرجى إدخال سبب الخصم (٣ أحرف على الأقل)' : 'Please enter a reason (min 3 chars)'),
    notes: z.string().optional(),
  });
