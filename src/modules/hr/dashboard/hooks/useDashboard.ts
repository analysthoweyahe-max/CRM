import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeApi }  from '@/modules/hr/employees/api/employee.api';
import { attendanceApi } from '@/modules/hr/attendance/api/attendance.api';
import { leavesApi }    from '@/modules/hr/leaves/api/leaves.api';
import type { ApiEmployee } from '@/modules/hr/employees/types/employee.types';
import type { ApiLeaveRequest } from '@/modules/hr/leaves/types/leaves.types';
import type { DailyAttendanceSummary } from '@/modules/hr/attendance/types/attendance.types';

export interface DashboardStats {
  totalEmployees: number;
  activeCount:    number;
  inactiveCount:  number;
  pendingLeaves:  number;
  attendanceRate: number;
}

export interface DeptEntry {
  name:   string;
  nameAr: string;
  count:  number;
}

export function useDashboard() {
  const employeesQ = useQuery({
    queryKey: ['dashboard', 'employees'],
    queryFn:  () => employeeApi.list({ per_page: 100 }).then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
  });

  const attendanceQ = useQuery({
    queryKey: ['dashboard', 'attendance'],
    queryFn:  () => attendanceApi.daily().then(r => r.data.data),
    staleTime: 60 * 1000,
  });

  const pendingLeavesQ = useQuery({
    queryKey: ['dashboard', 'pending-leaves'],
    queryFn:  () => leavesApi.list({ status: 'pending', per_page: 1 }).then(r => r.data.data),
    staleTime: 60 * 1000,
  });

  const recentLeavesQ = useQuery({
    queryKey: ['dashboard', 'recent-leaves'],
    queryFn:  () => leavesApi.list({ per_page: 5, with: 'employee' }).then(r => r.data.data.data),
    staleTime: 2 * 60 * 1000,
  });

  const employees: ApiEmployee[] = useMemo(
    () => employeesQ.data?.data ?? [],
    [employeesQ.data],
  );

  const deptDistribution: DeptEntry[] = useMemo(() => {
    const map = new Map<string, DeptEntry>();
    employees.forEach(emp => {
      if (!emp.department) return;
      const key   = String(emp.department.id);
      const entry = map.get(key);
      if (entry) {
        entry.count++;
      } else {
        map.set(key, {
          name:   emp.department.name,
          nameAr: emp.department.nameAr ?? emp.department.name,
          count:  1,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [employees]);

  const totalEmployees = employeesQ.data?.total ?? 0;
  const activeCount    = employees.filter(e => e.status === 'active').length;
  const inactiveCount  = employees.filter(e => e.status !== 'active').length;
  const pendingLeaves  = pendingLeavesQ.data?.total ?? 0;
  const summary        = attendanceQ.data?.summary;
  const attendanceRate = totalEmployees > 0
    ? Math.round(((summary?.checkedIn ?? 0) / totalEmployees) * 100)
    : 0;

  return {
    isLoading: employeesQ.isLoading || attendanceQ.isLoading || pendingLeavesQ.isLoading,
    stats: { totalEmployees, activeCount, inactiveCount, pendingLeaves, attendanceRate } as DashboardStats,
    deptDistribution,
    attendanceSummary: summary as DailyAttendanceSummary | undefined,
    recentEmployees: employees.slice(0, 5),
    recentLeaves:    (recentLeavesQ.data ?? []).filter((l) => l.employee != null) as ApiLeaveRequest[],
  };
}
