import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { useDepartmentList, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from './useDepartments';
import type { ApiDepartment } from '../types/adminDepartment.types';

export function useAdminDepartmentsPage(isAr: boolean) {
  const { data: departments, isLoading } = useDepartmentList();
  const { mutate: create, isPending: creating } = useCreateDepartment();
  const { mutate: update, isPending: updating } = useUpdateDepartment();
  const { mutate: remove,  isPending: deleting } = useDeleteDepartment();

  const [showAdd,          setShowAdd]          = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<ApiDepartment | null>(null);
  const [pendingDelete,    setPendingDelete]    = useState<ApiDepartment | null>(null);

  function submitAdd(name: string, image: File | null) {
    if (!image) return;
    create({ name, image }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء القسم' : 'Department created');
        setShowAdd(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function submitEdit(name: string, image: File | null) {
    if (!editingDepartment) return;
    update({
      id: editingDepartment.id,
      payload: { name, image: image ?? undefined },
    }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم تحديث القسم' : 'Department updated');
        setEditingDepartment(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    remove(pendingDelete.id, {
      onSuccess: () => {
        toast.success(isAr ? 'تم حذف القسم' : 'Department deleted');
        setPendingDelete(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  return {
    departments: departments ?? [],
    isLoading,
    showAdd, openAdd: () => setShowAdd(true), closeAdd: () => setShowAdd(false),
    submitAdd, creating,
    editingDepartment, openEdit: setEditingDepartment, closeEdit: () => setEditingDepartment(null),
    submitEdit, updating,
    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
  };
}
