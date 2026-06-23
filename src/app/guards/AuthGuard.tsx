import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { ROUTES } from '@/app/router/routes';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';

export function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to={ROUTES.AUTH.LOGIN} replace />;

  return <Outlet />;
}
