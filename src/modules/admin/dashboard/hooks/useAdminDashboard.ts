import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import { getRoleLabel } from '@/modules/admin/employees/types/adminEmployee.types';
import type {
  AdminDashboardData,
  AdminDashboardStats,
  RoleDistributionItem,
  DepartmentDistributionItem,
} from '../types/adminDashboard.types';
import type { EmployeeListResponse } from '@/modules/hr/employees/types/employee.types';
import { usePmDashboard } from '@/modules/project-manager/dashboard/hooks/usePmDashboard';
import { usePmTeamCount } from '@/modules/project-manager/team/hooks/usePmTeamCount';
import { useSeoLeaderDashboard } from '@/modules/seo-leader/dashboard/hooks/useSeoLeaderDashboard';

const ROLE_COLORS = ['#A0CD39', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

const EMPTY_EMPLOYEES: EmployeeListResponse['data'] = { data: [], total: 0, current_page: 1, last_page: 1 };

async function fetchEmployees() {
  try {
    const { data } = await employeeApi.list({ per_page: 200 });
    return data.data;
  } catch {
    return EMPTY_EMPLOYEES;
  }
}

export function useAdminDashboard(): AdminDashboardData & { isLoading: boolean } {
  const pmDashboard = usePmDashboard();
  const pmTeamCount = usePmTeamCount();
  const seoDashboard = useSeoLeaderDashboard();

  const { data: employeesData, isPending: loadingEmployees } = useQuery({
    queryKey: ['admin', 'dashboard', 'employees'],
    queryFn: fetchEmployees,
  });

  const employees = employeesData?.data ?? [];

  const stats = useMemo<AdminDashboardStats>(() => ({
    pm: {
      dailyReports: pmDashboard.stats.dailyReports,
      teamMembers: pmTeamCount,
      activeTasks: pmDashboard.stats.activeTasks,
      activeProjects: pmDashboard.stats.activeProjects,
    },
    seo: {
      total_projects: seoDashboard.stats.total_projects,
      active_employees: seoDashboard.stats.active_employees,
      pending_tasks: seoDashboard.stats.pending_tasks,
      completed_projects: seoDashboard.stats.completed_projects,
    },
  }), [pmDashboard.stats, pmTeamCount, seoDashboard.stats]);

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
        color: ROLE_COLORS[i % ROLE_COLORS.length],
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
    isLoading: loadingEmployees || pmDashboard.isLoading || seoDashboard.isLoading,
    stats,
    roleDistribution,
    departmentDistribution,
    activity: [],
  };
}
