import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { useDepartmentList } from '@/modules/admin/departments/hooks/useDepartments';
import { useJobTitleList, useCreateJobTitle, useUpdateJobTitle, useDeleteJobTitle } from './useJobTitles';
import { jobTitleDepartmentId, type ApiJobTitle } from '../types/adminJobTitle.types';

export function useAdminJobTitlesPage(isAr: boolean) {
  const { data: jobTitles = [], isLoading } = useJobTitleList();
  const { data: departments = [] }          = useDepartmentList();
  const { mutate: create, isPending: creating } = useCreateJobTitle();
  const { mutate: update, isPending: updating } = useUpdateJobTitle();
  const { mutate: remove,  isPending: deleting } = useDeleteJobTitle();

  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showAdd,          setShowAdd]          = useState(false);
  const [editingJobTitle,  setEditingJobTitle]  = useState<ApiJobTitle | null>(null);
  const [pendingDelete,    setPendingDelete]    = useState<ApiJobTitle | null>(null);

  const departmentOptions = useMemo(() => {
    const deptById = new Map(departments.map((d) => [String(d.id), d.name]));
    return [...new Set(
      jobTitles.flatMap((jt) => {
        const id = jobTitleDepartmentId(jt);
        return id ? [id] : [];
      }),
    )].map((id) => ({
      id,
      label:
        deptById.get(id)
        ?? jobTitles.find((jt) => jobTitleDepartmentId(jt) === id)?.department?.name
        ?? id,
    }));
  }, [jobTitles, departments]);

  const filteredJobTitles = useMemo(
    () => jobTitles.flatMap((jt) =>
      !departmentFilter || jobTitleDepartmentId(jt) === departmentFilter ? [jt] : [],
    ),
    [jobTitles, departmentFilter],
  );

  function submitAdd(payload: { name: string; department_id: string; image: File | null }) {
    if (!payload.image) return;
    create({ name: payload.name, department_id: payload.department_id, image: payload.image }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء المسمى الوظيفي' : 'Job title created');
        setShowAdd(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function submitEdit(payload: { name: string; department_id: string; image: File | null }) {
    if (!editingJobTitle) return;
    update({
      id: editingJobTitle.id,
      payload: { name: payload.name, department_id: payload.department_id, image: payload.image ?? undefined },
    }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم تحديث المسمى الوظيفي' : 'Job title updated');
        setEditingJobTitle(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    remove(pendingDelete.id, {
      onSuccess: () => {
        toast.success(isAr ? 'تم حذف المسمى الوظيفي' : 'Job title deleted');
        setPendingDelete(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  return {
    jobTitles: filteredJobTitles,
    departments,
    isLoading,
    departmentFilter, setDepartmentFilter, departmentOptions,
    showAdd, openAdd: () => setShowAdd(true), closeAdd: () => setShowAdd(false),
    submitAdd, creating,
    editingJobTitle, openEdit: setEditingJobTitle, closeEdit: () => setEditingJobTitle(null),
    submitEdit, updating,
    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
  };
}
