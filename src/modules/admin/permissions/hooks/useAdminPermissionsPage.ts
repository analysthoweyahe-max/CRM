import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { PERMISSION_GROUPS } from '@/modules/admin/roles/types/adminRole.types';
import {
  usePermissionList, useCreatePermission, useUpdatePermission, useDeletePermission,
} from './usePermissions';
import type { ApiPermission } from '../types/adminPermission.types';

const CORE_SLUGS = new Set(PERMISSION_GROUPS.flatMap((g) => g.slugs.map((s) => s.slug)));

export function useAdminPermissionsPage(isAr: boolean) {
  const { data: permissions, isLoading } = usePermissionList();
  const { mutate: create, isPending: creating } = useCreatePermission();
  const { mutate: update, isPending: updating } = useUpdatePermission();
  const { mutate: remove,  isPending: deleting } = useDeletePermission();

  const [showAdd,           setShowAdd]           = useState(false);
  const [editingPermission, setEditingPermission] = useState<ApiPermission | null>(null);
  const [pendingDelete,     setPendingDelete]     = useState<ApiPermission | null>(null);

  function submitAdd(name: string) {
    create({ name }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء الصلاحية' : 'Permission created');
        setShowAdd(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function submitEdit(name: string) {
    if (!editingPermission) return;
    update({ id: editingPermission.id, payload: { name } }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم تحديث الصلاحية' : 'Permission updated');
        setEditingPermission(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    remove(pendingDelete.id, {
      onSuccess: () => {
        toast.success(isAr ? 'تم حذف الصلاحية' : 'Permission deleted');
        setPendingDelete(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  return {
    permissions: permissions ?? [],
    isLoading,
    isLocked: (p: ApiPermission) => CORE_SLUGS.has(p.name),
    showAdd, openAdd: () => setShowAdd(true), closeAdd: () => setShowAdd(false),
    submitAdd, creating,
    editingPermission, openEdit: setEditingPermission, closeEdit: () => setEditingPermission(null),
    submitEdit, updating,
    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
  };
}
