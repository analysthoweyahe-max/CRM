import { useEffect, useState } from 'react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { PermissionChip } from './PermissionChip';
import { MODULES, ACTION_LABELS } from '../data/roleData';
import type { PermissionAction, RoleFormInput } from '../types/adminRole.types';

interface Props {
  open:     boolean;
  onClose:  () => void;
  onSubmit: (input: RoleFormInput) => void;
  initial?: RoleFormInput;
  isAr:     boolean;
}

const EMPTY: RoleFormInput = { nameAr: '', descriptionAr: '', permissions: {} };

export function RoleFormModal({ open, onClose, onSubmit, initial, isAr }: Props) {
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<Record<string, PermissionAction[]>>({});

  useEffect(() => {
    if (!open) return;
    const seed = initial ?? EMPTY;
    setName(seed.nameAr);
    setDescription(seed.descriptionAr);
    setPermissions(seed.permissions);
  }, [open, initial]);

  function toggle(moduleKey: string, action: PermissionAction) {
    setPermissions(prev => {
      const current = prev[moduleKey] ?? [];
      const next = current.includes(action) ? current.filter(a => a !== action) : [...current, action];
      return { ...prev, [moduleKey]: next };
    });
  }

  function handleSubmit() {
    if (!name.trim()) return;
    onSubmit({ nameAr: name.trim(), descriptionAr: description.trim(), permissions });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? (isAr ? 'تعديل الدور' : 'Edit Role') : (isAr ? 'إنشاء دور جديد' : 'Create New Role')}
      size="lg"
      footer={
        <div className="flex items-center gap-3 justify-start flex-row-reverse">
          <Button variant="primary" disabled={!name.trim()} onClick={handleSubmit}>
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
          <Input value={name} onChange={e => setName(e.target.value)}
            placeholder={isAr ? 'مثال: محاسب' : 'e.g. Accountant'} />
        </FormField>

        <FormField label={isAr ? 'الوصف' : 'Description'}>
          <Input value={description} onChange={e => setDescription(e.target.value)}
            placeholder={isAr ? 'وصف مختصر للدور' : 'Brief role description'} />
        </FormField>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {isAr ? 'الصلاحيات' : 'Permissions'}
          </p>
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/50">
            {MODULES.map(mod => (
              <div key={mod.key} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {mod.actions.map(action => (
                    <PermissionChip
                      key={action}
                      label={isAr ? ACTION_LABELS[action].ar : ACTION_LABELS[action].en}
                      active={permissions[mod.key]?.includes(action) ?? false}
                      onToggle={() => toggle(mod.key, action)}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
                  {isAr ? mod.labelAr : mod.labelEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
