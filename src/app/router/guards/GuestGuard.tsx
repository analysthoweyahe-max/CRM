import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DEFAULT_AFTER_LOGIN } from '@/app/config/constants';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';

export function GuestGuard() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated) return <Navigate to={DEFAULT_AFTER_LOGIN} replace />;

  return <Outlet />;
}
