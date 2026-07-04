import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeTaskApi } from '../api/employeeTask.api';
import type { CreateSelfTaskPayload } from '../types/employeeTask.types';

export function useEmployeeTasks() {
  return useQuery({
    queryKey: ['employee', 'tasks'],
    queryFn:  () => employeeTaskApi.list(),
    select:   res => res.data.data.data,
  });
}

export function useCreateSelfTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: CreateSelfTaskPayload }) =>
      employeeTaskApi.createSelfTask(projectId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employee', 'tasks'] }),
  });
}
