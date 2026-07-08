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
import { SeoMemberLayout }       from '@/app/layouts/SeoMemberLayout';
import { GuestGuard }            from '@/app/guards/GuestGuard';
import { AuthGuard }             from '@/app/guards/AuthGuard';
import { RoleGuard }             from '@/app/guards/RoleGuard';

/* ── Auth ─────────────────────────────────────────────────────────── */
const LoginPage            = lazy(() => import('@/modules/auth/pages/LoginPage')            .then(m => ({ default: m.LoginPage })));
const SetPasswordPage      = lazy(() => import('@/modules/auth/pages/SetPasswordPage')      .then(m => ({ default: m.SetPasswordPage })));
const InviteValidationPage = lazy(() => import('@/modules/auth/pages/InviteValidationPage') .then(m => ({ default: m.InviteValidationPage })));
const ForgotPasswordPage   = lazy(() => import('@/modules/auth/pages/ForgotPasswordPage')   .then(m => ({ default: m.ForgotPasswordPage })));
const AdminAuthCallbackPage = lazy(() => import('@/modules/auth/pages/AdminAuthCallbackPage').then(m => ({ default: m.AdminAuthCallbackPage })));
const AdminOtpPage          = lazy(() => import('@/modules/auth/pages/AdminOtpPage').then(m => ({ default: m.AdminOtpPage })));

/* ── Admin ────────────────────────────────────────────────────────── */
const AdminDashboardPage = lazy(() => import('@/modules/admin/dashboard/pages/AdminDashboardPage')   .then(m => ({ default: m.AdminDashboardPage })));
const AdminEmployeesPage = lazy(() => import('@/modules/admin/employees/pages/AdminEmployeesPage')   .then(m => ({ default: m.AdminEmployeesPage })));
const AdminEmployeeDetailPage = lazy(() => import('@/modules/admin/employees/pages/AdminEmployeeDetailPage').then(m => ({ default: m.AdminEmployeeDetailPage })));
const AdminDepartmentsPage = lazy(() => import('@/modules/admin/departments/pages/AdminDepartmentsPage').then(m => ({ default: m.AdminDepartmentsPage })));
const AdminJobTitlesPage = lazy(() => import('@/modules/admin/job-titles/pages/AdminJobTitlesPage').then(m => ({ default: m.AdminJobTitlesPage })));
const AdminPermissionsPage = lazy(() => import('@/modules/admin/permissions/pages/AdminPermissionsPage').then(m => ({ default: m.AdminPermissionsPage })));
const AdminSeoTaskStatusesPage = lazy(() => import('@/modules/admin/seo-task-statuses/pages/AdminSeoTaskStatusesPage').then(m => ({ default: m.AdminSeoTaskStatusesPage })));
const AdminProjectTypesPage = lazy(() => import('@/modules/admin/project-types/pages/AdminProjectTypesPage').then(m => ({ default: m.AdminProjectTypesPage })));
const AdminInstructionsPage = lazy(() => import('@/modules/admin/instructions/pages/AdminInstructionsPage').then(m => ({ default: m.AdminInstructionsPage })));
const AdminMessagesMonitorPage = lazy(() => import('@/modules/admin/messages-monitor/pages/AdminMessagesMonitorPage').then(m => ({ default: m.AdminMessagesMonitorPage })));
const OrgSettingsPage    = lazy(() => import('@/modules/admin/org-settings/pages/OrgSettingsPage')   .then(m => ({ default: m.OrgSettingsPage })));
const AdminRolesPage     = lazy(() => import('@/modules/admin/roles/pages/AdminRolesPage')           .then(m => ({ default: m.AdminRolesPage })));
const AdminRoleEditPage  = lazy(() => import('@/modules/admin/roles/pages/AdminRoleEditPage')         .then(m => ({ default: m.AdminRoleEditPage })));
const AdminManagersPage  = lazy(() => import('@/modules/admin/roles/pages/AdminManagersPage')         .then(m => ({ default: m.AdminManagersPage })));

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
const AddPmTaskPage        = lazy(() => import('@/modules/project-manager/projects/pages/AddPmTaskPage')         .then(m => ({ default: m.AddPmTaskPage })));
const ProjectTeamPage      = lazy(() => import('@/modules/project-manager/team/pages/ProjectTeamPage')           .then(m => ({ default: m.ProjectTeamPage })));
const ProjectTeamMemberPage = lazy(() => import('@/modules/project-manager/team/pages/ProjectTeamMemberPage')    .then(m => ({ default: m.ProjectTeamMemberPage })));
const ProjectReportsPage   = lazy(() => import('@/modules/project-manager/reports/pages/ProjectReportsPage')     .then(m => ({ default: m.ProjectReportsPage })));
const PMProfilePage        = lazy(() => import('@/modules/project-manager/profile/pages/PMProfilePage')          .then(m => ({ default: m.PMProfilePage })));

/* ── SEO Leader ───────────────────────────────────────────────────── */
const SeoLeaderDashboardPage = lazy(() => import('@/modules/seo-leader/dashboard/pages/SeoLeaderDashboardPage')   .then(m => ({ default: m.SeoLeaderDashboardPage })));
const NewCampaignPage        = lazy(() => import('@/modules/seo-leader/campaigns/pages/NewCampaignPage')           .then(m => ({ default: m.NewCampaignPage })));
const CampaignDetailsPage    = lazy(() => import('@/modules/seo-leader/campaigns/pages/CampaignDetailsPage')       .then(m => ({ default: m.CampaignDetailsPage })));
const AddSeoTaskPage         = lazy(() => import('@/modules/seo-leader/campaigns/pages/AddSeoTaskPage')            .then(m => ({ default: m.AddSeoTaskPage })));
const SeoTeamPage            = lazy(() => import('@/modules/seo-leader/team/pages/SeoTeamPage')                 .then(m => ({ default: m.SeoTeamPage })));
const SeoReportsPage         = lazy(() => import('@/modules/seo-leader/reports/pages/SeoReportsPage')           .then(m => ({ default: m.SeoReportsPage })));
const SeoProfilePage         = lazy(() => import('@/modules/seo-leader/profile/pages/SeoProfilePage')           .then(m => ({ default: m.SeoProfilePage })));

/* ── SEO Member ──────────────────────────────────────────────────── */
const SeoMemberDashboardPage     = lazy(() => import('@/modules/seo-member/dashboard/pages/SeoMemberDashboardPage')         .then(m => ({ default: m.SeoMemberDashboardPage })));
const SeoMemberTasksPage         = lazy(() => import('@/modules/seo-member/tasks/pages/SeoMemberTasksPage')                 .then(m => ({ default: m.SeoMemberTasksPage })));
const SeoTaskDetailPage          = lazy(() => import('@/modules/seo-member/tasks/pages/SeoTaskDetailPage')                  .then(m => ({ default: m.SeoTaskDetailPage })));
const SeoMemberMessagesPage      = lazy(() => import('@/modules/seo-member/messages/pages/SeoMemberMessagesPage')           .then(m => ({ default: m.SeoMemberMessagesPage })));
const SeoMemberRequestsPage      = lazy(() => import('@/modules/seo-member/requests/pages/SeoMemberRequestsPage')           .then(m => ({ default: m.SeoMemberRequestsPage })));
const SeoMemberReportsPage       = lazy(() => import('@/modules/seo-member/reports/pages/SeoMemberReportsPage')             .then(m => ({ default: m.SeoMemberReportsPage })));
const SeoMemberDailyReportsPage  = lazy(() => import('@/modules/seo-member/daily-reports/pages/SeoMemberDailyReportsPage') .then(m => ({ default: m.SeoMemberDailyReportsPage })));
const SeoMemberProfilePage       = lazy(() => import('@/modules/seo-member/profile/pages/SeoMemberProfilePage')             .then(m => ({ default: m.SeoMemberProfilePage })));

/* ── Employee ─────────────────────────────────────────────────────── */
const EmployeeDashboardPage    = lazy(() => import('@/modules/employee/dashboard/pages/EmployeeDashboardPage')       .then(m => ({ default: m.EmployeeDashboardPage })));
const EmployeeMessagesPage     = lazy(() => import('@/modules/employee/messages/pages/EmployeeMessagesPage')         .then(m => ({ default: m.EmployeeMessagesPage })));
const EmployeeRequestsPage     = lazy(() => import('@/modules/employee/requests/pages/EmployeeRequestsPage')         .then(m => ({ default: m.EmployeeRequestsPage })));
const EmployeeReportsPage      = lazy(() => import('@/modules/employee/reports/pages/EmployeeReportsPage')           .then(m => ({ default: m.EmployeeReportsPage })));
const EmployeeTasksPage        = lazy(() => import('@/modules/employee/tasks/pages/EmployeeTasksPage')               .then(m => ({ default: m.EmployeeTasksPage })));
const EmployeeTaskDetailPage   = lazy(() => import('@/modules/employee/tasks/pages/TaskDetailPage')                  .then(m => ({ default: m.TaskDetailPage })));
const EmployeeDailyReportsPage = lazy(() => import('@/modules/employee/daily-reports/pages/EmployeeDailyReportsPage').then(m => ({ default: m.EmployeeDailyReportsPage })));
const EmployeeProfilePage      = lazy(() => import('@/modules/employee/profile/pages/EmployeeProfilePage')           .then(m => ({ default: m.EmployeeProfilePage })));
const EmployeeProjectMessagesPage = lazy(() => import('@/modules/employee/projects/pages/ProjectMessagesPage')        .then(m => ({ default: m.ProjectMessagesPage })));
const EmployeeAlertsPage       = lazy(() => import('@/modules/employee/alerts/pages/EmployeeAlertsPage')              .then(m => ({ default: m.EmployeeAlertsPage })));
const AlertDetailPage          = lazy(() => import('@/modules/employee/alerts/pages/AlertDetailPage')                 .then(m => ({ default: m.AlertDetailPage })));

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
                <Route path={ROUTES.AUTH.SET_PASSWORD_TOKEN()} element={<SetPasswordPage />} />
                <Route path={ROUTES.AUTH.INVITE}          element={<InviteValidationPage />} />
                <Route path={ROUTES.AUTH.INVITE_TOKEN()}  element={<InviteValidationPage />} />
                <Route path={ROUTES.AUTH.EMPLOYEE_INVITE_SET_PASSWORD()} element={<SetPasswordPage />} />
                <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                <Route path={ROUTES.AUTH.ADMIN_CALLBACK}  element={<AdminAuthCallbackPage />} />
                <Route path={ROUTES.AUTH.ADMIN_OTP}       element={<AdminOtpPage />} />
              </Route>
            </Route>

            <Route element={<AuthGuard />}>

              <Route element={<RoleGuard allowedRoles={['admin', 'hr']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path={ROUTES.DASHBOARD}              element={<DashboardPage />} />
                  <Route path={ROUTES.ADMIN.DASHBOARD}        element={<AdminDashboardPage />} />
                  <Route path={ROUTES.ADMIN.EMPLOYEES}        element={<AdminEmployeesPage />} />
                  <Route path={ROUTES.ADMIN.EMPLOYEE_DETAIL()} element={<AdminEmployeeDetailPage />} />
                  <Route path={ROUTES.ADMIN.DEPARTMENTS}      element={<AdminDepartmentsPage />} />
                  <Route path={ROUTES.ADMIN.JOB_TITLES}       element={<AdminJobTitlesPage />} />
                  <Route path={ROUTES.ADMIN.ROLES}            element={<AdminRolesPage />} />
                  <Route path={ROUTES.ADMIN.ROLES_EDIT()}     element={<AdminRoleEditPage />} />
                  <Route path={ROUTES.ADMIN.MANAGERS}         element={<AdminManagersPage />} />
                  <Route path={ROUTES.ADMIN.PERMISSIONS}      element={<AdminPermissionsPage />} />
                  <Route path={ROUTES.ADMIN.SEO_TASK_STATUSES} element={<AdminSeoTaskStatusesPage />} />
                  <Route path={ROUTES.ADMIN.PROJECT_TYPES}    element={<AdminProjectTypesPage />} />
                  <Route path={ROUTES.ADMIN.SETTINGS}         element={<OrgSettingsPage />} />

                  {/* Super-admin only (not shared with plain HR) */}
                  <Route element={<RoleGuard allowedRoles={['admin']} />}>
                    <Route path={ROUTES.ADMIN.INSTRUCTIONS}      element={<AdminInstructionsPage />} />
                    <Route path={ROUTES.ADMIN.MESSAGES_MONITOR}  element={<AdminMessagesMonitorPage />} />
                  </Route>

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

              <Route element={<RoleGuard allowedRoles={['manager', 'admin']} />}>
                <Route element={<ProjectManagerLayout />}>
                  <Route path={ROUTES.PROJECT_MANAGER.DASHBOARD} element={<ProjectDashboardPage />} />
                  <Route path={ROUTES.PROJECT_MANAGER.NEW}       element={<NewProjectPage />} />
                  <Route path={ROUTES.PROJECT_MANAGER.ADD_TASK()} element={<AddPmTaskPage />} />
                  <Route path={ROUTES.PROJECT_MANAGER.DETAILS()} element={<ProjectDetailsPage />} />
                  <Route path={ROUTES.PROJECT_MANAGER.TEAM}      element={<ProjectTeamPage />} />
                  <Route path={ROUTES.PROJECT_MANAGER.TEAM_MEMBER()} element={<ProjectTeamMemberPage />} />
                  <Route path={ROUTES.PROJECT_MANAGER.REPORTS}   element={<ProjectReportsPage />} />
                  <Route path={ROUTES.PROJECT_MANAGER.PROFILE}   element={<PMProfilePage />} />
                </Route>
              </Route>

              <Route element={<RoleGuard allowedRoles={['employee', 'admin']} />}>
                <Route element={<EmployeeLayout />}>
                  <Route path={ROUTES.EMPLOYEE.DASHBOARD}     element={<EmployeeDashboardPage />} />
                  <Route path={ROUTES.EMPLOYEE.MESSAGES}      element={<EmployeeMessagesPage />} />
                  <Route path={ROUTES.EMPLOYEE.REQUESTS}      element={<EmployeeRequestsPage />} />
                  <Route path={ROUTES.EMPLOYEE.REPORTS}       element={<EmployeeReportsPage />} />
                  <Route path={ROUTES.EMPLOYEE.TASKS}         element={<EmployeeTasksPage />} />
                  <Route path={ROUTES.EMPLOYEE.TASK_DETAIL()} element={<EmployeeTaskDetailPage />} />
                  <Route path={ROUTES.EMPLOYEE.DAILY_REPORTS} element={<EmployeeDailyReportsPage />} />
                  <Route path={ROUTES.EMPLOYEE.PROFILE}       element={<EmployeeProfilePage />} />
                  <Route path={ROUTES.EMPLOYEE.PROJECT_MESSAGES()} element={<EmployeeProjectMessagesPage />} />
                  <Route path={ROUTES.EMPLOYEE.ALERTS}        element={<EmployeeAlertsPage />} />
                  <Route path={ROUTES.EMPLOYEE.ALERT_DETAIL()} element={<AlertDetailPage />} />
                </Route>
              </Route>

              <Route element={<RoleGuard allowedRoles={['seo-leader', 'admin']} />}>
                <Route element={<SeoLeaderLayout />}>
                  <Route path={ROUTES.SEO_LEADER.DASHBOARD} element={<SeoLeaderDashboardPage />} />
                  <Route path={ROUTES.SEO_LEADER.NEW}       element={<NewCampaignPage />} />
                  <Route path={ROUTES.SEO_LEADER.ADD_TASK()}  element={<AddSeoTaskPage />} />
                  <Route path={ROUTES.SEO_LEADER.DETAILS()} element={<CampaignDetailsPage />} />
                  <Route path={ROUTES.SEO_LEADER.TEAM}      element={<SeoTeamPage />} />
                  <Route path={ROUTES.SEO_LEADER.REPORTS}   element={<SeoReportsPage />} />
                  <Route path={ROUTES.SEO_LEADER.PROFILE}   element={<SeoProfilePage />} />
                </Route>
              </Route>

              <Route element={<RoleGuard allowedRoles={['seo-member', 'admin']} />}>
                <Route element={<SeoMemberLayout />}>
                  <Route path={ROUTES.SEO_MEMBER.DASHBOARD}        element={<SeoMemberDashboardPage />} />
                  <Route path={ROUTES.SEO_MEMBER.TASKS}            element={<SeoMemberTasksPage />} />
                  <Route path={ROUTES.SEO_MEMBER.TASK_DETAIL()}    element={<SeoTaskDetailPage />} />
                  <Route path={ROUTES.SEO_MEMBER.MESSAGES}      element={<SeoMemberMessagesPage />} />
                  <Route path={ROUTES.SEO_MEMBER.REQUESTS}      element={<SeoMemberRequestsPage />} />
                  <Route path={ROUTES.SEO_MEMBER.REPORTS}       element={<SeoMemberReportsPage />} />
                  <Route path={ROUTES.SEO_MEMBER.DAILY_REPORTS} element={<SeoMemberDailyReportsPage />} />
                  <Route path={ROUTES.SEO_MEMBER.PROFILE}       element={<SeoMemberProfilePage />} />
                </Route>
              </Route>

            </Route>

            <Route path="*" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
