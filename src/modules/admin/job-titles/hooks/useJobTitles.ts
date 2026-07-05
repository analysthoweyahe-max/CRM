import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { jobTitleApi } from '../api/jobTitle.api';
import type { ApiJobTitle, CreateJobTitlePayload, UpdateJobTitlePayload } from '../types/adminJobTitle.types';

const JOB_TITLES_KEY = ['admin', 'job-titles'];

export function useJobTitleList() {
  return useQuery({
    queryKey: JOB_TITLES_KEY,
    queryFn:  () => jobTitleApi.list().then((r) => toApiArray<ApiJobTitle>(r.data.data)),
  });
}

export function useCreateJobTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateJobTitlePayload) => jobTitleApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: JOB_TITLES_KEY }),
  });
}

export function useUpdateJobTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateJobTitlePayload }) =>
      jobTitleApi.update(id, payload),
    // The backend returns the refreshed list on update — use it directly instead of refetching.
    onSuccess:  (r) => qc.setQueryData(JOB_TITLES_KEY, toApiArray<ApiJobTitle>(r.data.data)),
  });
}

export function useDeleteJobTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => jobTitleApi.remove(id),
    // The backend returns the refreshed list on delete — use it directly instead of refetching.
    onSuccess:  (r) => qc.setQueryData(JOB_TITLES_KEY, toApiArray<ApiJobTitle>(r.data.data)),
  });
}
