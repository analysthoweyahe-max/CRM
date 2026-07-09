import { useEffect, useMemo, useState } from 'react';

import { Modal }     from '@/shared/components/ui/Modal';

import { Button }    from '@/shared/components/ui/Button';

import { Input }     from '@/shared/components/ui/Input';

import { FormField } from '@/shared/components/form/FormField';

import { Combobox }  from '@/shared/components/form/Combobox';

import { PermissionGroupList } from './PermissionGroupList';

import { permissionsForRole } from '../utils/role.utils';

import { getRoleNameLabel } from '../types/adminRole.types';

import { MANAGER_ROLE_OPTIONS, HR_CREATABLE_MANAGER_ROLES } from '../types/adminManager.types';

import { usePermissionList } from '@/modules/admin/permissions/hooks/usePermissions';

import { filterRegisteredPermissions, toPermissionNameSet } from '@/shared/permissions/permissionValidation.utils';

import type { ApiRole } from '../types/adminRole.types';

import type { CreateAdminPayload } from '../types/adminManager.types';



interface Props {

  open:                    boolean;

  onClose:                 () => void;

  onSubmit:                (payload: CreateAdminPayload) => void;

  isLoading:               boolean;

  isAr:                    boolean;

  availableRoles:          ApiRole[];

  /** Super-admin may override permissions; HR manager sends role only. */

  canCustomizePermissions: boolean;

  /** When set, limits selectable roles (e.g. seo-manager / project-manager for HR). */

  allowedRoleNames?:       string[];

}



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

  const [name,        setName]        = useState('');

  const [email,       setEmail]       = useState('');

  const [role,        setRole]        = useState('');

  const [permissions, setPermissions] = useState<string[]>([]);



  const selectableRoles = useMemo(() => {

    const fromApi = availableRoles.filter((r) => r.name !== 'super-admin');

    const allowed = new Set(allowedRoleNames ?? HR_CREATABLE_MANAGER_ROLES);

    const filtered = canCustomizePermissions

      ? fromApi

      : fromApi.filter((r) => allowed.has(r.name as typeof HR_CREATABLE_MANAGER_ROLES[number]));



    if (filtered.length > 0) return filtered;



    if (!canCustomizePermissions && allowedRoleNames) {

      return allowedRoleNames.map((name) => ({

        id: 0,

        name,

        guardName: 'admin',

        permissions: [],

        createdAt: '',

        updatedAt: '',

      } satisfies ApiRole));

    }



    return MANAGER_ROLE_OPTIONS

      .filter((r) => canCustomizePermissions || allowed.has(r.id))

      .map((r) => ({

        id: 0,

        name: r.id,

        guardName: 'admin',

        permissions: [],

        createdAt: '',

        updatedAt: '',

      } satisfies ApiRole));

  }, [availableRoles, allowedRoleNames, canCustomizePermissions]);



  const { data: allPermissions } = usePermissionList();

  const registered = useMemo(() => toPermissionNameSet(allPermissions), [allPermissions]);



  useEffect(() => {

    if (!open) return;

    setName('');

    setEmail('');

    const first = selectableRoles[0]?.name ?? '';

    setRole(first);

    setPermissions(first && canCustomizePermissions

      ? filterRegisteredPermissions(permissionsForRole(selectableRoles, first), registered)

      : []);

  }, [open, selectableRoles, registered, canCustomizePermissions]);



  useEffect(() => {

    if (!role || !canCustomizePermissions) return;

    setPermissions(filterRegisteredPermissions(permissionsForRole(selectableRoles, role), registered));

  }, [role, selectableRoles, registered, canCustomizePermissions]);



  function toggle(slug: string) {

    setPermissions((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);

  }



  const isValid = !!(name.trim() && email.trim() && role

    && (!canCustomizePermissions || permissions.length > 0));



  function handleSubmit() {

    if (!isValid) return;

    const payload: CreateAdminPayload = {

      name:  name.trim(),

      email: email.trim(),

      role,

    };

    if (canCustomizePermissions) {

      payload.permissions = filterRegisteredPermissions(permissions, registered);

    }

    onSubmit(payload);

  }



  const roleItems = selectableRoles.map((r) => ({

    id:    r.name,

    label: getRoleNameLabel(r.name, isAr),

  }));



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



        {selectableRoles.length === 0 ? (

          <p className="text-sm text-amber-600 dark:text-amber-400">

            {isAr ? 'لا توجد أدوار متاحة للتعيين.' : 'No assignable roles available.'}

          </p>

        ) : (

          <>

            <FormField label={isAr ? 'الدور' : 'Role'} required>

              <Combobox

                items={roleItems}

                value={role}

                onChange={setRole}

                searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}

                noResultsText={isAr ? 'لا نتائج' : 'No results'}

              />

            </FormField>



            {canCustomizePermissions && (

              <div className="space-y-2">

                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">

                  {isAr ? 'الصلاحيات (تُعبّأ تلقائياً من الدور ويمكن تعديلها)' : 'Permissions (auto-filled from role, editable)'}

                </p>

                <PermissionGroupList selected={permissions} onToggle={toggle} isAr={isAr} />

              </div>

            )}

          </>

        )}

      </div>

    </Modal>

  );

}


