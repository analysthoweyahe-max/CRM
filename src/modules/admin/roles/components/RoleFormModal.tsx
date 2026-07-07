import { useEffect, useState } from 'react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { PermissionGroupList } from './PermissionGroupList';
import type { RoleFormInput } from '../types/adminRole.types';

interface Props {
  open:      boolean;
  onClose:   () => void;
  onSubmit:  (input: RoleFormInput) => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function RoleFormModal({ open, onClose, onSubmit, isLoading, isAr }: Props) {
  const [name,        setName]        = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setName('');
    setPermissions([]);
  }, [open]);

  function toggle(slug: string) {
    setPermissions((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  }

  const isValid = !!(name.trim() && permissions.length > 0);

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({ name: name.trim(), permissions });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'إنشاء دور جديد' : 'Create New Role'}
      size="lg"
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
        <FormField label={isAr ? 'اسم الدور' : 'Role Name'} required>
          <Input value={name} onChange={(e) => setName(e.target.value)}
            placeholder={isAr ? 'مثال: accountant' : 'e.g. accountant'} />
        </FormField>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {isAr ? 'الصلاحيات' : 'Permissions'}
          </p>
          <PermissionGroupList selected={permissions} onToggle={toggle} isAr={isAr} />
        </div>
      </div>
    </Modal>
  );
}
