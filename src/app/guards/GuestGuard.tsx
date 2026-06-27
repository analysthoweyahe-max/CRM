import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { ROUTES }  from '@/app/router/routes';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';

function defaultRoute(role: string | undefined): string {
  if (role === 'employee') return ROUTES.EMPLOYEE.DASHBOARD;
  if (role === 'manager')  return ROUTES.PROJECT_MANAGER.DASHBOARD;
  return ROUTES.DASHBOARD;
}

export function GuestGuard() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated) return <Navigate to={defaultRoute(user?.role)} replace />;

  return <Outlet />;
}
