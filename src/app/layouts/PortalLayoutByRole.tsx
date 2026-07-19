import { useAuth } from '@/modules/auth/context/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import { ProjectManagerLayout } from './ProjectManagerLayout';
import { SeoLeaderLayout } from './SeoLeaderLayout';
import { EmployeeLayout } from './EmployeeLayout';
import { SeoMemberLayout } from './SeoMemberLayout';

/**
 * Picks the portal chrome (sidebar/topbar) from the user's mapped app role.
 * Used for shared paths (e.g. /employees, /attendance) that must not live under
 * a single exclusive RoleGuard — otherwise the first matching branch redirects
 * every other portal role home.
 */
export function PortalLayoutByRole() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'manager':
      return <ProjectManagerLayout />;
    case 'seo-leader':
      return <SeoLeaderLayout />;
    case 'seo-member':
      return <SeoMemberLayout />;
    case 'employee':
      return <EmployeeLayout />;
    default:
      return <DashboardLayout />;
  }
}
