import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { pmProjectTemplatesApi } from '../api/projectTemplate.api';
import type {
  PmProjectTemplate,
  PmTemplatePayload,
  PmApplyTemplatePayload,
} from '../types/template.types';

const KEY     = ['pm', 'project-templates'];
const ALL_KEY = ['pm', 'project-templates', 'all'];

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: KEY });
  qc.invalidateQueries({ queryKey: ALL_KEY });
}

export function useTemplateList(params: { search?: string; page?: number; per_page?: number }) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn:  () => pmProjectTemplatesApi.list(params).then((r) => ({
      items:      toApiArray<PmProjectTemplate>(r.data.data),
      currentPage: r.data.data?.current_page ?? 1,
      lastPage:    r.data.data?.last_page ?? 1,
      total:       r.data.data?.total ?? 0,
    })),
  });
}

export function useAllTemplates() {
  return useQuery({
    queryKey: ALL_KEY,
    queryFn:  () => pmProjectTemplatesApi.all().then((r) => toApiArray<PmProjectTemplate>(r.data.data)),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTemplate(uuid: string | undefined) {
  return useQuery({
    queryKey: [...KEY, uuid],
    queryFn:  () => pmProjectTemplatesApi.get(uuid!).then((r) => r.data.data),
    enabled:  !!uuid,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PmTemplatePayload) => pmProjectTemplatesApi.create(payload),
    onSuccess:  () => invalidateAll(qc),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: PmTemplatePayload }) =>
      pmProjectTemplatesApi.update(uuid, payload),
    onSuccess:  () => invalidateAll(qc),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => pmProjectTemplatesApi.remove(uuid),
    onSuccess:  () => invalidateAll(qc),
  });
}

export function useApplyTemplate(projectUuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PmApplyTemplatePayload) => pmProjectTemplatesApi.apply(projectUuid, payload),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['pm-project', projectUuid] });
      qc.invalidateQueries({ queryKey: ['pm-project-settings', projectUuid] });
    },
  });
}
