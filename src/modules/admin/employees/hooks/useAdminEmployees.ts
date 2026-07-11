import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import { matchesSearch } from '@/shared/utils/search.utils';
import { extractApiError } from '@/shared/utils/error.utils';
import { toAdminEmployee } from '../types/adminEmployee.types';
import type { AdminEmployee } from '../types/adminEmployee.types';

const PAGE_SIZE = 7;
const EMPLOYEES_KEY = ['admin', 'employees', 'list'];

export function useAdminEmployees(isAr: boolean) {
  const qc = useQueryClient();

  const [search,     setSearchRaw]     = useState('');
  const [department, setDepartmentRaw] = useState('');
  const [role,       setRoleRaw]       = useState('');
  const [status,     setStatusRaw]     = useState('');
  const [page,       setPage]          = useState(1);

  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<AdminEmployee | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  // No server-side role/status filters exist yet — fetch a large page once and filter client-side.
  const { data, isLoading } = useQuery({
    queryKey: EMPLOYEES_KEY,
    queryFn:  () => employeeApi.list({ per_page: 200 }).then((r) => r.data.data.data),
  });

  const employees = useMemo(
    () => (data ?? []).map(toAdminEmployee).sort((a, b) => Number(b.id) - Number(a.id)),
    [data],
  );

  const filtered = useMemo(() => employees.filter(e => {
    if (search && !matchesSearch([e.name, e.email], search)) return false;
    if (department && !e.departments.includes(department) && e.department !== department) return false;
    if (role && !e.roles.includes(role)) return false;
    if (status && e.status !== status) return false;
    return true;
  }), [employees, search, department, role, status]);

  const departmentOptions = useMemo(
    () => [...new Set(employees.flatMap(e => e.departments.length ? e.departments : [e.department]))].filter(Boolean),
    [employees],
  );
  const roleOptions       = useMemo(() => [...new Set(employees.flatMap(e => e.roles))], [employees]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged     = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function setSearch(v: string)     { setSearchRaw(v);     setPage(1); }
  function setDepartment(v: string) { setDepartmentRaw(v); setPage(1); }
  function setRole(v: string)       { setRoleRaw(v);       setPage(1); }
  function setStatus(v: string)     { setStatusRaw(v);     setPage(1); }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelected(prev => {
      const next = new Set(prev);
      const allSelected = paged.every(e => next.has(e.id));
      if (allSelected) paged.forEach(e => next.delete(e.id));
      else paged.forEach(e => next.add(e.id));
      return next;
    });
  }

  const { mutate: removeOne, isPending: deleting } = useMutation({
    mutationFn: (id: string) => employeeApi.remove(id),
    onSuccess: (_r, id) => {
      toast.success(isAr ? 'تم حذف الموظف' : 'Employee deleted');
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
      setPendingDelete(null);
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const { mutate: removeMany, isPending: bulkDeleting } = useMutation({
    mutationFn: (ids: string[]) => employeeApi.bulkRemove(ids),
    onSuccess: () => {
      toast.success(isAr ? 'تم حذف الموظفين المحددين' : 'Selected employees deleted');
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      setSelected(new Set());
      setShowBulkDelete(false);
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  return {
    employees: paged,
    allEmployees: filtered,
    isLoading,
    total: filtered.length,
    pageSize: PAGE_SIZE,
    page, setPage, pageCount,
    search, department, role, status,
    setSearch, setDepartment, setRole, setStatus,
    departmentOptions, roleOptions,

    selected, toggleOne, toggleAllOnPage,
    selectedCount: selected.size,
    clearSelection: () => setSelected(new Set()),

    pendingDelete, askDelete: setPendingDelete, cancelDelete: () => setPendingDelete(null),
    confirmDelete: () => pendingDelete && removeOne(pendingDelete.id),
    deleting,

    showBulkDelete,
    askBulkDelete:   () => selected.size > 0 && setShowBulkDelete(true),
    cancelBulkDelete: () => setShowBulkDelete(false),
    confirmBulkDelete: () => removeMany(Array.from(selected)),
    bulkDeleting,
  };
}
