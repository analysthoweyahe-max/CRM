import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobTitleApi } from '../api/jobTitle.api';
import type { CreateJobTitlePayload, UpdateJobTitlePayload } from '../types/adminJobTitle.types';

export function useJobTitleList() {
  return useQuery({
    queryKey: ['admin', 'job-titles'],
    queryFn:  () => jobTitleApi.list().then((r) => r.data.data),
  });
}

export function useCreateJobTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateJobTitlePayload) => jobTitleApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'job-titles'] }),
  });
}

export function useUpdateJobTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateJobTitlePayload }) =>
      jobTitleApi.update(id, payload),
    // The backend returns the refreshed list on update — use it directly instead of refetching.
    onSuccess:  (r) => qc.setQueryData(['admin', 'job-titles'], r.data.data),
  });
}

export function useDeleteJobTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => jobTitleApi.remove(id),
    // The backend returns the refreshed list on delete — use it directly instead of refetching.
    onSuccess:  (r) => qc.setQueryData(['admin', 'job-titles'], r.data.data),
  });
}
