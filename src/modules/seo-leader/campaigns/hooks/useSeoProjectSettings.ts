import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { campaignApi } from '../api/campaign.api';
import type { SelectOption } from '../api/campaign.api';
import { extractApiFieldErrors } from '@/shared/utils/error.utils';
import {
  optionalLink,
  optionalContractDurationMonths,
  validateProjectOptionalFields,
} from '@/shared/utils/projectOptionalFields.utils';
import type { ProjectOptionalFieldErrors } from '@/shared/utils/projectOptionalFields.utils';

export function useSeoProjectSettings(projectId: string, isAr: boolean) {
  const { data: settings, isLoading } = useQuery({
    queryKey:  ['seo-project-settings', projectId],
    queryFn:   () => campaignApi.getSettings(projectId).then(r => r.data.data),
    enabled:   !!projectId,
    staleTime: 60_000,
  });

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [domain, setDomain] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [contractDurationMonths, setContractDurationMonths] = useState('');
  const [optionalFieldErrors, setOptionalFieldErrors] = useState<ProjectOptionalFieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setName(settings.name ?? '');
    setStartDate(settings.startDate ?? '');
    setDomain(settings.targetDomain ?? '');
    setDesc(settings.description ?? '');
    setStatus(settings.status ?? '');
    setType(settings.campaignType ?? '');
    setGithubLink(settings.githubLink ?? '');
    setDriveLink(settings.driveLink ?? '');
    setContractDurationMonths(
      settings.contractDurationMonths != null ? String(settings.contractDurationMonths) : '',
    );
  }, [settings]);

  function validateOptionalFields() {
    const errors = validateProjectOptionalFields(githubLink, driveLink, contractDurationMonths, isAr);
    setOptionalFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!name.trim()) return;
    if (!validateOptionalFields()) return;

    setIsSaving(true);
    try {
      await campaignApi.updateProject(projectId, {
        name:         name.trim(),
        description:  desc.trim(),
        targetDomain: domain.trim() || null,
        campaignType: type,
        startDate:    startDate || undefined,
        githubLink:   optionalLink(githubLink),
        driveLink:    optionalLink(driveLink),
        contractDurationMonths: optionalContractDurationMonths(contractDurationMonths),
      });

      if (status && status !== settings?.status) {
        await campaignApi.updateProjectStatus(projectId, status);
      }

      toast.success(isAr ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      const apiFieldErrors = extractApiFieldErrors(err);
      if (Object.keys(apiFieldErrors).length > 0) {
        setOptionalFieldErrors((prev) => ({ ...prev, ...apiFieldErrors }));
      } else {
        toast.error(isAr ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
      }
    } finally {
      setIsSaving(false);
    }
  }

  const statusOptions: SelectOption[] = settings?.statusOptions ?? [];
  const typeOptions:   SelectOption[] = settings?.campaignTypeOptions ?? [];
  const hasOptionalErrors = Object.keys(optionalFieldErrors).length > 0;

  return {
    isLoading,
    settings,
    name, setName,
    startDate, setStartDate,
    domain, setDomain,
    desc, setDesc,
    status, setStatus,
    type, setType,
    githubLink, setGithubLink: (v: string) => {
      setGithubLink(v);
      if (optionalFieldErrors.githubLink) validateOptionalFields();
    },
    driveLink, setDriveLink: (v: string) => {
      setDriveLink(v);
      if (optionalFieldErrors.driveLink) validateOptionalFields();
    },
    contractDurationMonths,
    setContractDurationMonths: (v: string) => {
      setContractDurationMonths(v);
      if (optionalFieldErrors.contractDurationMonths) validateOptionalFields();
    },
    optionalFieldErrors,
    statusOptions,
    typeOptions,
    isSaving,
    saved,
    handleSave,
    canSave: !!name.trim() && !isSaving && !hasOptionalErrors,
  };
}
