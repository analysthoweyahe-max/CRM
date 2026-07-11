import { useEffect, useState } from 'react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { Switch }    from '@/shared/components/ui/Switch';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import type {
  ApiPayrollAdjustmentType,
  CreatePayrollTypePayload,
  PayrollTypeSource,
} from '../types/payroll.types';

interface Props {
  open:      boolean;
  onClose:   () => void;
  onSubmit:  (payload: CreatePayrollTypePayload) => void;
  initial?:  ApiPayrollAdjustmentType | null;
  isLoading: boolean;
  isAr:      boolean;
  kind:      'bonus' | 'deduction';
}

const EMPTY: CreatePayrollTypePayload = {
  code: '', name: '', name_ar: '', source: 'manual', is_active: true, sort_order: 0,
};

export function PayrollTypeFormModal({
  open, onClose, onSubmit, initial, isLoading, isAr, kind,
}: Props) {
  const [form, setForm] = useState<CreatePayrollTypePayload>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(initial ? {
      code:       initial.code,
      name:       initial.name,
      name_ar:    initial.nameAr ?? '',
      source:     (initial.source === 'automatic' ? 'automatic' : 'manual') as PayrollTypeSource,
      is_active:  initial.isActive,
      sort_order: initial.sortOrder,
    } : EMPTY);
  }, [open, initial]);

  function set<K extends keyof CreatePayrollTypePayload>(key: K, value: CreatePayrollTypePayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValid = !!form.name?.trim();
  const codeLocked = !!initial?.isSystem;

  const sourceItems = [
    { id: 'manual',    label: isAr ? 'يدوي' : 'Manual' },
    { id: 'automatic', label: isAr ? 'تلقائي' : 'Automatic' },
  ];

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      ...form,
      name:    form.name.trim(),
      name_ar: form.name_ar?.trim() || undefined,
      code:    form.code?.trim() || undefined,
    });
  }

  const titleKind = kind === 'bonus'
    ? (isAr ? 'نوع مكافأة' : 'Bonus Type')
    : (isAr ? 'نوع خصم' : 'Deduction Type');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial
        ? (isAr ? `تعديل ${titleKind}` : `Edit ${titleKind}`)
        : (isAr ? `إضافة ${titleKind}` : `Add ${titleKind}`)}
      footer={
        <div className="flex items-center gap-3 justify-start flex-row-reverse">
          <Button variant="primary" disabled={!isValid} isLoading={isLoading} onClick={handleSubmit}>
            {isAr ? 'حفظ' : 'Save'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 py-1">
        <FormField label={isAr ? 'الاسم بالإنجليزي' : 'English Name'} required>
          <Input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Performance bonus"
            dir="ltr"
          />
        </FormField>

        <FormField label={isAr ? 'الاسم بالعربي' : 'Arabic Name'}>
          <Input
            value={form.name_ar ?? ''}
            onChange={(e) => set('name_ar', e.target.value)}
            placeholder={isAr ? 'مثال: مكافأة أداء' : 'e.g. Performance bonus'}
            dir="rtl"
          />
        </FormField>

        <FormField label={isAr ? 'الكود (اختياري)' : 'Code (optional)'}>
          <Input
            value={form.code ?? ''}
            onChange={(e) => set('code', e.target.value)}
            placeholder="performance_bonus"
            dir="ltr"
            disabled={codeLocked}
          />
          {codeLocked && (
            <p className="text-xs text-gray-400 mt-1">
              {isAr ? 'لا يمكن تغيير كود الأنواع النظامية' : 'System type codes cannot be changed'}
            </p>
          )}
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isAr ? 'المصدر' : 'Source'}>
            <Combobox
              items={sourceItems}
              value={form.source ?? 'manual'}
              onChange={(v) => set('source', v as PayrollTypeSource)}
              searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
              noResultsText={isAr ? 'لا نتائج' : 'No results'}
            />
          </FormField>
          <FormField label={isAr ? 'ترتيب العرض' : 'Sort Order'}>
            <Input
              type="number"
              value={form.sort_order ?? 0}
              onChange={(e) => set('sort_order', Number(e.target.value))}
            />
          </FormField>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <Switch
            checked={form.is_active !== false}
            onChange={() => set('is_active', !(form.is_active !== false))}
            ariaLabel={isAr ? 'مفعّل' : 'Active'}
          />
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {isAr ? 'مفعّل' : 'Active'}
          </p>
        </div>
      </div>
    </Modal>
  );
}
