import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export function useUploadManagerContract(managerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => adminApi.uploadContract(managerId, file).then((r) => r.data.data),
    onSuccess: (manager) => {
      queryClient.setQueryData(['admin', 'managers', 'detail', managerId], manager);
      queryClient.invalidateQueries({ queryKey: ['admin', 'managers', 'detail', managerId] });
    },
  });
}

export function useRemoveManagerContract(managerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminApi.removeContract(managerId).then((r) => r.data.data),
    onSuccess: (manager) => {
      queryClient.setQueryData(['admin', 'managers', 'detail', managerId], manager);
      queryClient.invalidateQueries({ queryKey: ['admin', 'managers', 'detail', managerId] });
    },
  });
}
