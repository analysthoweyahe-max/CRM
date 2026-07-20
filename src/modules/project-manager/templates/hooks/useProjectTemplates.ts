import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { invalidateSeoProjectPhases } from '@/modules/seo-leader/campaigns/utils/seoPhase.utils';
import { projectTemplatesApi, type TemplateModule } from '../api/projectTemplate.api';
import type {
  PmProjectTemplate,
  PmTemplatePayload,
  PmApplyTemplatePayload,
} from '../types/template.types';

function listKey(module: TemplateModule) {
  return [module, 'project-templates'] as const;
}

function allKey(module: TemplateModule, projectTypeId?: number | null) {
  return [module, 'project-templates', 'all', projectTypeId ?? null] as const;
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>, module: TemplateModule) {
  qc.invalidateQueries({ queryKey: listKey(module) });
  qc.invalidateQueries({ queryKey: [module, 'project-templates', 'all'] });
}

export function useTemplateList(
  module: TemplateModule,
  params: { search?: string; page?: number; per_page?: number; project_type_id?: number },
) {
  const api = projectTemplatesApi(module);
  return useQuery({
    queryKey: [...listKey(module), params],
    queryFn:  () => api.list(params).then((r) => ({
      items:      toApiArray<PmProjectTemplate>(r.data.data),
      currentPage: r.data.data?.current_page ?? 1,
      lastPage:    r.data.data?.last_page ?? 1,
      total:       r.data.data?.total ?? 0,
    })),
  });
}

/**
 * Full template list for dropdowns.
 * Pass `projectTypeId` to filter via `?project_type_id=` (globals + matching types).
 */
export function useAllTemplates(
  module: TemplateModule = 'pm',
  projectTypeId?: number | null,
) {
  const api = projectTemplatesApi(module);
  const typeId = projectTypeId != null && !Number.isNaN(Number(projectTypeId))
    ? Number(projectTypeId)
    : undefined;

  return useQuery({
    queryKey: allKey(module, typeId ?? null),
    queryFn:  () => api.all(
      typeId != null ? { project_type_id: typeId } : {},
    ).then((r) => toApiArray<PmProjectTemplate>(r.data.data)),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTemplate(module: TemplateModule, uuid: string | undefined) {
  const api = projectTemplatesApi(module);
  return useQuery({
    queryKey: [...listKey(module), uuid],
    queryFn:  () => api.get(uuid!).then((r) => r.data.data),
    enabled:  !!uuid,
  });
}

export function useCreateTemplate(module: TemplateModule) {
  const qc = useQueryClient();
  const api = projectTemplatesApi(module);
  return useMutation({
    mutationFn: (payload: PmTemplatePayload) => api.create(payload),
    onSuccess:  () => invalidateAll(qc, module),
  });
}

export function useUpdateTemplate(module: TemplateModule) {
  const qc = useQueryClient();
  const api = projectTemplatesApi(module);
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: PmTemplatePayload }) =>
      api.update(uuid, payload),
    onSuccess:  () => invalidateAll(qc, module),
  });
}

export function useDeleteTemplate(module: TemplateModule) {
  const qc = useQueryClient();
  const api = projectTemplatesApi(module);
  return useMutation({
    mutationFn: (uuid: string) => api.remove(uuid),
    onSuccess:  () => invalidateAll(qc, module),
  });
}

export function useApplyTemplate(projectUuid: string, module: TemplateModule = 'pm') {
  const qc = useQueryClient();
  const api = projectTemplatesApi(module);
  return useMutation({
    mutationFn: (payload: PmApplyTemplatePayload) => api.apply(projectUuid, payload),
    onSuccess:  () => {
      if (module === 'seo') {
        qc.invalidateQueries({ queryKey: ['seo-project', projectUuid] });
        qc.invalidateQueries({ queryKey: ['seo-project-settings', projectUuid] });
        qc.invalidateQueries({ queryKey: ['campaign-detail', projectUuid] });
        qc.invalidateQueries({ queryKey: ['campaign-tasks', projectUuid] });
        qc.invalidateQueries({ queryKey: ['seo-member-project-tasks', projectUuid] });
        invalidateSeoProjectPhases(qc, projectUuid);
      } else {
        qc.invalidateQueries({ queryKey: ['pm-project', projectUuid] });
        qc.invalidateQueries({ queryKey: ['pm-project-settings', projectUuid] });
      }
    },
  });
}
