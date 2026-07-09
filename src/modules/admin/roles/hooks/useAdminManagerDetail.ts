import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { adminApi } from '../api/admin.api';
import { toManagerVM } from './useAdminManagers';
import type { ApiAdminManager } from '../types/adminManager.types';

interface Options {
  /** HR managers pass manager data via route state — they cannot call GET /admins/{id}. */
  fallback?: ApiAdminManager;
}

export function useAdminManagerDetail(options: Options = {}) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { isSuperAdmin } = useAuth();

  const stateManager = (location.state as { manager?: ApiAdminManager } | null)?.manager;
  const fallback = options.fallback ?? stateManager;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'managers', 'detail', id],
    queryFn:  () => adminApi.get(id!).then(r => r.data.data),
    enabled:  !!id && isSuperAdmin,
    retry:    (_, err) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      return status !== 403 && status !== 404;
    },
  });

  const raw = isSuperAdmin ? data : fallback;
  const manager = raw ? toManagerVM(raw) : undefined;
  const notFound = isSuperAdmin
    ? (!isLoading && (isError || (!data && !!id)))
    : !fallback;

  return {
    id,
    manager,
    raw,
    isLoading: isSuperAdmin && isLoading,
    notFound,
  };
}
