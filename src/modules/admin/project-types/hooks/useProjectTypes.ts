import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  pmAdminProjectTypesApi,
  seoAdminProjectTypesApi,
  projectTypesApiFor,
} from '../api/projectType.api';
import type {
  PmProjectTypeItem,
  PmProjectTypePayload,
  ProjectTypeCategory,
} from '@/modules/project-manager/projects/types/project.types';

const KEY = ['admin', 'project-types'] as const;
const PM_LOOKUP_KEY = ['pm-project-lookups', 'types'] as const;
const CREATE_PROJECT_TYPES_KEY = ['create-project'] as const;

async function fetchCombinedProjectTypes(): Promise<PmProjectTypeItem[]> {
  const results = await Promise.allSettled([
    pmAdminProjectTypesApi.list(),
    seoAdminProjectTypesApi.list(),
  ]);

  const pm  = results[0].status === 'fulfilled' ? results[0].value : [];
  const seo = results[1].status === 'fulfilled' ? results[1].value : [];

  // Combined admin table: each list already has category set client-side.
  return [...pm, ...seo];
}

function invalidateTypeCaches(qc: ReturnType<typeof useQueryClient>, category?: ProjectTypeCategory) {
  qc.invalidateQueries({ queryKey: KEY });
  if (!category || category === 'pm') {
    qc.invalidateQueries({ queryKey: PM_LOOKUP_KEY });
  }
  qc.invalidateQueries({ queryKey: CREATE_PROJECT_TYPES_KEY });
}

export function useProjectTypeList() {
  return useQuery({
    queryKey: KEY,
    queryFn:  fetchCombinedProjectTypes,
  });
}

export function useCreateProjectType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ category, payload }: { category: ProjectTypeCategory; payload: PmProjectTypePayload }) =>
      projectTypesApiFor(category).create(payload),
    onSuccess: (_data, vars) => invalidateTypeCaches(qc, vars.category),
  });
}

export function useUpdateProjectType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      category,
      id,
      payload,
    }: {
      category: ProjectTypeCategory;
      id: number;
      payload: PmProjectTypePayload;
    }) => projectTypesApiFor(category).update(id, payload),
    onSuccess: (_data, vars) => invalidateTypeCaches(qc, vars.category),
  });
}

export function useDeleteProjectType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ category, id }: { category: ProjectTypeCategory; id: number }) =>
      projectTypesApiFor(category).remove(id),
    onSuccess: (_data, vars) => invalidateTypeCaches(qc, vars.category),
  });
}
