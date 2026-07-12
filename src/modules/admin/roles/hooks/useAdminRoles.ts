import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { useRoleList, useCreateRole, useDeleteRole } from './useRoles';
import { useCreateAdmin } from './useCreateAdmin';
import type { ApiRole, RoleFormInput } from '../types/adminRole.types';
import type { CreateAdminPayload } from '../types/adminManager.types';

const LOCKED_ROLES = new Set(['super-admin']);
const SEO_ROLE_SLUGS = new Set(['seo-leader', 'seo-manager', 'seo-employee', 'seo-member']);

function isDeleteLocked(role: ApiRole) {
  return LOCKED_ROLES.has(role.name) || SEO_ROLE_SLUGS.has(role.name);
}

export function useAdminRoles(isAr: boolean) {
  const { data: roles, isLoading } = useRoleList();
  const { mutate: create, isPending: creating } = useCreateRole();
  const { mutate: remove,  isPending: deleting } = useDeleteRole();

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

  function openCreate()  { setShowModal(true); }
  function closeModal()  { setShowModal(false); }

  function submitRole(input: RoleFormInput) {
    create({ ...input, guard_name: 'admin' }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء الدور' : 'Role created');
        setShowModal(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    if (isDeleteLocked(pendingDelete)) {
      toast.error(isAr ? 'لا يمكن حذف أدوار SEO' : 'SEO roles cannot be deleted');
      setPendingDelete(null);
      return;
    }
    remove(pendingDelete.id, {
      onSuccess: () => {
        toast.success(isAr ? 'تم حذف الدور' : 'Role deleted');
        setPendingDelete(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  return {
    roles: roles ?? [],
    isLoading,
    isLocked: (role: ApiRole) => LOCKED_ROLES.has(role.name),
    isDeleteLocked,
    showModal, creating,
    openCreate, closeModal, submitRole,
    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
    showManagerModal, creatingManager,
    openManagerModal:  () => setShowManagerModal(true),
    closeManagerModal: () => setShowManagerModal(false),
    submitManager,
  };
}
