import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import { pmProjectsApi } from '@/modules/project-manager/projects/api/project.api';
import { seoLeaderDashboardApi } from '@/modules/seo-leader/dashboard/api/seoLeaderDashboard.api';
import { getRoleLabel } from '@/modules/admin/employees/types/adminEmployee.types';
import type { AdminDashboardData, RoleDistributionItem, DepartmentDistributionItem } from '../types/adminDashboard.types';

const ROLE_COLORS = ['#A0CD39', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

export function useAdminDashboard(): AdminDashboardData & { isLoading: boolean } {
  const { data: employeesData, isLoading: loadingEmployees } = useQuery({
    queryKey: ['admin', 'dashboard', 'employees'],
    queryFn:  () => employeeApi.list({ per_page: 200 }).then((r) => r.data.data),
  });

  const { data: pmData, isLoading: loadingPm } = useQuery({
    queryKey: ['admin', 'dashboard', 'pm-projects'],
    queryFn:  () => pmProjectsApi.list({ per_page: 100 }).then((r) => r.data.data),
  });

  const { data: seoData, isLoading: loadingSeo } = useQuery({
    queryKey: ['admin', 'dashboard', 'seo-projects'],
    queryFn:  () => seoLeaderDashboardApi.getProjects().then((r) => r.data.data),
  });

  const employees   = employeesData?.data ?? [];
  const pmProjects  = pmData?.data ?? [];
  const seoProjects = Array.isArray(seoData) ? seoData : (seoData?.data ?? []);
  const pmTotal     = pmData?.total ?? pmProjects.length;
  const seoTotal    = Array.isArray(seoData) ? seoProjects.length : (seoData?.total ?? seoProjects.length);

  const stats = useMemo(() => ({
    totalEmployees:   employeesData?.total ?? employees.length,
    activeEmployees:  employees.filter((e) => e.status === 'active').length,
    pendingEmployees: employees.filter((e) => e.status === 'pending').length,
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
    activity: [], // No audit-log endpoint exists yet.
  };
}
