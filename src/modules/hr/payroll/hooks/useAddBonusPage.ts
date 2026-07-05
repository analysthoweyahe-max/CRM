import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useLang }       from '@/app/providers/LanguageProvider';
import { ROUTES }        from '@/app/router/routes';
import { employeeApi }   from '@/modules/hr/employees/api/employee.api';
import { makeBonusSchema } from '../schemas/addBonus.schema';
import { useBonusTypes, useCreateBonus } from './useBonuses';
import type { AddBonusFormValues } from '../types/addBonus.types';
import type { ComboboxItem } from '@/shared/components/form/Combobox';

function buildMonthItems(isAr: boolean): ComboboxItem[] {
  const items: ComboboxItem[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    items.push({ id: val, label: d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' }) });
  }
  return items;
}

export function useAddBonusPage() {
  const { lang, isRTL }              = useLang();
  const isAr                         = lang === 'ar';
  const navigate                     = useNavigate();
  const { data: typesRaw }           = useBonusTypes();
  const { mutateAsync: createBonus } = useCreateBonus();

  const { data: empList } = useQuery({
    queryKey: ['employees', 'list-all'],
    queryFn:  () => employeeApi.list({ per_page: 100 }).then((r) => r.data.data.data),
  });

  const typeItems  = useMemo(() =>
    (typesRaw ?? []).map((t) => ({ id: t.value, label: t.label })),
  [typesRaw]);

  const empItems   = useMemo(() =>
    (empList ?? []).map((e) => ({ id: e.employeeNumber ?? e.id, label: e.name })),
  [empList]);

  const monthItems = useMemo(() => buildMonthItems(isAr), [isAr]);

  const form = useForm<AddBonusFormValues>({
    resolver: (v, ctx, opts) => zodResolver(makeBonusSchema(isAr))(v, ctx, opts),
    defaultValues: { notes: '' },
  });

  async function onSubmit(values: AddBonusFormValues) {
    await createBonus({
      employee_number: values.employee_id,
      adjustment_type: values.adjustment_type,
      financial_month: values.financial_month,
      amount:          Number(values.amount),
      reason:          values.reason,
      notes:           values.notes,
    });
    toast.success(isAr ? 'تم حفظ المكافأة بنجاح' : 'Bonus saved successfully');
    navigate(ROUTES.PAYROLL.BONUSES);
  }

  return { isAr, isRTL, form, empItems, typeItems, monthItems, onSubmit };
}
