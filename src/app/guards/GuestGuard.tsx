import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { ROUTES }  from '@/app/router/routes';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';

function defaultRoute(role: string | undefined): string {
  if (role === 'employee')   return ROUTES.EMPLOYEE.DASHBOARD;
  if (role === 'manager')    return ROUTES.PROJECT_MANAGER.DASHBOARD;
  if (role === 'seo-leader') return ROUTES.SEO_LEADER.DASHBOARD;
  if (role === 'seo-member') return ROUTES.SEO_MEMBER.DASHBOARD;
  return ROUTES.DASHBOARD;
}

export function GuestGuard() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to={defaultRoute(user?.role)} replace />;

  return <Outlet />;
}
