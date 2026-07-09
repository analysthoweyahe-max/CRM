import { Suspense }                                      from 'react';
import { lazyImport }                                    from '@/shared/utils/lazyImport.utils';
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
import { PermissionGuard }       from '@/app/guards/PermissionGuard';

/* ── Auth ─────────────────────────────────────────────────────────── */
const LoginPage            = lazyImport(() => import('@/modules/auth/pages/LoginPage')            .then(m => ({ default: m.LoginPage })));
const SetPasswordPage      = lazyImport(() => import('@/modules/auth/pages/SetPasswordPage')      .then(m => ({ default: m.SetPasswordPage })));
const InviteValidationPage = lazyImport(() => import('@/modules/auth/pages/InviteValidationPage') .then(m => ({ default: m.InviteValidationPage })));
const ForgotPasswordPage   = lazyImport(() => import('@/modules/auth/pages/ForgotPasswordPage')   .then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage    = lazyImport(() => import('@/modules/auth/pages/ResetPasswordPage')    .then(m => ({ default: m.ResetPasswordPage })));
const AdminAuthCallbackPage = lazyImport(() => import('@/modules/auth/pages/AdminAuthCallbackPage').then(m => ({ default: m.AdminAuthCallbackPage })));
const AdminOtpPage          = lazyImport(() => import('@/modules/auth/pages/AdminOtpPage').then(m => ({ default: m.AdminOtpPage })));
const UnauthorizedPage      = lazyImport(() => import('@/modules/auth/pages/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })));

/* ── Admin ────────────────────────────────────────────────────────── */
const AdminDashboardPage = lazyImport(() => import('@/modules/admin/dashboard/pages/AdminDashboardPage')   .then(m => ({ default: m.AdminDashboardPage })));
const AdminEmployeesPage = lazyImport(() => import('@/modules/admin/employees/pages/AdminEmployeesPage')   .then(m => ({ default: m.AdminEmployeesPage })));
const AdminEmployeeDetailPage = lazyImport(() => import('@/modules/admin/employees/pages/AdminEmployeeDetailPage').then(m => ({ default: m.AdminEmployeeDetailPage })));
const AdminDepartmentsPage = lazyImport(() => import('@/modules/admin/departments/pages/AdminDepartmentsPage').then(m => ({ default: m.AdminDepartmentsPage })));
const AdminJobTitlesPage = lazyImport(() => import('@/modules/admin/job-titles/pages/AdminJobTitlesPage').then(m => ({ default: m.AdminJobTitlesPage })));
const AdminPermissionsPage = lazyImport(() => import('@/modules/admin/permissions/pages/AdminPermissionsPage').then(m => ({ default: m.AdminPermissionsPage })));
const AdminSeoTaskStatusesPage = lazyImport(() => import('@/modules/admin/seo-task-statuses/pages/AdminSeoTaskStatusesPage').then(m => ({ default: m.AdminSeoTaskStatusesPage })));
const AdminProjectTypesPage = lazyImport(() => import('@/modules/admin/project-types/pages/AdminProjectTypesPage').then(m => ({ default: m.AdminProjectTypesPage })));
const AdminInstructionsPage = lazyImport(() => import('@/modules/admin/instructions/pages/AdminInstructionsPage').then(m => ({ default: m.AdminInstructionsPage })));
const AdminMessagesMonitorPage = lazyImport(() => import('@/modules/admin/messages-monitor/pages/AdminMessagesMonitorPage').then(m => ({ default: m.AdminMessagesMonitorPage })));
const OrgSettingsPage    = lazyImport(() => import('@/modules/admin/org-settings/pages/OrgSettingsPage')   .then(m => ({ default: m.OrgSettingsPage })));
const AdminRolesPage     = lazyImport(() => import('@/modules/admin/roles/pages/AdminRolesPage')           .then(m => ({ default: m.AdminRolesPage })));
const AdminRoleEditPage  = lazyImport(() => import('@/modules/admin/roles/pages/AdminRoleEditPage')         .then(m => ({ default: m.AdminRoleEditPage })));
const AdminManagersPage  = lazyImport(() => import('@/modules/admin/roles/pages/AdminManagersPage')         .then(m => ({ default: m.AdminManagersPage })));
const AdminManagerDetailPage = lazyImport(() => import('@/modules/admin/roles/pages/AdminManagerDetailPage') .then(m => ({ default: m.AdminManagerDetailPage })));

/* ── HR ───────────────────────────────────────────────────────────── */
const DashboardPage      = lazyImport(() => import('@/modules/hr/dashboard/pages/DashboardPage')           .then(m => ({ default: m.DashboardPage })));
const EmployeeListPage   = lazyImport(() => import('@/modules/hr/employees/pages/EmployeeListPage')         .then(m => ({ default: m.EmployeeListPage })));
const NewEmployeePage    = lazyImport(() => import('@/modules/hr/employees/pages/NewEmployeePage')          .then(m => ({ default: m.NewEmployeePage })));
const EmployeeDetailPage = lazyImport(() => import('@/modules/hr/employees/pages/EmployeeDetailPage')       .then(m => ({ default: m.EmployeeDetailPage })));
const EmployeeEditPage   = lazyImport(() => import('@/modules/hr/employees/pages/EmployeeEditPage')         .then(m => ({ default: m.EmployeeEditPage })));
const ProfilePage        = lazyImport(() => import('@/modules/hr/profile/pages/ProfilePage')                .then(m => ({ default: m.ProfilePage })));
const AttendancePage     = lazyImport(() => import('@/modules/hr/attendance/pages/AttendancePage')          .then(m => ({ default: m.AttendancePage })));
const AttendanceLogPage  = lazyImport(() => import('@/modules/hr/attendance/pages/AttendanceLogPage')       .then(m => ({ default: m.AttendanceLogPage })));
const LeavesPage         = lazyImport(() => import('@/modules/hr/leaves/pages/LeavesPage')                  .then(m => ({ default: m.LeavesPage })));
const LeaveDetailPage    = lazyImport(() => import('@/modules/hr/leaves/pages/LeaveDetailPage')             .then(m => ({ default: m.LeaveDetailPage })));
const DeductionsPage     = lazyImport(() => import('@/modules/hr/payroll/pages/DeductionsPage')             .then(m => ({ default: m.DeductionsPage })));
const AddDeductionPage   = lazyImport(() => import('@/modules/hr/payroll/pages/AddDeductionPage')           .then(m => ({ default: m.AddDeductionPage })));
const BonusesPage        = lazyImport(() => import('@/modules/hr/payroll/pages/BonusesPage')                .then(m => ({ default: m.BonusesPage })));
const AddBonusPage       = lazyImport(() => import('@/modules/hr/payroll/pages/AddBonusPage')               .then(m => ({ default: m.AddBonusPage })));
const MessagesPage       = lazyImport(() => import('@/modules/hr/messages/pages/MessagesPage')              .then(m => ({ default: m.MessagesPage })));
const SettingsPage       = lazyImport(() => import('@/modules/admin/settings/pages/SettingsPage')           .then(m => ({ default: m.SettingsPage })));

const MyProjectsPage = lazyImport(() => import('@/shared/modules/my-projects/pages/MyProjectsPage').then(m => ({ default: m.MyProjectsPage })));
const MyTasksPage    = lazyImport(() => import('@/shared/modules/my-tasks/pages/MyTasksPage').then(m => ({ default: m.MyTasksPage })));

/* ── Project Manager ──────────────────────────────────────────────── */
const ProjectDashboardPage = lazyImport(() => import('@/modules/project-manager/dashboard/pages/ProjectDashboardPage') .then(m => ({ default: m.ProjectDashboardPage })));
const NewProjectPage       = lazyImport(() => import('@/modules/project-manager/projects/pages/NewProjectPage')        .then(m => ({ default: m.NewProjectPage })));
const ProjectDetailsPage   = lazyImport(() => import('@/modules/project-manager/projects/pages/ProjectDetailsPage')    .then(m => ({ default: m.ProjectDetailsPage })));
const ProjectInfoPage      = lazyImport(() => import('@/modules/project-manager/projects/pages/ProjectInfoPage')       .then(m => ({ default: m.ProjectInfoPage })));
const AddPmTaskPage        = lazyImport(() => import('@/modules/project-manager/projects/pages/AddPmTaskPage')         .then(m => ({ default: m.AddPmTaskPage })));
const ProjectTeamPage      = lazyImport(() => import('@/modules/project-manager/team/pages/ProjectTeamPage')           .then(m => ({ default: m.ProjectTeamPage })));
const ProjectTeamMemberPage = lazyImport(() => import('@/modules/project-manager/team/pages/ProjectTeamMemberPage')    .then(m => ({ default: m.ProjectTeamMemberPage })));
const ProjectReportsPage   = lazyImport(() => import('@/modules/project-manager/reports/pages/ProjectReportsPage')     .then(m => ({ default: m.ProjectReportsPage })));
const TemplatesPage        = lazyImport(() => import('@/modules/project-manager/templates/pages/TemplatesPage')        .then(m => ({ default: m.TemplatesPage })));
const PMProfilePage        = lazyImport(() => import('@/modules/project-manager/profile/pages/PMProfilePage')          .then(m => ({ default: m.PMProfilePage })));

/* ── SEO Leader ───────────────────────────────────────────────────── */
const SeoLeaderDashboardPage = lazyImport(() => import('@/modules/seo-leader/dashboard/pages/SeoLeaderDashboardPage')   .then(m => ({ default: m.SeoLeaderDashboardPage })));
const NewCampaignPage        = lazyImport(() => import('@/modules/seo-leader/campaigns/pages/NewCampaignPage')           .then(m => ({ default: m.NewCampaignPage })));
const CampaignDetailsPage    = lazyImport(() => import('@/modules/seo-leader/campaigns/pages/CampaignDetailsPage')       .then(m => ({ default: m.CampaignDetailsPage })));
const AddSeoTaskPage         = lazyImport(() => import('@/modules/seo-leader/campaigns/pages/AddSeoTaskPage')            .then(m => ({ default: m.AddSeoTaskPage })));
const SeoTeamPage            = lazyImport(() => import('@/modules/seo-leader/team/pages/SeoTeamPage')                 .then(m => ({ default: m.SeoTeamPage })));
const SeoReportsPage         = lazyImport(() => import('@/modules/seo-leader/reports/pages/SeoReportsPage')           .then(m => ({ default: m.SeoReportsPage })));
const SeoProfilePage         = lazyImport(() => import('@/modules/seo-leader/profile/pages/SeoProfilePage')           .then(m => ({ default: m.SeoProfilePage })));

/* ── SEO Member ──────────────────────────────────────────────────── */
const SeoMemberDashboardPage     = lazyImport(() => import('@/modules/seo-member/dashboard/pages/SeoMemberDashboardPage')         .then(m => ({ default: m.SeoMemberDashboardPage })));
const SeoTaskDetailPage          = lazyImport(() => import('@/modules/seo-member/tasks/pages/SeoTaskDetailPage')                  .then(m => ({ default: m.SeoTaskDetailPage })));
const SeoMemberMessagesPage      = lazyImport(() => import('@/modules/seo-member/messages/pages/SeoMemberMessagesPage')           .then(m => ({ default: m.SeoMemberMessagesPage })));
const SeoMemberRequestsPage      = lazyImport(() => import('@/modules/seo-member/requests/pages/SeoMemberRequestsPage')           .then(m => ({ default: m.SeoMemberRequestsPage })));
const SeoMemberReportsPage       = lazyImport(() => import('@/modules/seo-member/reports/pages/SeoMemberReportsPage')             .then(m => ({ default: m.SeoMemberReportsPage })));
const SeoMemberDailyReportsPage  = lazyImport(() => import('@/modules/seo-member/daily-reports/pages/SeoMemberDailyReportsPage') .then(m => ({ default: m.SeoMemberDailyReportsPage })));
const SeoMemberProfilePage       = lazyImport(() => import('@/modules/seo-member/profile/pages/SeoMemberProfilePage')             .then(m => ({ default: m.SeoMemberProfilePage })));

/* ── Employee ─────────────────────────────────────────────────────── */
const EmployeeDashboardPage    = lazyImport(() => import('@/modules/employee/dashboard/pages/EmployeeDashboardPage')       .then(m => ({ default: m.EmployeeDashboardPage })));
const EmployeeMessagesPage     = lazyImport(() => import('@/modules/employee/messages/pages/EmployeeMessagesPage')         .then(m => ({ default: m.EmployeeMessagesPage })));
const EmployeeRequestsPage     = lazyImport(() => import('@/modules/employee/requests/pages/EmployeeRequestsPage')         .then(m => ({ default: m.EmployeeRequestsPage })));
const EmployeeReportsPage      = lazyImport(() => import('@/modules/employee/reports/pages/EmployeeReportsPage')           .then(m => ({ default: m.EmployeeReportsPage })));
const EmployeeTaskDetailPage   = lazyImport(() => import('@/modules/employee/tasks/pages/TaskDetailPage')                  .then(m => ({ default: m.TaskDetailPage })));
const EmployeeDailyReportsPage = lazyImport(() => import('@/modules/employee/daily-reports/pages/EmployeeDailyReportsPage').then(m => ({ default: m.EmployeeDailyReportsPage })));
const EmployeeProfilePage      = lazyImport(() => import('@/modules/employee/profile/pages/EmployeeProfilePage')           .then(m => ({ default: m.EmployeeProfilePage })));
const EmployeeProjectMessagesPage = lazyImport(() => import('@/modules/employee/projects/pages/ProjectMessagesPage')        .then(m => ({ default: m.ProjectMessagesPage })));
const EmployeeAlertsPage       = lazyImport(() => import('@/modules/employee/alerts/pages/EmployeeAlertsPage')              .then(m => ({ default: m.EmployeeAlertsPage })));
const AlertDetailPage          = lazyImport(() => import('@/modules/employee/alerts/pages/AlertDetailPage')                 .then(m => ({ default: m.AlertDetailPage })));

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
                <Route path={ROUTES.AUTH.RESET_PASSWORD}  element={<ResetPasswordPage />} />
                <Route path={ROUTES.AUTH.RESET_PASSWORD_TOKEN()} element={<ResetPasswordPage />} />
                <Route path={ROUTES.AUTH.ADMIN_CALLBACK}  element={<AdminAuthCallbackPage />} />
                <Route path={ROUTES.AUTH.ADMIN_OTP}       element={<AdminOtpPage />} />
              </Route>
            </Route>

            <Route element={<AuthGuard />}>
              <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

              <Route element={<RoleGuard allowedRoles={['admin', 'hr']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path={ROUTES.DASHBOARD}              element={<DashboardPage />} />
                  <Route path={ROUTES.ADMIN.DASHBOARD}        element={<AdminDashboardPage />} />
                  <Route element={<PermissionGuard permission={['view-employees', 'create-admin']} />}>
                    <Route path={ROUTES.ADMIN.MANAGERS}         element={<AdminManagersPage />} />
                    <Route path={ROUTES.ADMIN.MANAGER_DETAIL()} element={<AdminManagerDetailPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission="view-employees" />}>
                    <Route path={ROUTES.ADMIN.EMPLOYEES}        element={<AdminEmployeesPage />} />
                    <Route path={ROUTES.ADMIN.EMPLOYEE_DETAIL()} element={<AdminEmployeeDetailPage />} />
                    <Route path={ROUTES.ADMIN.DEPARTMENTS}      element={<AdminDepartmentsPage />} />
                    <Route path={ROUTES.ADMIN.JOB_TITLES}       element={<AdminJobTitlesPage />} />
                  </Route>
                  <Route element={<PermissionGuard role="super-admin" />}>
                    <Route path={ROUTES.ADMIN.ROLES}            element={<AdminRolesPage />} />
                    <Route path={ROUTES.ADMIN.ROLES_EDIT()}     element={<AdminRoleEditPage />} />
                    <Route path={ROUTES.ADMIN.PERMISSIONS}      element={<AdminPermissionsPage />} />
                  </Route>
                  <Route element={<PermissionGuard role="super-admin" />}>
                    <Route path={ROUTES.ADMIN.SEO_TASK_STATUSES} element={<AdminSeoTaskStatusesPage />} />
                    <Route path={ROUTES.ADMIN.PROJECT_TYPES}    element={<AdminProjectTypesPage />} />
                    <Route path={ROUTES.ADMIN.SETTINGS}         element={<OrgSettingsPage />} />
                  </Route>

                  {/* Super-admin only (not shared with plain HR) */}
                  <Route element={<PermissionGuard role="super-admin" />}>
                    <Route path={ROUTES.ADMIN.INSTRUCTIONS}      element={<AdminInstructionsPage />} />
                    <Route path={ROUTES.ADMIN.MESSAGES_MONITOR}  element={<AdminMessagesMonitorPage />} />
                  </Route>

                  <Route element={<PermissionGuard permission="view-employees" />}>
                    <Route path={ROUTES.EMPLOYEES.LIST}         element={<EmployeeListPage />} />
                    <Route path={ROUTES.EMPLOYEES.DETAIL()}     element={<EmployeeDetailPage />} />
                    <Route path={ROUTES.EMPLOYEES.EDIT()}       element={<EmployeeEditPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission="create-employee" />}>
                    <Route path={ROUTES.EMPLOYEES.NEW}          element={<NewEmployeePage />} />
                  </Route>

                  <Route element={<PermissionGuard permission="view-attendance" />}>
                    <Route path={ROUTES.ATTENDANCE.DAILY}       element={<AttendancePage />} />
                    <Route path={ROUTES.ATTENDANCE.LOG}         element={<AttendanceLogPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission="view-leave" />}>
                    <Route path={ROUTES.LEAVES.LIST}            element={<LeavesPage />} />
                    <Route path={ROUTES.LEAVES.DETAIL()}        element={<LeaveDetailPage />} />
                  </Route>

                  <Route element={<PermissionGuard permission="view-payroll" />}>
                    <Route path={ROUTES.PAYROLL.DEDUCTIONS}     element={<DeductionsPage />} />
                    <Route path={ROUTES.PAYROLL.DEDUCTIONS_NEW} element={<AddDeductionPage />} />
                    <Route path={ROUTES.PAYROLL.BONUSES}        element={<BonusesPage />} />
                    <Route path={ROUTES.PAYROLL.BONUSES_NEW}    element={<AddBonusPage />} />
                  </Route>

                  <Route path={ROUTES.PROFILE}                element={<ProfilePage />} />
                  <Route path={ROUTES.MESSAGES}               element={<MessagesPage />} />
                  <Route path={ROUTES.SETTINGS}               element={<SettingsPage />} />
                </Route>
              </Route>

              <Route element={<RoleGuard allowedRoles={['manager', 'admin']} />}>
                <Route element={<ProjectManagerLayout />}>
                  <Route path={ROUTES.PROJECT_MANAGER.DASHBOARD} element={<ProjectDashboardPage />} />
                  <Route path={ROUTES.PROJECT_MANAGER.TASKS}        element={<MyTasksPage />} />
                  <Route element={<PermissionGuard permission="view-pm-projects" />}>
                    <Route path={ROUTES.PROJECT_MANAGER.MY_PROJECTS} element={<MyProjectsPage module="pm" />} />
                    <Route path={ROUTES.PROJECT_MANAGER.ADD_TASK()} element={<AddPmTaskPage />} />
                    <Route path={ROUTES.PROJECT_MANAGER.INFO()}    element={<ProjectInfoPage />} />
                    <Route path={ROUTES.PROJECT_MANAGER.DETAILS()} element={<ProjectDetailsPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission="create-pm-project" />}>
                    <Route path={ROUTES.PROJECT_MANAGER.NEW}       element={<NewProjectPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission={['view-pm-team', 'view-pm-projects']} />}>
                    <Route path={ROUTES.PROJECT_MANAGER.TEAM}      element={<ProjectTeamPage />} />
                    <Route path={ROUTES.PROJECT_MANAGER.TEAM_MEMBER()} element={<ProjectTeamMemberPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission={['view-pm-reports', 'view-pm-projects']} />}>
                    <Route path={ROUTES.PROJECT_MANAGER.REPORTS}   element={<ProjectReportsPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission="edit-pm-project" />}>
                    <Route path={ROUTES.PROJECT_MANAGER.TEMPLATES} element={<TemplatesPage />} />
                  </Route>
                  <Route path={ROUTES.PROJECT_MANAGER.PROFILE}   element={<PMProfilePage />} />

                  <Route element={<PermissionGuard permission="view-employees" />}>
                    <Route path={ROUTES.EMPLOYEES.LIST}         element={<EmployeeListPage />} />
                    <Route path={ROUTES.EMPLOYEES.DETAIL()}     element={<EmployeeDetailPage />} />
                    <Route path={ROUTES.EMPLOYEES.EDIT()}       element={<EmployeeEditPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission="create-employee" />}>
                    <Route path={ROUTES.EMPLOYEES.NEW}          element={<NewEmployeePage />} />
                  </Route>
                  <Route element={<PermissionGuard permission="view-attendance" />}>
                    <Route path={ROUTES.ATTENDANCE.DAILY}       element={<AttendancePage />} />
                    <Route path={ROUTES.ATTENDANCE.LOG}         element={<AttendanceLogPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission={['view-leave', 'approve-leave']} />}>
                    <Route path={ROUTES.LEAVES.LIST}            element={<LeavesPage />} />
                    <Route path={ROUTES.LEAVES.DETAIL()}        element={<LeaveDetailPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission={['view-payroll', 'manage-payroll']} />}>
                    <Route path={ROUTES.PAYROLL.DEDUCTIONS}     element={<DeductionsPage />} />
                    <Route path={ROUTES.PAYROLL.DEDUCTIONS_NEW} element={<AddDeductionPage />} />
                    <Route path={ROUTES.PAYROLL.BONUSES}        element={<BonusesPage />} />
                    <Route path={ROUTES.PAYROLL.BONUSES_NEW}    element={<AddBonusPage />} />
                  </Route>
                </Route>
              </Route>

              <Route element={<RoleGuard allowedRoles={['employee', 'admin']} />}>
                <Route element={<EmployeeLayout />}>
                  <Route path={ROUTES.EMPLOYEE.DASHBOARD}     element={<EmployeeDashboardPage />} />
                  <Route path={ROUTES.EMPLOYEE.MY_PROJECTS}   element={<MyProjectsPage module="pm" />} />
                  <Route path={ROUTES.EMPLOYEE.MESSAGES}      element={<EmployeeMessagesPage />} />
                  <Route path={ROUTES.EMPLOYEE.REQUESTS}      element={<EmployeeRequestsPage />} />
                  <Route path={ROUTES.EMPLOYEE.REPORTS}       element={<EmployeeReportsPage />} />
                  <Route path={ROUTES.EMPLOYEE.TASKS}         element={<MyTasksPage />} />
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
                  <Route path={ROUTES.SEO_LEADER.TASKS}       element={<MyTasksPage />} />
                  <Route element={<PermissionGuard permission="view-seo-projects" />}>
                    <Route path={ROUTES.SEO_LEADER.MY_PROJECTS} element={<MyProjectsPage module="seo" />} />
                    <Route path={ROUTES.SEO_LEADER.ADD_TASK()}  element={<AddSeoTaskPage />} />
                    <Route path={ROUTES.SEO_LEADER.DETAILS()} element={<CampaignDetailsPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission="create-seo-project" />}>
                    <Route path={ROUTES.SEO_LEADER.NEW}       element={<NewCampaignPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission="view-seo-projects" />}>
                    <Route path={ROUTES.SEO_LEADER.TEAM}      element={<SeoTeamPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission="view-seo-projects" />}>
                    <Route path={ROUTES.SEO_LEADER.REPORTS}   element={<SeoReportsPage />} />
                  </Route>
                  <Route path={ROUTES.SEO_LEADER.PROFILE}   element={<SeoProfilePage />} />

                  <Route element={<PermissionGuard permission="view-employees" />}>
                    <Route path={ROUTES.EMPLOYEES.LIST}         element={<EmployeeListPage />} />
                    <Route path={ROUTES.EMPLOYEES.DETAIL()}     element={<EmployeeDetailPage />} />
                    <Route path={ROUTES.EMPLOYEES.EDIT()}       element={<EmployeeEditPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission="create-employee" />}>
                    <Route path={ROUTES.EMPLOYEES.NEW}          element={<NewEmployeePage />} />
                  </Route>
                  <Route element={<PermissionGuard permission="view-attendance" />}>
                    <Route path={ROUTES.ATTENDANCE.DAILY}       element={<AttendancePage />} />
                    <Route path={ROUTES.ATTENDANCE.LOG}         element={<AttendanceLogPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission={['view-leave', 'approve-leave']} />}>
                    <Route path={ROUTES.LEAVES.LIST}            element={<LeavesPage />} />
                    <Route path={ROUTES.LEAVES.DETAIL()}        element={<LeaveDetailPage />} />
                  </Route>
                  <Route element={<PermissionGuard permission={['view-payroll', 'manage-payroll']} />}>
                    <Route path={ROUTES.PAYROLL.DEDUCTIONS}     element={<DeductionsPage />} />
                    <Route path={ROUTES.PAYROLL.DEDUCTIONS_NEW} element={<AddDeductionPage />} />
                    <Route path={ROUTES.PAYROLL.BONUSES}        element={<BonusesPage />} />
                    <Route path={ROUTES.PAYROLL.BONUSES_NEW}    element={<AddBonusPage />} />
                  </Route>
                </Route>
              </Route>

              <Route element={<RoleGuard allowedRoles={['seo-member', 'admin']} />}>
                <Route element={<SeoMemberLayout />}>
                  <Route path={ROUTES.SEO_MEMBER.DASHBOARD}        element={<SeoMemberDashboardPage />} />
                  <Route path={ROUTES.SEO_MEMBER.MY_PROJECTS}      element={<MyProjectsPage module="seo" />} />
                  <Route path={ROUTES.SEO_MEMBER.TASKS}            element={<MyTasksPage />} />
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
