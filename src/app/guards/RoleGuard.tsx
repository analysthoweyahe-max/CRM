import { Navigate, Outlet } from 'react-router-dom';
import { useAuth }  from '@/modules/auth/context/AuthContext';
import { ROUTES }   from '@/app/router/routes';
import type { Role } from '@/shared/types/role.types';

function homeDashboard(role: Role | undefined): string {
  switch (role) {
    case 'admin':      return ROUTES.ADMIN.DASHBOARD;
    case 'employee':   return ROUTES.EMPLOYEE.DASHBOARD;
    case 'manager':    return ROUTES.PROJECT_MANAGER.DASHBOARD;
    case 'seo-leader': return ROUTES.SEO_LEADER.DASHBOARD;
    case 'seo-member': return ROUTES.SEO_MEMBER.DASHBOARD;
    default:           return ROUTES.DASHBOARD;
  }
}

interface RoleGuardProps {
  allowedRoles: Role[];
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={homeDashboard(user?.role)} replace />;
  }

  return <Outlet />;
}
