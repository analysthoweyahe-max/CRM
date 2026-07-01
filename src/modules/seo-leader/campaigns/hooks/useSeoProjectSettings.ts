import { useState, useEffect } from 'react';
import { useQuery }             from '@tanstack/react-query';
import { toast }                from 'sonner';
import { campaignApi }          from '../api/campaign.api';
import type { SelectOption }    from '../api/campaign.api';

export interface SettingsForm {
  name:      string;
  startDate: string;
  domain:    string;
  desc:      string;
  status:    string;
  type:      string;
}

export function useSeoProjectSettings(projectId: string, isAr: boolean) {
  const { data: settings, isLoading } = useQuery({
    queryKey:  ['seo-project-settings', projectId],
    queryFn:   () => campaignApi.getSettings(projectId).then(r => r.data.data),
    enabled:   !!projectId,
    staleTime: 60_000,
  });

  const [name,      setName]      = useState('');
  const [startDate, setStartDate] = useState('');
  const [domain,    setDomain]    = useState('');
  const [desc,      setDesc]      = useState('');
  const [status,    setStatus]    = useState('');
  const [type,      setType]      = useState('');
  const [isSaving,  setIsSaving]  = useState(false);
  const [saved,     setSaved]     = useState(false);

  /* Sync form from API on first load */
  useEffect(() => {
    if (!settings) return;
    setName(settings.name         ?? '');
    setStartDate(settings.startDate ?? '');
    setDomain(settings.targetDomain ?? '');
    setDesc(settings.description  ?? '');
    setStatus(settings.status     ?? '');
    setType(settings.campaignType ?? '');
  }, [settings]);

  async function handleSave() {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      /* Update main fields */
      await campaignApi.updateProject(projectId, {
        name:         name.trim(),
        description:  desc.trim(),
        targetDomain: domain.trim() || null,
        campaignType: type,
        startDate:    startDate || undefined,
      });

      /* Update status separately if it changed */
      if (status && status !== settings?.status) {
        await campaignApi.updateProjectStatus(projectId, status);
      }

      toast.success(isAr ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error(isAr ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }

  const statusOptions: SelectOption[] = settings?.statusOptions       ?? [];
  const typeOptions:   SelectOption[] = settings?.campaignTypeOptions  ?? [];

  return {
    isLoading,
    settings,
    /* form values */
    name,      setName,
    startDate, setStartDate,
    domain,    setDomain,
    desc,      setDesc,
    status,    setStatus,
    type,      setType,
    /* options from API */
    statusOptions,
    typeOptions,
    /* actions */
    isSaving,
    saved,
    handleSave,
    canSave: !!name.trim() && !isSaving,
  };
}
