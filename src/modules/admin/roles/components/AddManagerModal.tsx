import { useEffect, useState } from 'react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import { PermissionGroupList } from './PermissionGroupList';
import { MANAGER_ROLE_OPTIONS } from '../types/adminManager.types';
import type { CreateAdminPayload } from '../types/adminManager.types';

interface Props {
  open:      boolean;
  onClose:   () => void;
  onSubmit:  (payload: CreateAdminPayload) => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function AddManagerModal({ open, onClose, onSubmit, isLoading, isAr }: Props) {
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [role,        setRole]        = useState<string>(MANAGER_ROLE_OPTIONS[0].id);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setName('');
    setEmail('');
    setRole(MANAGER_ROLE_OPTIONS[0].id);
    setPermissions([]);
  }, [open]);

  function toggle(slug: string) {
    setPermissions((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  }

  const isValid = !!(name.trim() && email.trim() && role && permissions.length > 0);

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({ name: name.trim(), email: email.trim(), role, permissions });
  }

  const roleItems = MANAGER_ROLE_OPTIONS.map((r) => ({ id: r.id, label: isAr ? r.labelAr : r.labelEn }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'إضافة مدير جديد' : 'Add New Manager'}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isAr ? 'الاسم' : 'Name'} required>
            <Input value={name} onChange={(e) => setName(e.target.value)}
              placeholder={isAr ? 'الاسم الكامل' : 'Full name'} />
          </FormField>
          <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'} required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="name@howeyah.com" />
          </FormField>
        </div>

        <FormField label={isAr ? 'الدور' : 'Role'} required>
          <Combobox
            items={roleItems}
            value={role}
            onChange={setRole}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
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
