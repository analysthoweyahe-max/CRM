import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import {
  useProjectTypeList, useCreateProjectType, useUpdateProjectType, useDeleteProjectType,
} from './useProjectTypes';
import type { PmProjectTypeItem, PmProjectTypePayload } from '@/modules/project-manager/projects/types/project.types';

export function useAdminProjectTypesPage(isAr: boolean) {
  const { data: types, isLoading } = useProjectTypeList();
  const { mutate: create, isPending: creating } = useCreateProjectType();
  const { mutate: update, isPending: updating } = useUpdateProjectType();
  const { mutate: remove, isPending: deleting }  = useDeleteProjectType();

  const [showAdd,      setShowAdd]      = useState(false);
  const [editingType,  setEditingType]  = useState<PmProjectTypeItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PmProjectTypeItem | null>(null);

  function submitAdd(payload: PmProjectTypePayload) {
    create(payload, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء النوع' : 'Project type created');
        setShowAdd(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function submitEdit(payload: PmProjectTypePayload) {
    if (!editingType) return;
    update({ id: editingType.id, payload }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم تحديث النوع' : 'Project type updated');
        setEditingType(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    remove(pendingDelete.id, {
      onSuccess: () => {
        toast.success(isAr ? 'تم حذف النوع' : 'Project type deleted');
        setPendingDelete(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  return {
    types: types ?? [],
    isLoading,
    showAdd, openAdd: () => setShowAdd(true), closeAdd: () => setShowAdd(false),
    submitAdd, creating,
    editingType, openEdit: setEditingType, closeEdit: () => setEditingType(null),
    submitEdit, updating,
    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
  };
}
