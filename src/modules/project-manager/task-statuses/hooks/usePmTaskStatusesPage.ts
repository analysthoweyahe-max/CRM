import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import {
  usePmTaskStatusList, useCreatePmTaskStatus, useUpdatePmTaskStatus, useDeletePmTaskStatus,
} from './usePmTaskStatuses';
import type { ApiPmTaskStatus, CreatePmTaskStatusPayload } from '../types/pmTaskStatus.types';

export function usePmTaskStatusesPage(isAr: boolean) {
  const { data: statuses, isLoading } = usePmTaskStatusList();
  const { mutate: create, isPending: creating } = useCreatePmTaskStatus();
  const { mutate: update, isPending: updating } = useUpdatePmTaskStatus();
  const { mutate: remove,  isPending: deleting } = useDeletePmTaskStatus();

  const [showAdd,       setShowAdd]       = useState(false);
  const [editingStatus, setEditingStatus] = useState<ApiPmTaskStatus | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ApiPmTaskStatus | null>(null);

  function submitAdd(payload: CreatePmTaskStatusPayload) {
    create(payload, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء الحالة' : 'Status created');
        setShowAdd(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function submitEdit(payload: CreatePmTaskStatusPayload) {
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
    isLocked: (s: ApiPmTaskStatus) => s.isDefault,
    showAdd, openAdd: () => setShowAdd(true), closeAdd: () => setShowAdd(false),
    submitAdd, creating,
    editingStatus, openEdit: setEditingStatus, closeEdit: () => setEditingStatus(null),
    submitEdit, updating,
    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
  };
}
