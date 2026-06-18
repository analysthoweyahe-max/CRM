import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routes';

import { AuthLayout }      from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { GuestGuard }      from './guards/GuestGuard';
import { AuthGuard }       from './guards/AuthGuard';

import { LoginPage }            from '@/features/auth/pages/LoginPage';
import { SetPasswordPage }      from '@/features/auth/pages/SetPasswordPage';
import { InviteValidationPage } from '@/features/auth/pages/InviteValidationPage';
import { ForgotPasswordPage }   from '@/features/auth/pages/ForgotPasswordPage';

import { DashboardPage }     from '@/features/dashboard/pages/DashboardPage';
import { EmployeeListPage }  from '@/features/employees/pages/EmployeeListPage';
import { NewEmployeePage }   from '@/features/employees/pages/NewEmployeePage';
import { EmployeeDetailPage }from '@/features/employees/pages/EmployeeDetailPage';
import { AttendancePage }    from '@/features/attendance/pages/AttendancePage';
import { LeavesPage }        from '@/features/leaves/pages/LeavesPage';
import { DeductionsPage }    from '@/features/payroll/pages/DeductionsPage';
import { AddDeductionPage }  from '@/features/payroll/pages/AddDeductionPage';
import { BonusesPage }       from '@/features/payroll/pages/BonusesPage';
import { AddBonusPage }     from '@/features/payroll/pages/AddBonusPage';
import { MessagesPage }      from '@/features/messages/pages/MessagesPage';
import { SettingsPage }      from '@/features/settings/pages/SettingsPage';

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
      <p className="text-lg font-medium">{label}</p>
      <p className="text-sm">قريباً</p>
    </div>
  );
}

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

            <Route path={ROUTES.ATTENDANCE.DAILY}     element={<AttendancePage />} />
            <Route path={ROUTES.ATTENDANCE.LOG}       element={<ComingSoon label="سجل الحضور" />} />
            <Route path={ROUTES.LEAVES}               element={<LeavesPage />} />

            <Route path={ROUTES.PAYROLL.DEDUCTIONS}     element={<DeductionsPage />} />
            <Route path={ROUTES.PAYROLL.DEDUCTIONS_NEW} element={<AddDeductionPage />} />
            <Route path={ROUTES.PAYROLL.BONUSES}      element={<BonusesPage />} />
            <Route path={ROUTES.PAYROLL.BONUSES_NEW}  element={<AddBonusPage />} />

            <Route path={ROUTES.MESSAGES}             element={<MessagesPage />} />
            <Route path={ROUTES.SETTINGS}             element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
