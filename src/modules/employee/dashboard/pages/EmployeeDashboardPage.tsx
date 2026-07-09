import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { ROUTES }  from '@/app/router/routes';
import { Card }    from '@/shared/components/ui/Card';
import { useEmployeeTasks } from '@/modules/employee/tasks/hooks/useEmployeeTasks';
import { useEmpLeaveSummary } from '@/modules/employee/requests/hooks/useEmployeeLeave';
import { LeaveBalancePanel }  from '@/modules/employee/requests/components/LeaveBalancePanel';
import { WorkTimerCard } from '@/shared/modules/attendance/components/WorkTimerCard';
import { EmpStatCards }      from '../components/EmpStatCards';
import { MyTasksSection }    from '../components/MyTasksSection';
import { MyProjectsSection } from '../components/MyProjectsSection';
import { useEmpDashboard }   from '../hooks/useEmpDashboard';

export function EmployeeDashboardPage() {
  const { lang }  = useLang();
  const isAr      = lang === 'ar';
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const { isLoading, overview, pending, projects } = useEmpDashboard();
  const { data: tasks = [] } = useEmployeeTasks();
  const { data: leaveSummary = [], isLoading: leaveLoading } = useEmpLeaveSummary();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-[#A0CD39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {isAr ? `مرحباً، ${user?.fullName ?? ''} 👋` : `Welcome, ${user?.fullName ?? ''} 👋`}
      </h1>

      <WorkTimerCard layoutScope="employee" variant="card" />

      <EmpStatCards overview={overview} pending={pending} isAr={isAr} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MyTasksSection tasks={tasks} isAr={isAr} />

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              {isAr ? 'رصيد إجازاتي' : 'My Leave Balance'}
            </h2>
            <button
              onClick={() => navigate(ROUTES.EMPLOYEE.REQUESTS)}
              className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors inline-flex items-center gap-1"
            >
              {isAr ? 'عرض التفاصيل' : 'View Details'}
              {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
            </button>
          </div>
          <LeaveBalancePanel summary={leaveSummary} isLoading={leaveLoading} isAr={isAr} />
        </Card>
      </div>

      <MyProjectsSection projects={projects} isAr={isAr} />

    </div>
  );
}
