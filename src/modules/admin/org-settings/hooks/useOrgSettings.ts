import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { orgSettingsApi } from '../api/orgSettings.api';
import type { OrgSettings, UpdateOrgSettingsPayload } from '../types/orgSettings.types';

const ORG_SETTINGS_KEY = ['admin', 'org-settings'];

function useOrgSettingsQuery() {
  return useQuery({
    queryKey: ORG_SETTINGS_KEY,
    queryFn:  () => orgSettingsApi.get().then((r) => r.data.data),
  });
}

/** Read-only access to the company/org settings (e.g. work hours) for use
    outside the settings page, such as constraining the new-employee form. */
export function useOrgSettingsData() {
  return useOrgSettingsQuery();
}

function useUpdateOrgSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOrgSettingsPayload) => orgSettingsApi.update(payload),
    onSuccess:  (r) => qc.setQueryData(ORG_SETTINGS_KEY, r.data.data),
  });
}

export function useOrgSettingsPage(isAr: boolean) {
  const { data, isLoading } = useOrgSettingsQuery();
  const { mutate: update, isPending: saving } = useUpdateOrgSettings();

  const [draft, setDraft] = useState<OrgSettings | null>(null);

  useEffect(() => {
    if (!data) return;
    setDraft({
      ...data,
      casualLeave: data.casualLeave ?? 0,
      leaveTypes:  data.leaveTypes ?? [],
    });
  }, [data]);

  function set<K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) {
    setDraft((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  function save() {
    if (!draft) return;
    const { updatedAt: _updatedAt, ...payload } = draft;
    update(payload, {
      onSuccess: () => toast.success(isAr ? 'تم حفظ التغييرات' : 'Changes saved'),
      onError:   (err) => toast.error(extractApiError(err)),
    });
  }

  function cancel() {
    if (!data) return;
    setDraft({
      ...data,
      casualLeave: data.casualLeave ?? 0,
      leaveTypes:  data.leaveTypes ?? [],
    });
  }

  return { settings: draft, isLoading, set, save, cancel, saving };
}
