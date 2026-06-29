import { lazy, Suspense }                              from 'react';
import { BrowserRouter, Routes, Route, Navigate }      from 'react-router-dom';
import { ROUTES }                                       from './routes';
import { ErrorBoundary }   from '@/shared/components/feedback/ErrorBoundary';
import { LoadingSpinner }  from '@/shared/components/feedback/LoadingSpinner';

import { AuthLayout }            from '@/app/layouts/AuthLayout';
import { DashboardLayout }       from '@/app/layouts/DashboardLayout';
import { ProjectManagerLayout }  from '@/app/layouts/ProjectManagerLayout';
import { EmployeeLayout }        from '@/app/layouts/EmployeeLayout';
import { SeoLeaderLayout }       from '@/app/layouts/SeoLeaderLayout';
import { GuestGuard }            from '@/app/guards/GuestGuard';
import { AuthGuard }             from '@/app/guards/AuthGuard';

/* ── Auth ─────────────────────────────────────────────────────────── */
const LoginPage            = lazy(() => import('@/modules/auth/pages/LoginPage')            .then(m => ({ default: m.LoginPage })));
const SetPasswordPage      = lazy(() => import('@/modules/auth/pages/SetPasswordPage')      .then(m => ({ default: m.SetPasswordPage })));
const InviteValidationPage = lazy(() => import('@/modules/auth/pages/InviteValidationPage') .then(m => ({ default: m.InviteValidationPage })));
const ForgotPasswordPage   = lazy(() => import('@/modules/auth/pages/ForgotPasswordPage')   .then(m => ({ default: m.ForgotPasswordPage })));

/* ── HR ───────────────────────────────────────────────────────────── */
const DashboardPage      = lazy(() => import('@/modules/hr/dashboard/pages/DashboardPage')           .then(m => ({ default: m.DashboardPage })));
const EmployeeListPage   = lazy(() => import('@/modules/hr/employees/pages/EmployeeListPage')         .then(m => ({ default: m.EmployeeListPage })));
const NewEmployeePage    = lazy(() => import('@/modules/hr/employees/pages/NewEmployeePage')          .then(m => ({ default: m.NewEmployeePage })));
const EmployeeDetailPage = lazy(() => import('@/modules/hr/employees/pages/EmployeeDetailPage')       .then(m => ({ default: m.EmployeeDetailPage })));
const EmployeeEditPage   = lazy(() => import('@/modules/hr/employees/pages/EmployeeEditPage')         .then(m => ({ default: m.EmployeeEditPage })));
const ProfilePage        = lazy(() => import('@/modules/hr/profile/pages/ProfilePage')                .then(m => ({ default: m.ProfilePage })));
const AttendancePage     = lazy(() => import('@/modules/hr/attendance/pages/AttendancePage')          .then(m => ({ default: m.AttendancePage })));
const AttendanceLogPage  = lazy(() => import('@/modules/hr/attendance/pages/AttendanceLogPage')       .then(m => ({ default: m.AttendanceLogPage })));
const LeavesPage         = lazy(() => import('@/modules/hr/leaves/pages/LeavesPage')                  .then(m => ({ default: m.LeavesPage })));
const LeaveDetailPage    = lazy(() => import('@/modules/hr/leaves/pages/LeaveDetailPage')             .then(m => ({ default: m.LeaveDetailPage })));
const DeductionsPage     = lazy(() => import('@/modules/hr/payroll/pages/DeductionsPage')             .then(m => ({ default: m.DeductionsPage })));
const AddDeductionPage   = lazy(() => import('@/modules/hr/payroll/pages/AddDeductionPage')           .then(m => ({ default: m.AddDeductionPage })));
const BonusesPage        = lazy(() => import('@/modules/hr/payroll/pages/BonusesPage')                .then(m => ({ default: m.BonusesPage })));
const AddBonusPage       = lazy(() => import('@/modules/hr/payroll/pages/AddBonusPage')               .then(m => ({ default: m.AddBonusPage })));
const MessagesPage       = lazy(() => import('@/modules/hr/messages/pages/MessagesPage')              .then(m => ({ default: m.MessagesPage })));
const SettingsPage       = lazy(() => import('@/modules/admin/settings/pages/SettingsPage')           .then(m => ({ default: m.SettingsPage })));

/* ── Project Manager ──────────────────────────────────────────────── */
const ProjectDashboardPage = lazy(() => import('@/modules/project-manager/dashboard/pages/ProjectDashboardPage') .then(m => ({ default: m.ProjectDashboardPage })));
const NewProjectPage       = lazy(() => import('@/modules/project-manager/projects/pages/NewProjectPage')        .then(m => ({ default: m.NewProjectPage })));
const ProjectDetailsPage   = lazy(() => import('@/modules/project-manager/projects/pages/ProjectDetailsPage')    .then(m => ({ default: m.ProjectDetailsPage })));
const ProjectTeamPage      = lazy(() => import('@/modules/project-manager/team/pages/ProjectTeamPage')           .then(m => ({ default: m.ProjectTeamPage })));
const ProjectReportsPage   = lazy(() => import('@/modules/project-manager/reports/pages/ProjectReportsPage')     .then(m => ({ default: m.ProjectReportsPage })));
const PMProfilePage        = lazy(() => import('@/modules/project-manager/profile/pages/PMProfilePage')          .then(m => ({ default: m.PMProfilePage })));

/* ── SEO Leader ───────────────────────────────────────────────────── */
const SeoLeaderDashboardPage = lazy(() => import('@/modules/seo-leader/dashboard/pages/SeoLeaderDashboardPage') .then(m => ({ default: m.SeoLeaderDashboardPage })));
const NewCampaignPage        = lazy(() => import('@/modules/seo-leader/campaigns/pages/NewCampaignPage')        .then(m => ({ default: m.NewCampaignPage })));
const SeoTeamPage            = lazy(() => import('@/modules/seo-leader/team/pages/SeoTeamPage')                 .then(m => ({ default: m.SeoTeamPage })));
const SeoReportsPage         = lazy(() => import('@/modules/seo-leader/reports/pages/SeoReportsPage')           .then(m => ({ default: m.SeoReportsPage })));
const SeoProfilePage         = lazy(() => import('@/modules/seo-leader/profile/pages/SeoProfilePage')           .then(m => ({ default: m.SeoProfilePage })));

/* ── Employee ─────────────────────────────────────────────────────── */
const EmployeeDashboardPage    = lazy(() => import('@/modules/employee/dashboard/pages/EmployeeDashboardPage')       .then(m => ({ default: m.EmployeeDashboardPage })));
const EmployeeMessagesPage     = lazy(() => import('@/modules/employee/messages/pages/EmployeeMessagesPage')         .then(m => ({ default: m.EmployeeMessagesPage })));
const EmployeeRequestsPage     = lazy(() => import('@/modules/employee/requests/pages/EmployeeRequestsPage')         .then(m => ({ default: m.EmployeeRequestsPage })));
const EmployeeReportsPage      = lazy(() => import('@/modules/employee/reports/pages/EmployeeReportsPage')           .then(m => ({ default: m.EmployeeReportsPage })));
const EmployeeTasksPage        = lazy(() => import('@/modules/employee/tasks/pages/EmployeeTasksPage')               .then(m => ({ default: m.EmployeeTasksPage })));
const EmployeeTaskDetailPage   = lazy(() => import('@/modules/employee/tasks/pages/TaskDetailPage')                  .then(m => ({ default: m.TaskDetailPage })));
const EmployeeDailyReportsPage = lazy(() => import('@/modules/employee/daily-reports/pages/EmployeeDailyReportsPage').then(m => ({ default: m.EmployeeDailyReportsPage })));
const EmployeeProfilePage      = lazy(() => import('@/modules/employee/profile/pages/EmployeeProfilePage')           .then(m => ({ default: m.EmployeeProfilePage })));

/* ── Router ───────────────────────────────────────────────────────── */
export function AppRouter() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
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
                <Route path={ROUTES.DASHBOARD}              element={<DashboardPage />} />

                <Route path={ROUTES.EMPLOYEES.LIST}         element={<EmployeeListPage />} />
                <Route path={ROUTES.EMPLOYEES.NEW}          element={<NewEmployeePage />} />
                <Route path={ROUTES.EMPLOYEES.DETAIL()}     element={<EmployeeDetailPage />} />
                <Route path={ROUTES.EMPLOYEES.EDIT()}       element={<EmployeeEditPage />} />

                <Route path={ROUTES.ATTENDANCE.DAILY}       element={<AttendancePage />} />
                <Route path={ROUTES.ATTENDANCE.LOG}         element={<AttendanceLogPage />} />
                <Route path={ROUTES.LEAVES.LIST}            element={<LeavesPage />} />
                <Route path={ROUTES.LEAVES.DETAIL()}        element={<LeaveDetailPage />} />

                <Route path={ROUTES.PAYROLL.DEDUCTIONS}     element={<DeductionsPage />} />
                <Route path={ROUTES.PAYROLL.DEDUCTIONS_NEW} element={<AddDeductionPage />} />
                <Route path={ROUTES.PAYROLL.BONUSES}        element={<BonusesPage />} />
                <Route path={ROUTES.PAYROLL.BONUSES_NEW}    element={<AddBonusPage />} />

                <Route path={ROUTES.PROFILE}                element={<ProfilePage />} />
                <Route path={ROUTES.MESSAGES}               element={<MessagesPage />} />
                <Route path={ROUTES.SETTINGS}               element={<SettingsPage />} />
              </Route>
            </Route>

            <Route element={<AuthGuard />}>
              <Route element={<ProjectManagerLayout />}>
                <Route path={ROUTES.PROJECT_MANAGER.DASHBOARD} element={<ProjectDashboardPage />} />
                <Route path={ROUTES.PROJECT_MANAGER.NEW}       element={<NewProjectPage />} />
                <Route path={ROUTES.PROJECT_MANAGER.DETAILS()} element={<ProjectDetailsPage />} />
                <Route path={ROUTES.PROJECT_MANAGER.TEAM}      element={<ProjectTeamPage />} />
                <Route path={ROUTES.PROJECT_MANAGER.REPORTS}   element={<ProjectReportsPage />} />
                <Route path={ROUTES.PROJECT_MANAGER.PROFILE}   element={<PMProfilePage />} />
              </Route>
            </Route>

            <Route element={<AuthGuard />}>
              <Route element={<EmployeeLayout />}>
                <Route path={ROUTES.EMPLOYEE.DASHBOARD}     element={<EmployeeDashboardPage />} />
                <Route path={ROUTES.EMPLOYEE.MESSAGES}      element={<EmployeeMessagesPage />} />
                <Route path={ROUTES.EMPLOYEE.REQUESTS}      element={<EmployeeRequestsPage />} />
                <Route path={ROUTES.EMPLOYEE.REPORTS}       element={<EmployeeReportsPage />} />
                <Route path={ROUTES.EMPLOYEE.TASKS}            element={<EmployeeTasksPage />} />
                <Route path={ROUTES.EMPLOYEE.TASK_DETAIL()} element={<EmployeeTaskDetailPage />} />
                <Route path={ROUTES.EMPLOYEE.DAILY_REPORTS} element={<EmployeeDailyReportsPage />} />
                <Route path={ROUTES.EMPLOYEE.PROFILE}       element={<EmployeeProfilePage />} />
              </Route>
            </Route>

            <Route element={<AuthGuard />}>
              <Route element={<SeoLeaderLayout />}>
                <Route path={ROUTES.SEO_LEADER.DASHBOARD} element={<SeoLeaderDashboardPage />} />
                <Route path={ROUTES.SEO_LEADER.NEW}       element={<NewCampaignPage />} />
                <Route path={ROUTES.SEO_LEADER.TEAM}      element={<SeoTeamPage />} />
                <Route path={ROUTES.SEO_LEADER.REPORTS}   element={<SeoReportsPage />} />
                <Route path={ROUTES.SEO_LEADER.PROFILE}   element={<SeoProfilePage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
