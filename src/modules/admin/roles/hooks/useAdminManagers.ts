import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { adminApi } from '../api/admin.api';
import { getAvatarColor, getInitial } from '@/shared/utils/avatar.utils';
import { getRoleLabel } from '@/modules/admin/employees/types/adminEmployee.types';
import { resolveDisplayText } from '@/modules/hr/employees/types/employee.types';
import type { AdminEmployee } from '@/modules/admin/employees/types/adminEmployee.types';
import type { ApiAdminManager, ManagerStatus } from '../types/adminManager.types';
import { formatManagerDepartments, getManagerStatusLabel } from '../types/adminManager.types';

const PAGE_SIZE = 10;

function toStatus(status?: string): ManagerStatus {
  const allowed: ManagerStatus[] = ['pending', 'active', 'rejected', 'suspended', 'banned'];
  return allowed.includes(status as ManagerStatus) ? status as ManagerStatus : 'active';
}

export function toManagerVM(m: ApiAdminManager, isAr = true): AdminEmployee {
  const status = toStatus(m.status);
  const roles  = m.roles ?? [];
  const deptList = m.departments?.length
    ? m.departments
    : (m.department ? [m.department] : []);
  const departments = deptList
    .map((d) => resolveDisplayText(d, isAr))
    .filter(Boolean);

  return {
    id:             m.id,
    employeeNumber: m.id,
    userId:         m.id,
    name:           m.name,
    email:          m.email,
    avatarInitial:  getInitial(m.name),
    avatarColor:    getAvatarColor(m.name),
    department:     formatManagerDepartments(m, isAr),
    departments,
    jobTitle:       resolveDisplayText(m.jobTitle, isAr) || '—',
    roles,
    role:           roles.length ? roles.map(r => getRoleLabel(r, isAr)).join(isAr ? '، ' : ', ') : '—',
    status:         status === 'active' ? 'active' : status === 'pending' ? 'pending' : 'inactive',
    statusLabelAr:  getManagerStatusLabel(status, true),
    statusLabelEn:  getManagerStatusLabel(status, false),
    phone:          m.phone ?? undefined,
    permissions:    [],
    roleDetails:    [],
    roleManuallyAssigned: false,
  };
}

export function useAdminManagers() {
  const { isSuperAdmin } = useAuth();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [search, setSearchRaw] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'managers', 'list', page, search, statusFilter, roleFilter],
    queryFn: () => adminApi.list({
      page,
      per_page: PAGE_SIZE,
      search:   search || undefined,
      sort:     '-created_at',
      ...(statusFilter ? { 'filter[status]': statusFilter } : {}),
      ...(roleFilter ? { 'filter[roles.name]': roleFilter } : {}),
    }).then(r => r.data.data),
    enabled: isSuperAdmin,
  });

  // Unfiltered list so status/role Combobox options don't collapse after filtering.
  const { data: optionsData } = useQuery({
    queryKey: ['admin', 'managers', 'filter-options'],
    queryFn: () => adminApi.list({ per_page: 200, sort: '-created_at' }).then(r => r.data.data),
    enabled: isSuperAdmin,
    staleTime: 60_000,
  });

  const managers = useMemo(
    () => (data?.data ?? []).map((m) => toManagerVM(m, isAr)),
    [data, isAr],
  );

  const statusOptions = useMemo(
    () => [...new Set((optionsData?.data ?? []).flatMap((m) => (m.status ? [m.status] : [])))].filter(Boolean),
    [optionsData],
  );

  const roleOptions = useMemo(
    () => [...new Set((optionsData?.data ?? []).flatMap((m) => m.roles ?? []))].filter(Boolean),
    [optionsData],
  );

  function setSearch(v: string) { setSearchRaw(v); setPage(1); }
  function setStatus(v: string) { setStatusFilter(v); setPage(1); }
  function setRole(v: string) { setRoleFilter(v); setPage(1); }

  return {
    employees:  managers,
    isLoading:  isSuperAdmin && isLoading,
    canList:    isSuperAdmin,
    total:      data?.total ?? 0,
    pageSize:   PAGE_SIZE,
    page,
    setPage,
    pageCount:  data?.last_page ?? 1,
    search,
    setSearch,
    statusFilter,
    setStatusFilter: setStatus,
    roleFilter,
    setRoleFilter: setRole,
    statusOptions,
    roleOptions,
  };
}
