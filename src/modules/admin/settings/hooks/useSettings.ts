import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settings.api';
import type { SettingValue } from '../types/settings.types';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn:  () => settingsApi.get().then((r) => r.data.data),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: SettingValue }) =>
      settingsApi.update(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
