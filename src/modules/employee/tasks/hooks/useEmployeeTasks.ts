import { useQuery } from '@tanstack/react-query';
import { employeeTaskApi } from '../api/employeeTask.api';

export function useEmployeeTasks() {
  return useQuery({
    queryKey: ['employee', 'tasks'],
    queryFn:  () => employeeTaskApi.list(),
    select:   res => res.data.data.data,
  });
}
