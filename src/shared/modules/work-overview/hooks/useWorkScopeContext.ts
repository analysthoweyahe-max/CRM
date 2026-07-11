import { useMemo } from 'react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import type { WorkScope } from '../types/workOverview.types';
import { resolveWorkAppRoutes, resolveWorkScope } from '../utils/workOverview.utils';

export interface UseWorkScopeOptions {
  layoutScope?: WorkScope;
  /** Distinguishes SEO leader vs member frontend routes (same API scope). */
  seoRouteVariant?: 'leader' | 'member';
}

export function useWorkScopeContext({ layoutScope, seoRouteVariant }: UseWorkScopeOptions = {}) {
  const { user } = useAuth();
  const scope = resolveWorkScope(user?.role, user?.section, layoutScope);

  const routes = useMemo(
    () => resolveWorkAppRoutes(scope, user?.role, seoRouteVariant),
    [scope, user?.role, seoRouteVariant],
  );

  return { scope, routes, user };
}
