import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routes';

import { AuthLayout }      from '@/app/layouts/AuthLayout';
import { DashboardLayout }        from '@/app/layouts/DashboardLayout';
import { ProjectManagerLayout }   from '@/app/layouts/ProjectManagerLayout';
import { GuestGuard }             from '@/app/guards/GuestGuard';
import { AuthGuard }              from '@/app/guards/AuthGuard';

import { LoginPage }            from '@/modules/auth/pages/LoginPage';
import { SetPasswordPage }      from '@/modules/auth/pages/SetPasswordPage';
import { InviteValidationPage } from '@/modules/auth/pages/InviteValidationPage';
import { ForgotPasswordPage }   from '@/modules/auth/pages/ForgotPasswordPage';

import { DashboardPage }     from '@/modules/hr/dashboard/pages/DashboardPage';
import { EmployeeListPage }  from '@/modules/hr/employees/pages/EmployeeListPage';
import { NewEmployeePage }   from '@/modules/hr/employees/pages/NewEmployeePage';
import { EmployeeDetailPage }from '@/modules/hr/employees/pages/EmployeeDetailPage';
import { ProfilePage }       from '@/modules/hr/profile/pages/ProfilePage';
import { EmployeeEditPage }  from '@/modules/hr/employees/pages/EmployeeEditPage';
import { AttendancePage }    from '@/modules/hr/attendance/pages/AttendancePage';
import { AttendanceLogPage } from '@/modules/hr/attendance/pages/AttendanceLogPage';
import { LeavesPage }        from '@/modules/hr/leaves/pages/LeavesPage';
import { LeaveDetailPage }   from '@/modules/hr/leaves/pages/LeaveDetailPage';
import { DeductionsPage }    from '@/modules/hr/payroll/pages/DeductionsPage';
import { AddDeductionPage }  from '@/modules/hr/payroll/pages/AddDeductionPage';
import { BonusesPage }       from '@/modules/hr/payroll/pages/BonusesPage';
import { AddBonusPage }     from '@/modules/hr/payroll/pages/AddBonusPage';
import { MessagesPage }      from '@/modules/hr/messages/pages/MessagesPage';
import { SettingsPage }      from '@/modules/admin/settings/pages/SettingsPage';

import { ProjectDashboardPage } from '@/modules/project-manager/dashboard/pages/ProjectDashboardPage';
import { NewProjectPage }       from '@/modules/project-manager/projects/pages/NewProjectPage';
import { ProjectDetailsPage }   from '@/modules/project-manager/projects/pages/ProjectDetailsPage';
import { ProjectTeamPage }      from '@/modules/project-manager/team/pages/ProjectTeamPage';
import { ProjectReportsPage }   from '@/modules/project-manager/reports/pages/ProjectReportsPage';
import { PMProfilePage }        from '@/modules/project-manager/profile/pages/PMProfilePage';


export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />

        <Route element={<GuestGuard />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.AUTH.LOGIN}           element={<LoginPage />} />
            <Route path={ROUTES.AUTH.SET_PASSWORD}    element={<SetPasswordPage />} />
            <Route path={ROUTES.AUTH.INVITE}          element={<InviteValidationPage />} />
            <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.DASHBOARD}            element={<DashboardPage />} />

            <Route path={ROUTES.EMPLOYEES.LIST}       element={<EmployeeListPage />} />
            <Route path={ROUTES.EMPLOYEES.NEW}        element={<NewEmployeePage />} />
            <Route path={ROUTES.EMPLOYEES.DETAIL()}   element={<EmployeeDetailPage />} />
            <Route path={ROUTES.EMPLOYEES.EDIT()}     element={<EmployeeEditPage />} />

            <Route path={ROUTES.ATTENDANCE.DAILY}     element={<AttendancePage />} />
            <Route path={ROUTES.ATTENDANCE.LOG}       element={<AttendanceLogPage />} />
            <Route path={ROUTES.LEAVES.LIST}           element={<LeavesPage />} />
            <Route path={ROUTES.LEAVES.DETAIL()}      element={<LeaveDetailPage />} />

            <Route path={ROUTES.PAYROLL.DEDUCTIONS}     element={<DeductionsPage />} />
            <Route path={ROUTES.PAYROLL.DEDUCTIONS_NEW} element={<AddDeductionPage />} />
            <Route path={ROUTES.PAYROLL.BONUSES}      element={<BonusesPage />} />
            <Route path={ROUTES.PAYROLL.BONUSES_NEW}  element={<AddBonusPage />} />

            <Route path={ROUTES.PROFILE}              element={<ProfilePage />} />
            <Route path={ROUTES.MESSAGES}             element={<MessagesPage />} />
            <Route path={ROUTES.SETTINGS}             element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<AuthGuard />}>
          <Route element={<ProjectManagerLayout />}>
            <Route path={ROUTES.PROJECT_MANAGER.DASHBOARD}  element={<ProjectDashboardPage />} />
            <Route path={ROUTES.PROJECT_MANAGER.NEW}        element={<NewProjectPage />} />
            <Route path={ROUTES.PROJECT_MANAGER.DETAILS()}  element={<ProjectDetailsPage />} />
            <Route path={ROUTES.PROJECT_MANAGER.TEAM}       element={<ProjectTeamPage />} />
            <Route path={ROUTES.PROJECT_MANAGER.REPORTS}   element={<ProjectReportsPage />} />
            <Route path={ROUTES.PROJECT_MANAGER.PROFILE}   element={<PMProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
