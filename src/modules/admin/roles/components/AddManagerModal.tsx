import { useEffect, useMemo, useState } from 'react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { ManagerForm } from './ManagerForm';
import { permissionsForRole } from '../utils/role.utils';
import { HR_CREATABLE_MANAGER_ROLES, type CreateAdminPayload, type ManagerFormValues } from '../types/adminManager.types';
import { usePermissionList } from '@/modules/admin/permissions/hooks/usePermissions';
import { filterRegisteredPermissions, toPermissionNameSet } from '@/shared/permissions/permissionValidation.utils';
import type { ApiRole } from '../types/adminRole.types';

interface Props {
  open:                    boolean;
  onClose:                 () => void;
  onSubmit:                (payload: CreateAdminPayload) => void;
  isLoading:               boolean;
  isAr:                    boolean;
  availableRoles:          ApiRole[];
  canCustomizePermissions: boolean;
  allowedRoleNames?:       string[];
}

const EMPTY_VALUES: ManagerFormValues = {
  name: '', email: '', phone: '', status: 'pending', role: '', permissions: [],
};

export function AddManagerModal({
  open,
  onClose,
  onSubmit,
  isLoading,
  isAr,
  availableRoles,
  canCustomizePermissions,
  allowedRoleNames,
}: Props) {
  const [values, setValues] = useState<ManagerFormValues>(EMPTY_VALUES);

  const selectableRoles = useMemo(() => {
    const fromApi = availableRoles.filter(r => r.name !== 'super-admin');
    const allowed = new Set(allowedRoleNames ?? HR_CREATABLE_MANAGER_ROLES);
    const filtered = canCustomizePermissions
      ? fromApi
      : fromApi.filter(r => allowed.has(r.name as typeof HR_CREATABLE_MANAGER_ROLES[number]));
    return filtered;
  }, [availableRoles, allowedRoleNames, canCustomizePermissions]);

  const { data: allPermissions } = usePermissionList();
  const registered = useMemo(() => toPermissionNameSet(allPermissions), [allPermissions]);

  useEffect(() => {
    if (!open) return;
    const first = selectableRoles[0]?.name ?? '';
    setValues({
      ...EMPTY_VALUES,
      role: first,
      permissions: first && canCustomizePermissions
        ? filterRegisteredPermissions(permissionsForRole(selectableRoles, first), registered)
        : [],
    });
  }, [open, selectableRoles, registered, canCustomizePermissions]);

  useEffect(() => {
    if (!values.role || !canCustomizePermissions) return;
    setValues(v => ({
      ...v,
      permissions: filterRegisteredPermissions(permissionsForRole(selectableRoles, values.role), registered),
    }));
  }, [values.role, selectableRoles, registered, canCustomizePermissions]);

  const isValid = !!(values.name.trim() && values.email.trim() && values.role
    && (!canCustomizePermissions || values.permissions.length > 0));

  function handleSubmit() {
    if (!isValid) return;
    const payload: CreateAdminPayload = {
      name:  values.name.trim(),
      email: values.email.trim(),
      role:  values.role,
    };
    if (canCustomizePermissions) {
      payload.permissions = filterRegisteredPermissions(values.permissions, registered);
    }
    onSubmit(payload);
  }

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
      {selectableRoles.length === 0 ? (
        <p className="text-sm text-amber-600 dark:text-amber-400 py-2">
          {isAr ? 'لا توجد أدوار متاحة للتعيين.' : 'No assignable roles available.'}
        </p>
      ) : (
        <ManagerForm
          mode="create"
          values={values}
          onChange={patch => setValues(v => ({ ...v, ...patch }))}
          isAr={isAr}
          showStatus={false}
          showPermissions={canCustomizePermissions}
          availableRoles={selectableRoles}
          allowedRoleNames={allowedRoleNames}
        />
      )}
    </Modal>
  );
}
