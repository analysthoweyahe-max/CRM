import { useEffect, useState } from 'react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { Switch }    from '@/shared/components/ui/Switch';
import { FormField } from '@/shared/components/form/FormField';
import type { ApiSeoProjectStatus, CreateSeoProjectStatusPayload } from '../types/seoProjectStatus.types';

interface Props {
  open:      boolean;
  onClose:   () => void;
  onSubmit:  (payload: CreateSeoProjectStatusPayload) => void;
  initial?:  ApiSeoProjectStatus | null;
  isLoading: boolean;
  isAr:      boolean;
}

const EMPTY: CreateSeoProjectStatusPayload = {
  key: '', label_en: '', label_ar: '', color: '#6366f1',
  sort_order: 0, is_active: true, marks_completed: false,
};

export function SeoProjectStatusFormModal({ open, onClose, onSubmit, initial, isLoading, isAr }: Props) {
  const [form, setForm] = useState<CreateSeoProjectStatusPayload>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(initial ? {
      key:             initial.key,
      label_en:        initial.labelEn,
      label_ar:        initial.labelAr,
      color:           initial.color || '#6366f1',
      sort_order:      initial.sortOrder,
      is_active:       initial.isActive,
      marks_completed: initial.marksCompleted,
    } : EMPTY);
  }, [open, initial]);

  function set<K extends keyof CreateSeoProjectStatusPayload>(key: K, value: CreateSeoProjectStatusPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValid = initial
    ? !!(form.label_ar.trim() && form.label_en.trim())
    : !!(form.key.trim() && form.label_ar.trim() && form.label_en.trim());

  function handleSubmit() {
    if (!isValid) return;
    const trimmed = {
      ...form,
      label_ar: form.label_ar.trim(),
      label_en: form.label_en.trim(),
    };
    if (initial) {
      const { key: _key, ...updateBody } = trimmed;
      onSubmit(updateBody as CreateSeoProjectStatusPayload);
      return;
    }
    onSubmit({ ...trimmed, key: form.key.trim() });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial
        ? (isAr ? 'تعديل حالة المشروع' : 'Edit Project Status')
        : (isAr ? 'إضافة حالة مشروع جديدة' : 'Add New Project Status')}
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
        <FormField label={isAr ? 'المفتاح (key)' : 'Key'} required>
          <Input value={form.key} onChange={(e) => set('key', e.target.value)}
            placeholder="e.g. in_progress" dir="ltr" disabled={!!initial} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isAr ? 'الاسم بالعربي' : 'Arabic Label'} required>
            <Input value={form.label_ar} onChange={(e) => set('label_ar', e.target.value)}
              placeholder="مثال: قيد التنفيذ" />
          </FormField>
          <FormField label={isAr ? 'الاسم بالإنجليزي' : 'English Label'} required>
            <Input value={form.label_en} onChange={(e) => set('label_en', e.target.value)}
              placeholder="e.g. In Progress" dir="ltr" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isAr ? 'اللون' : 'Color'}>
            <div className="flex items-center gap-2">
              <input type="color" value={form.color ?? '#6366f1'} onChange={(e) => set('color', e.target.value)}
                className="w-11 h-11 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer shrink-0" />
              <Input value={form.color ?? ''} onChange={(e) => set('color', e.target.value)} dir="ltr" />
            </div>
          </FormField>
          <FormField label={isAr ? 'ترتيب الفرز' : 'Sort Order'}>
            <Input type="number" value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
          </FormField>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <Switch checked={form.is_active} onChange={() => set('is_active', !form.is_active)}
            ariaLabel={isAr ? 'مفعّلة' : 'Active'} />
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {isAr ? 'مفعّلة' : 'Active'}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <Switch
            checked={form.marks_completed}
            onChange={() => set('marks_completed', !form.marks_completed)}
            ariaLabel={isAr ? 'تعني إنجاز المشروع' : 'Marks project completed'}
          />
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {isAr ? 'تعني إنجاز المشروع' : 'Marks completed'}
          </p>
        </div>
      </div>
    </Modal>
  );
}
