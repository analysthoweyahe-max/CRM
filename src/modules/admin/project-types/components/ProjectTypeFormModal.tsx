import { useEffect, useState } from 'react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { Switch }    from '@/shared/components/ui/Switch';
import { FormField } from '@/shared/components/form/FormField';
import type { PmProjectTypeItem, PmProjectTypePayload } from '@/modules/project-manager/projects/types/project.types';

interface Props {
  open:      boolean;
  onClose:   () => void;
  onSubmit:  (payload: PmProjectTypePayload) => void;
  initial?:  PmProjectTypeItem | null;
  isLoading: boolean;
  isAr:      boolean;
}

const EMPTY: PmProjectTypePayload = { name: '', name_ar: '', is_active: true, sort_order: 0 };

export function ProjectTypeFormModal({ open, onClose, onSubmit, initial, isLoading, isAr }: Props) {
  const [form, setForm] = useState<PmProjectTypePayload>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(initial ? {
      name:       initial.name,
      name_ar:    initial.nameAr ?? '',
      is_active:  initial.isActive,
      sort_order: initial.sortOrder,
    } : EMPTY);
  }, [open, initial]);

  function set<K extends keyof PmProjectTypePayload>(key: K, value: PmProjectTypePayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValid = !!form.name.trim();

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      name:       form.name.trim(),
      name_ar:    form.name_ar?.trim() || null,
      is_active:  form.is_active,
      sort_order: form.sort_order,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial
        ? (isAr ? 'تعديل نوع المشروع' : 'Edit Project Type')
        : (isAr ? 'إضافة نوع مشروع جديد' : 'Add New Project Type')}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isAr ? 'الاسم بالإنجليزي' : 'English Name'} required>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Web Development" dir="ltr" />
          </FormField>
          <FormField label={isAr ? 'الاسم بالعربي' : 'Arabic Name'}>
            <Input value={form.name_ar ?? ''} onChange={(e) => set('name_ar', e.target.value)}
              placeholder="مثال: تطوير ويب" />
          </FormField>
        </div>

        <FormField label={isAr ? 'ترتيب الفرز' : 'Sort Order'}>
          <Input type="number" value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
        </FormField>

        <div className="flex items-center justify-between gap-4 pt-1">
          <Switch checked={form.is_active ?? true} onChange={() => set('is_active', !form.is_active)}
            ariaLabel={isAr ? 'مفعّل' : 'Active'} />
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {isAr ? 'مفعّل' : 'Active'}
          </p>
        </div>
      </div>
    </Modal>
  );
}
