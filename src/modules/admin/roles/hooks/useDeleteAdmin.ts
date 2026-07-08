import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export function useDeleteAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'managers', 'list'] }),
  });
}
