import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';

export function useUploadEmployeeContract(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => employeeApi.uploadContract(employeeId, file).then((r) => r.data.data),
    onSuccess: (emp) => {
      queryClient.setQueryData(['employee', employeeId], emp);
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
    },
  });
}

export function useRemoveEmployeeContract(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => employeeApi.removeContract(employeeId).then((r) => r.data.data),
    onSuccess: (emp) => {
      queryClient.setQueryData(['employee', employeeId], emp);
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
    },
  });
}
