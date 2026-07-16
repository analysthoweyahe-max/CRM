import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import { pmProjectsApi } from '@/modules/project-manager/projects/api/project.api';
import { seoLeaderDashboardApi } from '@/modules/seo-leader/dashboard/api/seoLeaderDashboard.api';
import { getRoleLabel } from '@/modules/admin/employees/types/adminEmployee.types';
import type { AdminDashboardData, RoleDistributionItem, DepartmentDistributionItem } from '../types/adminDashboard.types';
import type { EmployeeListResponse } from '@/modules/hr/employees/types/employee.types';
import type { PmProjectListApiResponse } from '@/modules/project-manager/projects/types/project.types';
import type { PaginatedProjects } from '@/modules/seo-leader/dashboard/types/dashboard.types';
import type { ApiResponse } from '@/shared/types/api.types';

const ROLE_COLORS = ['#A0CD39', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

const EMPTY_EMPLOYEES: EmployeeListResponse['data'] = { data: [], total: 0, current_page: 1, last_page: 1 };
const EMPTY_PM: PmProjectListApiResponse['data'] = { data: [], total: 0, current_page: 1, last_page: 1 };
const EMPTY_SEO: PaginatedProjects = { data: [], total: 0, current_page: 1, last_page: 1 };

async function fetchEmployees() {
  try {
    const { data } = await employeeApi.list({ per_page: 200 });
    return data.data;
  } catch {
    return EMPTY_EMPLOYEES;
  }
}

async function fetchPmProjects() {
  try {
    const { data } = await pmProjectsApi.list({ per_page: 100 });
    return data.data;
  } catch {
    return EMPTY_PM;
  }
}

async function fetchSeoProjects() {
  try {
    const { data } = await seoLeaderDashboardApi.getProjects();
    const payload = data.data as PaginatedProjects | ApiResponse<PaginatedProjects>['data'];
    if (Array.isArray(payload)) return { ...EMPTY_SEO, data: payload, total: payload.length };
    return payload ?? EMPTY_SEO;
  } catch {
    return EMPTY_SEO;
  }
}

export function useAdminDashboard(): AdminDashboardData & { isLoading: boolean } {
  const { data: employeesData, isPending: loadingEmployees } = useQuery({
    queryKey: ['admin', 'dashboard', 'employees'],
    queryFn:  fetchEmployees,
  });

  const { data: pmData, isPending: loadingPm } = useQuery({
    queryKey: ['admin', 'dashboard', 'pm-projects'],
    queryFn:  fetchPmProjects,
  });

  const { data: seoData, isPending: loadingSeo } = useQuery({
    queryKey: ['admin', 'dashboard', 'seo-projects'],
    queryFn:  fetchSeoProjects,
  });

  const employees   = employeesData?.data ?? [];
  const pmProjects  = pmData?.data ?? [];
  const seoProjects = seoData?.data ?? [];
  const pmTotal     = pmData?.total ?? pmProjects.length;
  const seoTotal    = seoData?.total ?? seoProjects.length;

  const stats = useMemo(() => ({
    totalEmployees:    employeesData?.total ?? employees.length,
    activeEmployees:   employees.filter((e) => e.status === 'active').length,
    inactiveEmployees: employees.filter((e) => e.status === 'inactive').length,
    activeProjects:
      pmProjects.filter((p) => p.status === 'in_progress').length +
      seoProjects.filter((p) => p.status === 'in_progress').length,
    totalProjects: pmTotal + seoTotal,
  }), [employees, employeesData, pmProjects, seoProjects, pmTotal, seoTotal]);

  const roleDistribution = useMemo<RoleDistributionItem[]>(() => {
    const counts = new Map<string, number>();
    employees.forEach((e) => (e.roles ?? []).forEach((role) => counts.set(role, (counts.get(role) ?? 0) + 1)));
    const total = employees.length || 1;
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([role, value], i) => ({
        labelAr: getRoleLabel(role, true),
        labelEn: getRoleLabel(role, false),
        value,
        percent: Math.round((value / total) * 100),
        color:   ROLE_COLORS[i % ROLE_COLORS.length],
      }));
  }, [employees]);

  const departmentDistribution = useMemo<DepartmentDistributionItem[]>(() => {
    const counts = new Map<string, number>();
    employees.forEach((e) => {
      const name = e.department?.name ?? '—';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ labelAr: name, labelEn: name, value }));
  }, [employees]);

  return {
    isLoading: loadingEmployees || loadingPm || loadingSeo,
    stats,
    roleDistribution,
    departmentDistribution,
    activity: [],
  };
}
