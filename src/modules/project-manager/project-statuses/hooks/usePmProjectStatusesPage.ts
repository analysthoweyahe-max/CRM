import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import {
  usePmProjectStatusesManage, useCreatePmProjectStatus, useUpdatePmProjectStatus, useDeletePmProjectStatus,
} from './usePmProjectStatuses';
import type { ApiPmProjectStatus, CreatePmProjectStatusPayload } from '../types/pmProjectStatus.types';

function toUpdatePayload(payload: CreatePmProjectStatusPayload) {
  return payload;
}

export function usePmProjectStatusesPage(isAr: boolean) {
  const { data: statuses, isLoading } = usePmProjectStatusesManage();
  const { mutate: create, isPending: creating } = useCreatePmProjectStatus();
  const { mutate: update, isPending: updating } = useUpdatePmProjectStatus();
  const { mutate: remove,  isPending: deleting } = useDeletePmProjectStatus();

  const [showAdd,       setShowAdd]       = useState(false);
  const [editingStatus, setEditingStatus] = useState<ApiPmProjectStatus | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ApiPmProjectStatus | null>(null);

  function submitAdd(payload: CreatePmProjectStatusPayload) {
    create(payload, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء الحالة' : 'Status created');
        setShowAdd(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function submitEdit(payload: CreatePmProjectStatusPayload) {
    if (!editingStatus) return;
    update({ id: editingStatus.id, payload: toUpdatePayload(payload) }, {
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
    isLocked: (s: ApiPmProjectStatus) => s.isDefault,
    showAdd, openAdd: () => setShowAdd(true), closeAdd: () => setShowAdd(false),
    submitAdd, creating,
    editingStatus, openEdit: setEditingStatus, closeEdit: () => setEditingStatus(null),
    submitEdit, updating,
    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
  };
}
