import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import {
  useSeoProjectStatusesManage, useCreateSeoProjectStatus, useUpdateSeoProjectStatus, useDeleteSeoProjectStatus,
} from './useSeoProjectStatuses';
import type { ApiSeoProjectStatus, CreateSeoProjectStatusPayload } from '../types/seoProjectStatus.types';

function toUpdatePayload(payload: CreateSeoProjectStatusPayload) {
  const { key: _key, ...rest } = payload;
  return rest;
}

export function useAdminSeoProjectStatusesPage(isAr: boolean) {
  const { data: statuses, isLoading } = useSeoProjectStatusesManage();
  const { mutate: create, isPending: creating } = useCreateSeoProjectStatus();
  const { mutate: update, isPending: updating } = useUpdateSeoProjectStatus();
  const { mutate: remove,  isPending: deleting } = useDeleteSeoProjectStatus();

  const [showAdd,       setShowAdd]       = useState(false);
  const [editingStatus, setEditingStatus] = useState<ApiSeoProjectStatus | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ApiSeoProjectStatus | null>(null);

  function submitAdd(payload: CreateSeoProjectStatusPayload) {
    create(payload, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء الحالة' : 'Status created');
        setShowAdd(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function submitEdit(payload: CreateSeoProjectStatusPayload) {
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
    isLocked: (s: ApiSeoProjectStatus) => s.isDefault,
    showAdd, openAdd: () => setShowAdd(true), closeAdd: () => setShowAdd(false),
    submitAdd, creating,
    editingStatus, openEdit: setEditingStatus, closeEdit: () => setEditingStatus(null),
    submitEdit, updating,
    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
  };
}
