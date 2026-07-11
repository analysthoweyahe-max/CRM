import { useEffect, useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Switch } from '@/shared/components/ui/Switch';
import { FormField } from '@/shared/components/form/FormField';
import type { CreateProjectTypePayload } from '../types/createProject.types';

interface Props {
  open:         boolean;
  onClose:      () => void;
  onSubmit:     (payload: CreateProjectTypePayload) => void;
  departmentId: number;
  isLoading:    boolean;
  isAr:         boolean;
}

const EMPTY = (departmentId: number): CreateProjectTypePayload => ({
  name:         '',
  nameAr:       '',
  departmentId: departmentId > 0 ? departmentId : null,
  isActive:     true,
  sortOrder:    0,
});

export function AddProjectTypeModal({ open, onClose, onSubmit, departmentId, isLoading, isAr }: Props) {
  const [form, setForm] = useState<CreateProjectTypePayload>(() => EMPTY(departmentId));

  useEffect(() => {
    if (open) setForm(EMPTY(departmentId));
  }, [open, departmentId]);

  function set<K extends keyof CreateProjectTypePayload>(key: K, value: CreateProjectTypePayload[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const isValid = !!form.name.trim();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'إضافة نوع مشروع' : 'Add Project Type'}
      footer={
        <div className="flex items-center gap-3 justify-start flex-row-reverse">
          <Button variant="primary" disabled={!isValid} isLoading={isLoading} onClick={() => onSubmit(form)}>
            {isAr ? 'حفظ' : 'Save'}
          </Button>
          <Button variant="ghost" onClick={onClose}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isAr ? 'الاسم بالإنجليزي' : 'English Name'} required>
            <Input value={form.name} onChange={e => set('name', e.target.value)} dir="ltr" />
          </FormField>
          <FormField label={isAr ? 'الاسم بالعربي' : 'Arabic Name'}>
            <Input value={form.nameAr ?? ''} onChange={e => set('nameAr', e.target.value)} />
          </FormField>
        </div>
        <FormField label={isAr ? 'ترتيب الفرز' : 'Sort Order'}>
          <Input type="number" value={form.sortOrder ?? 0} onChange={e => set('sortOrder', Number(e.target.value))} />
        </FormField>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Switch checked={form.isActive ?? true} onChange={() => set('isActive', !form.isActive)} />
          <span className="text-sm text-gray-600 dark:text-gray-400">{isAr ? 'نشط' : 'Active'}</span>
        </label>
      </div>
    </Modal>
  );
}
