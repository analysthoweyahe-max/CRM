import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import {
  useSeoTaskStatusList, useCreateSeoTaskStatus, useUpdateSeoTaskStatus, useDeleteSeoTaskStatus,
} from './useSeoTaskStatuses';
import type { ApiSeoTaskStatus, CreateSeoTaskStatusPayload } from '../types/seoTaskStatus.types';

export function useAdminSeoTaskStatusesPage(isAr: boolean) {
  const { data: statuses, isLoading } = useSeoTaskStatusList();
  const { mutate: create, isPending: creating } = useCreateSeoTaskStatus();
  const { mutate: update, isPending: updating } = useUpdateSeoTaskStatus();
  const { mutate: remove,  isPending: deleting } = useDeleteSeoTaskStatus();

  const [showAdd,        setShowAdd]        = useState(false);
  const [editingStatus,  setEditingStatus]  = useState<ApiSeoTaskStatus | null>(null);
  const [pendingDelete,  setPendingDelete]  = useState<ApiSeoTaskStatus | null>(null);

  function submitAdd(payload: CreateSeoTaskStatusPayload) {
    create(payload, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء الحالة' : 'Status created');
        setShowAdd(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function submitEdit(payload: CreateSeoTaskStatusPayload) {
    if (!editingStatus) return;
    update({ id: editingStatus.id, payload }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم تحديث الحالة' : 'Status updated');
        setEditingStatus(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    remove(pendingDelete.id, {
      onSuccess: () => {
        toast.success(isAr ? 'تم حذف الحالة' : 'Status deleted');
        setPendingDelete(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  return {
    statuses: statuses ?? [],
    isLoading,
    // Defaults stay non-deletable; admins may still edit label/color/flags.
    isLocked: (s: ApiSeoTaskStatus) => s.isDefault,
    showAdd, openAdd: () => setShowAdd(true), closeAdd: () => setShowAdd(false),
    submitAdd, creating,
    editingStatus, openEdit: setEditingStatus, closeEdit: () => setEditingStatus(null),
    submitEdit, updating,
    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
  };
}
