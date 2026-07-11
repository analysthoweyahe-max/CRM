import { useEffect, useMemo, useState } from 'react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import { PermissionGroupList } from './PermissionGroupList';
import { permissionsForRole, resolveAssignableRoleName } from '../utils/role.utils';
import { getRoleNameLabel } from '../types/adminRole.types';
import type { ApiRole } from '../types/adminRole.types';

export interface AssignRolePayload {
  role:        string;
  permissions: string[];
}

interface Props {
  open:           boolean;
  onClose:        () => void;
  onSubmit:       (payload: AssignRolePayload) => void;
  isLoading:      boolean;
  isAr:           boolean;
  title:          string;
  availableRoles: ApiRole[];
  assignedRoles?: string[];
  initialRole?:   string;
  initialPermissions?: string[];
}

export function AssignRoleModal({
  open,
  onClose,
  onSubmit,
  isLoading,
  isAr,
  title,
  availableRoles,
  assignedRoles = [],
  initialRole,
  initialPermissions,
}: Props) {
  const selectableRoles = useMemo(
    () => availableRoles.filter((r) =>
      r.name !== 'super-admin'
      && (!assignedRoles.includes(r.name) || r.name === initialRole),
    ),
    [availableRoles, assignedRoles, initialRole],
  );

  const [role,        setRole]        = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [preserveCustom, setPreserveCustom] = useState(false);

  useEffect(() => {
    if (!open) return;
    const first = resolveAssignableRoleName(initialRole, selectableRoles)
      ?? selectableRoles[0]?.name
      ?? '';
    const hasCustom = !!(initialPermissions?.length);
    setRole(first);
    setPreserveCustom(hasCustom);
    setPermissions(
      hasCustom
        ? initialPermissions!
        : first ? permissionsForRole(selectableRoles, first) : [],
    );
  }, [open, selectableRoles, initialRole, initialPermissions]);

  useEffect(() => {
    if (!role || preserveCustom) return;
    setPermissions(permissionsForRole(selectableRoles, role));
  }, [role, selectableRoles, preserveCustom]);

  function handleRoleChange(nextRole: string) {
    setPreserveCustom(false);
    setRole(resolveAssignableRoleName(nextRole, selectableRoles) ?? nextRole);
  }

  function toggle(slug: string) {
    setPermissions((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  }

  const isValid = !!(role && permissions.length > 0);

  function handleSubmit() {
    if (!isValid) return;
    const slug = resolveAssignableRoleName(role, selectableRoles);
    if (!slug) return;
    onSubmit({ role: slug, permissions });
  }

  const roleItems = selectableRoles.map((r) => ({
    id:    r.name, // English slug
    label: getRoleNameLabel(r.name, isAr),
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
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
        {selectableRoles.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
            {isAr ? 'لا توجد أدوار متاحة للتعيين.' : 'No roles available to assign.'}
          </p>
        ) : (
          <>
            <FormField label={isAr ? 'الدور' : 'Role'} required>
              <Combobox
                items={roleItems}
                value={role}
                onChange={handleRoleChange}
                searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                noResultsText={isAr ? 'لا نتائج' : 'No results'}
              />
            </FormField>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {isAr ? 'الصلاحيات (تُعبّأ تلقائياً من الدور ويمكن تعديلها)' : 'Permissions (auto-filled from role, editable)'}
              </p>
              <PermissionGroupList selected={permissions} onToggle={toggle} isAr={isAr} />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
