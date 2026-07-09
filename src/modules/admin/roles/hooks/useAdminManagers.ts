import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/modules/auth/context/AuthContext';

import { adminApi } from '../api/admin.api';

import { matchesSearch } from '@/shared/utils/search.utils';

import { getAvatarColor, getInitial } from '@/shared/utils/avatar.utils';

import { getRoleLabel } from '@/modules/admin/employees/types/adminEmployee.types';

import type { AdminEmployee, AdminEmployeeStatus } from '@/modules/admin/employees/types/adminEmployee.types';

import type { ApiAdminManager } from '../types/adminManager.types';



const PAGE_SIZE = 7;



function toStatus(status?: string): AdminEmployeeStatus {

  return status === 'inactive' ? 'inactive' : status === 'pending' ? 'pending' : 'active';

}



const STATUS_LABEL: Record<AdminEmployeeStatus, { ar: string; en: string }> = {

  active:   { ar: 'نشط',  en: 'Active'   },

  inactive: { ar: 'معطل', en: 'Inactive' },

  pending:  { ar: 'معلق', en: 'Pending'  },

};



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

    status,

    statusLabelAr:  STATUS_LABEL[status].ar,

    statusLabelEn:  STATUS_LABEL[status].en,

    phone:          m.phone ?? undefined,

  };

}



export function useAdminManagers() {

  const { isSuperAdmin } = useAuth();

  const [search, setSearchRaw] = useState('');

  const [page,   setPage]      = useState(1);



  const { data, isLoading } = useQuery({

    queryKey: ['admin', 'managers', 'list'],

    queryFn:  () => adminApi.list({ per_page: 200 }).then((r) => r.data.data.data),

    enabled: isSuperAdmin,

  });



  const managers = useMemo(() => (data ?? []).map(toManagerVM), [data]);



  const filtered = useMemo(

    () => managers.filter(m => !search || matchesSearch([m.name, m.email], search)),

    [managers, search],

  );



  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paged     = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);



  function setSearch(v: string) { setSearchRaw(v); setPage(1); }



  return {

    employees: paged,

    isLoading: isSuperAdmin && isLoading,

    canList: isSuperAdmin,

    total: filtered.length,

    pageSize: PAGE_SIZE,

    page, setPage, pageCount,

    search, setSearch,

  };

}


