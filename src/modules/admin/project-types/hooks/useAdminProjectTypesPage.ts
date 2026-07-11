import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import {
  useProjectTypeList, useCreateProjectType, useUpdateProjectType, useDeleteProjectType,
} from './useProjectTypes';
import type {
  PmProjectTypeItem,
  PmProjectTypePayload,
  ProjectTypeCategory,
} from '@/modules/project-manager/projects/types/project.types';

export type ProjectTypeFilter = 'all' | ProjectTypeCategory;

export function useAdminProjectTypesPage(isAr: boolean) {
  const { data: types, isLoading } = useProjectTypeList();
  const { mutate: create, isPending: creating } = useCreateProjectType();
  const { mutate: update, isPending: updating } = useUpdateProjectType();
  const { mutate: remove, isPending: deleting }  = useDeleteProjectType();

  const [filter, setFilter] = useState<ProjectTypeFilter>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingType, setEditingType] = useState<PmProjectTypeItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PmProjectTypeItem | null>(null);

  const filteredTypes = useMemo(() => {
    const list = types ?? [];
    if (filter === 'all') return list;
    return list.filter((t) => t.category === filter);
  }, [types, filter]);

  function submitAdd(payload: PmProjectTypePayload & { category: ProjectTypeCategory }) {
    const { category, ...body } = payload;
    create({ category, payload: body }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء النوع' : 'Project type created');
        setShowAdd(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function submitEdit(payload: PmProjectTypePayload & { category?: ProjectTypeCategory }) {
    if (!editingType) return;
    const { category, ...body } = payload;
    void category;
    update({ category: editingType.category, id: editingType.id, payload: body }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم تحديث النوع' : 'Project type updated');
        setEditingType(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    remove({ category: pendingDelete.category, id: pendingDelete.id }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم حذف النوع' : 'Project type deleted');
        setPendingDelete(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  return {
    types: filteredTypes,
    isLoading,
    filter, setFilter,
    showAdd, openAdd: () => setShowAdd(true), closeAdd: () => setShowAdd(false),
    submitAdd, creating,
    editingType, openEdit: setEditingType, closeEdit: () => setEditingType(null),
    submitEdit, updating,
    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
  };
}
