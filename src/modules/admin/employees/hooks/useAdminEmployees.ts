import { useMemo, useState } from 'react';
import { useEmployees, addEmployee as addEmployeeToStore } from '../store/adminEmployeeStore';
import type { AdminEmployeeDetail } from '../types/adminEmployee.types';

const PAGE_SIZE  = 7;
const MOCK_TOTAL = 48;
const PAGE_COUNT = 4;

export function useAdminEmployees() {
  const employees = useEmployees();
  const [search,     setSearchRaw]     = useState('');
  const [department, setDepartmentRaw] = useState('');
  const [role,       setRoleRaw]       = useState('');
  const [status,     setStatusRaw]     = useState('');
  const [page,       setPage]          = useState(1);

  const filtered = useMemo(() => employees.filter(e => {
    if (search && !`${e.name} ${e.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (department && e.department !== department) return false;
    if (role && e.role !== role) return false;
    if (status && e.status !== status) return false;
    return true;
  }), [employees, search, department, role, status]);

  const departmentOptions = useMemo(() => [...new Set(employees.map(e => e.department))], [employees]);
  const roleOptions       = useMemo(() => [...new Set(employees.map(e => e.role))], [employees]);

  function setSearch(v: string)     { setSearchRaw(v);     setPage(1); }
  function setDepartment(v: string) { setDepartmentRaw(v); setPage(1); }
  function setRole(v: string)       { setRoleRaw(v);       setPage(1); }
  function setStatus(v: string)     { setStatusRaw(v);     setPage(1); }

  function addEmployee(newEmp: AdminEmployeeDetail) {
    addEmployeeToStore(newEmp);
  }

  return {
    employees: filtered,
    total: MOCK_TOTAL,
    pageSize: PAGE_SIZE,
    page, setPage, pageCount: PAGE_COUNT,
    search, department, role, status,
    setSearch, setDepartment, setRole, setStatus,
    departmentOptions, roleOptions,
    addEmployee,
  };
}
