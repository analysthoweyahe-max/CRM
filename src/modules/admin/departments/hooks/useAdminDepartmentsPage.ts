import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { useDepartmentList, useCreateDepartment, useDeleteDepartment } from './useDepartments';
import type { ApiDepartment } from '../types/adminDepartment.types';

export function useAdminDepartmentsPage(isAr: boolean) {
  const { data: departments, isLoading } = useDepartmentList();
  const { mutate: create, isPending: creating } = useCreateDepartment();
  const { mutate: remove,  isPending: deleting } = useDeleteDepartment();

  const [showAdd,       setShowAdd]      = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ApiDepartment | null>(null);

  function submitAdd(name: string, image: File) {
    create({ name, image }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء القسم' : 'Department created');
        setShowAdd(false);
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
    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
  };
}
