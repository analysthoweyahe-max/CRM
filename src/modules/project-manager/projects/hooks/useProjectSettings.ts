import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pmProjectsApi } from '../api/project.api';
import type { PmProjectPayload } from '../types/project.types';

export function useProjectSettings(id: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['pm-project-settings', id],
    queryFn:  () => pmProjectsApi.getSettings(id).then(r => r.data.data),
  });

  async function save(payload: PmProjectPayload) {
    const res = await pmProjectsApi.update(id, payload);
    queryClient.invalidateQueries({ queryKey: ['pm-project-settings', id] });
    queryClient.invalidateQueries({ queryKey: ['pm-project', id] });
    return res.data.data;
  }

  return { settings: query.data, isLoading: query.isLoading, isError: query.isError, save };
}
