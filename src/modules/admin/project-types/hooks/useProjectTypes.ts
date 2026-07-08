import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { pmProjectTypesApi } from '@/modules/project-manager/projects/api/project.api';
import type { PmProjectTypeItem, PmProjectTypePayload } from '@/modules/project-manager/projects/types/project.types';

const KEY = ['admin', 'project-types'];
const LOOKUP_KEY = ['pm-project-lookups', 'types'];

export function useProjectTypeList() {
  return useQuery({
    queryKey: KEY,
    queryFn:  () => pmProjectTypesApi.list().then((r) => toApiArray<PmProjectTypeItem>(r.data.data)),
  });
}

export function useCreateProjectType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PmProjectTypePayload) => pmProjectTypesApi.create(payload),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: LOOKUP_KEY });
    },
  });
}

export function useUpdateProjectType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PmProjectTypePayload }) =>
      pmProjectTypesApi.update(id, payload),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: LOOKUP_KEY });
    },
  });
}

export function useDeleteProjectType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pmProjectTypesApi.remove(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: LOOKUP_KEY });
    },
  });
}
