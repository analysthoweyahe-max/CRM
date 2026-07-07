import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import { toAdminEmployee } from '../types/adminEmployee.types';

const PAGE_SIZE = 7;

export function useAdminEmployees() {
  const [search,     setSearchRaw]     = useState('');
  const [department, setDepartmentRaw] = useState('');
  const [role,       setRoleRaw]       = useState('');
  const [status,     setStatusRaw]     = useState('');
  const [page,       setPage]          = useState(1);

  // No server-side role/status filters exist yet — fetch a large page once and filter client-side.
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'employees', 'list'],
    queryFn:  () => employeeApi.list({ per_page: 200 }).then((r) => r.data.data.data),
  });

  const employees = useMemo(
    () => (data ?? []).map(toAdminEmployee).sort((a, b) => Number(b.id) - Number(a.id)),
    [data],
  );

  const filtered = useMemo(() => employees.filter(e => {
    if (search && !`${e.name} ${e.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (department && e.department !== department) return false;
    if (role && !e.roles.includes(role)) return false;
    if (status && e.status !== status) return false;
    return true;
  }), [employees, search, department, role, status]);

  const departmentOptions = useMemo(() => [...new Set(employees.map(e => e.department))], [employees]);
  const roleOptions       = useMemo(() => [...new Set(employees.flatMap(e => e.roles))], [employees]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged     = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function setSearch(v: string)     { setSearchRaw(v);     setPage(1); }
  function setDepartment(v: string) { setDepartmentRaw(v); setPage(1); }
  function setRole(v: string)       { setRoleRaw(v);       setPage(1); }
  function setStatus(v: string)     { setStatusRaw(v);     setPage(1); }

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
  };
}
