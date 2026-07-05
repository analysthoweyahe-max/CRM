import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { useRoleList, useCreateRole, useUpdateRole, useDeleteRole } from './useRoles';
import { useCreateAdmin } from './useCreateAdmin';
import type { ApiRole, RoleFormInput } from '../types/adminRole.types';
import type { CreateAdminPayload } from '../types/adminManager.types';

const LOCKED_ROLES = new Set(['super-admin']);

export function useAdminRoles(isAr: boolean) {
  const { data: roles, isLoading } = useRoleList();
  const { mutate: create, isPending: creating } = useCreateRole();
  const { mutate: update, isPending: updating } = useUpdateRole();
  const { mutate: remove,  isPending: deleting } = useDeleteRole();

  const [editingRole,   setEditingRole]   = useState<ApiRole | null>(null);
  const [showModal,     setShowModal]     = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ApiRole | null>(null);

  const [showManagerModal, setShowManagerModal] = useState(false);
  const { mutate: createAdmin, isPending: creatingManager } = useCreateAdmin();

  function submitManager(payload: CreateAdminPayload) {
    createAdmin(payload, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء المدير' : 'Manager created');
        setShowManagerModal(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function openCreate()            { setEditingRole(null); setShowModal(true); }
  function openEdit(role: ApiRole) { setEditingRole(role);  setShowModal(true); }
  function closeModal()            { setShowModal(false); }

  function submitRole(input: RoleFormInput) {
    if (editingRole) {
      update({ id: editingRole.id, payload: input }, {
        onSuccess: () => {
          toast.success(isAr ? 'تم تحديث الدور' : 'Role updated');
          setShowModal(false);
        },
        onError: (err) => toast.error(extractApiError(err)),
      });
    } else {
      create(input, {
        onSuccess: () => {
          toast.success(isAr ? 'تم إنشاء الدور' : 'Role created');
          setShowModal(false);
        },
        onError: (err) => toast.error(extractApiError(err)),
      });
    }
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    remove(pendingDelete.id, {
      onSuccess: () => {
        toast.success(isAr ? 'تم حذف الدور' : 'Role deleted');
        setPendingDelete(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  const editingInput: RoleFormInput | undefined = editingRole ? {
    name: editingRole.name,
    permissions: editingRole.permissions,
  } : undefined;

  return {
    roles: roles ?? [],
    isLoading,
    isLocked: (role: ApiRole) => LOCKED_ROLES.has(role.name),
    showModal, editingInput, creating, updating,
    openCreate, openEdit, closeModal, submitRole,
    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
    showManagerModal, creatingManager,
    openManagerModal:  () => setShowManagerModal(true),
    closeManagerModal: () => setShowManagerModal(false),
    submitManager,
  };
}
