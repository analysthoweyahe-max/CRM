import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { adminApi } from '../api/admin.api';
import { getAvatarColor, getInitial } from '@/shared/utils/avatar.utils';
import { getRoleLabel } from '@/modules/admin/employees/types/adminEmployee.types';
import type { AdminEmployee } from '@/modules/admin/employees/types/adminEmployee.types';
import type { ApiAdminManager, ManagerStatus } from '../types/adminManager.types';
import { getManagerStatusLabel } from '../types/adminManager.types';

const PAGE_SIZE = 10;

function toStatus(status?: string): ManagerStatus {
  const allowed: ManagerStatus[] = ['pending', 'active', 'rejected', 'suspended', 'banned'];
  return allowed.includes(status as ManagerStatus) ? status as ManagerStatus : 'active';
}

export function toManagerVM(m: ApiAdminManager): AdminEmployee {
  const status = toStatus(m.status);
  const roles  = m.roles ?? [];

  return {
    id:             m.id,
    employeeNumber: m.id,
    name:           m.name,
    email:          m.email,
    avatarInitial:  getInitial(m.name),
    avatarColor:    getAvatarColor(m.name),
    department:     '—',
    jobTitle:       '—',
    roles,
    role:           roles.length ? roles.map(r => getRoleLabel(r, true)).join('، ') : '—',
    status:         status === 'active' ? 'active' : status === 'pending' ? 'pending' : 'inactive',
    statusLabelAr:  getManagerStatusLabel(status, true),
    statusLabelEn:  getManagerStatusLabel(status, false),
    phone:          m.phone ?? undefined,
  };
}

export function useAdminManagers() {
  const { isSuperAdmin } = useAuth();
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

  const managers = useMemo(() => (data?.data ?? []).map(toManagerVM), [data]);

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
  };
}
