import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { adminApi } from '../api/admin.api';
import { toManagerVM } from './useAdminManagers';

export function useAdminManagerDetail() {
  const { id } = useParams<{ id: string }>();
  const { isSuperAdmin } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'managers', 'detail', id],
    queryFn:  () => adminApi.get(id!).then((r) => r.data.data),
    enabled:  !!id && isSuperAdmin,
  });

  const manager = data ? toManagerVM(data) : undefined;

  return {
    id,
    manager,
    raw: data,
    isLoading: isSuperAdmin && isLoading,
  };
}
