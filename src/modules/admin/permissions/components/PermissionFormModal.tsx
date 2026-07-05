import { useEffect, useState } from 'react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import type { ApiPermission } from '../types/adminPermission.types';

interface Props {
  open:      boolean;
  onClose:   () => void;
  onSubmit:  (name: string) => void;
  initial?:  ApiPermission | null;
  isLoading: boolean;
  isAr:      boolean;
}

export function PermissionFormModal({ open, onClose, onSubmit, initial, isLoading, isAr }: Props) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
  }, [open, initial]);

  const isValid = !!name.trim();

  function handleSubmit() {
    if (!isValid) return;
    onSubmit(name.trim());
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial
        ? (isAr ? 'تعديل الصلاحية' : 'Edit Permission')
        : (isAr ? 'إضافة صلاحية جديدة' : 'Add New Permission')}
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
      <div className="py-1">
        <FormField label={isAr ? 'اسم الصلاحية' : 'Permission Name'} required>
          <Input value={name} onChange={(e) => setName(e.target.value)}
            placeholder={isAr ? 'مثال: view-reports' : 'e.g. view-reports'} />
        </FormField>
      </div>
    </Modal>
  );
}
