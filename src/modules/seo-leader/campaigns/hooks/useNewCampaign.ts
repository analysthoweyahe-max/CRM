import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seoProjectStatusApi } from '@/modules/admin/seo-project-statuses/api/seoProjectStatus.api';
import { campaignApi } from '../api/campaign.api';
import { ROUTES } from '@/app/router/routes';
import { useLang } from '@/app/providers/LanguageProvider';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { extractApiError, extractApiFieldErrors } from '@/shared/utils/error.utils';
import {
  optionalLink,
  optionalContractDurationMonths,
  validateProjectOptionalFields,
} from '@/shared/utils/projectOptionalFields.utils';
import type { ProjectOptionalFieldErrors } from '@/shared/utils/projectOptionalFields.utils';
import type { ComboboxItem } from '@/shared/components/form/Combobox';

function toItems(values: unknown[], isAr: boolean): ComboboxItem[] {
  return values.map(v => {
    if (typeof v === 'string') {
      return { id: v, label: translateProjectLookup(v, v, isAr) };
    }
    const obj      = v as Record<string, unknown>;
    const id       = String(obj.id ?? obj.value ?? obj.name ?? '');
    const enLabel  = String(obj.label ?? obj.name ?? obj.value ?? '');
    const labelAr  = obj.label_ar ?? obj.labelAr;
    return {
      id,
      label: translateProjectLookup(id, enLabel, isAr, labelAr != null ? String(labelAr) : undefined),
    };
  });
}

export function useNewCampaign() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const { lang }     = useLang();
  const isAr         = lang === 'ar';

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [description, setDesc] = useState('');
  const [campaignType, setType] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [links, setLinks] = useState<string[]>(['']);
  const [githubLink, setGithubLink] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [contractDurationMonths, setContractDurationMonths] = useState('');
  const [optionalFieldErrors, setOptionalFieldErrors] = useState<ProjectOptionalFieldErrors>({});
  const [saved, setSaved] = useState(false);
  const [savedAsDraft, setSavedAsDraft] = useState(false);

  const typesQ = useQuery({
    queryKey: ['seo', 'lookups', 'campaign-types'],
    queryFn:  () => campaignApi.getCampaignTypes().then(r => r.data.data),
    staleTime: 10 * 60 * 1000,
  });

  const statusesQ = useQuery({
    queryKey: ['seo', 'project-statuses'],
    queryFn:  () => seoProjectStatusApi.listActive(),
    staleTime: 10 * 60 * 1000,
  });

  const campaignTypeItems = toItems(typesQ.data ?? [], isAr);
  const statusItems       = toItems(
    (statusesQ.data ?? []).map(s => ({ value: s.value, label: s.label, label_ar: s.labelAr })),
    isAr,
  );

  useEffect(() => {
    if (!status && statusItems.length > 0) setStatus(statusItems[0].id);
  }, [statusItems, status]);

  const addKeyword    = () => setKeywords(p => [...p, '']);
  const updateKeyword = (i: number, v: string) => setKeywords(p => p.map((k, idx) => idx === i ? v : k));
  const removeKeyword = (i: number) => setKeywords(p => p.filter((_, idx) => idx !== i));

  const addLink    = () => setLinks(p => [...p, '']);
  const updateLink = (i: number, v: string) => setLinks(p => p.map((l, idx) => idx === i ? v : l));
  const removeLink = (i: number) => setLinks(p => p.filter((_, idx) => idx !== i));

  function validateOptionalFields() {
    const errors = validateProjectOptionalFields(githubLink, driveLink, contractDurationMonths, isAr);
    setOptionalFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const mutation = useMutation({
    mutationFn: (asDraft: boolean) => campaignApi.create({
      name:          name.trim(),
      domain:        domain.trim(),
      description:   description.trim(),
      campaign_type: campaignType,
      status:        asDraft ? 'draft' : status,
      is_draft:      asDraft,
      start_date:    startDate,
      end_date:      endDate,
      keywords:      keywords.filter(Boolean),
      references:    links.filter(Boolean),
      githubLink:    optionalLink(githubLink),
      driveLink:     optionalLink(driveLink),
      contractDurationMonths: optionalContractDurationMonths(contractDurationMonths),
    }),
    onSuccess: (_data, asDraft) => {
      queryClient.invalidateQueries({ queryKey: ['seo-leader', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['seo-leader', 'dashboard'] });
      setSavedAsDraft(asDraft);
      setSaved(true);
      setTimeout(() => navigate(ROUTES.SEO_LEADER.DASHBOARD), 1500);
    },
    onError: (err) => {
      const apiFieldErrors = extractApiFieldErrors(err);
      if (Object.keys(apiFieldErrors).length > 0) {
        setOptionalFieldErrors((prev) => ({ ...prev, ...apiFieldErrors }));
      } else {
        const fallback = isAr ? 'حدث خطأ أثناء إنشاء المشروع' : 'Failed to create the project';
        const message  = extractApiError(err);
        toast.error(message && message !== 'An unexpected error occurred.' ? message : fallback);
      }
    },
  });

  function handleSave(asDraft = false) {
    if (!validateOptionalFields()) return;
    mutation.mutate(asDraft);
  }

  const hasOptionalErrors = Object.keys(optionalFieldErrors).length > 0;
  const isValid = !!name.trim() && !!domain.trim() && !!campaignType && !!status && !!startDate && !!endDate && !hasOptionalErrors;

  return {
    name, domain, description, campaignType, status, startDate, endDate,
    keywords, links, githubLink, driveLink, contractDurationMonths, optionalFieldErrors,
    setName, setDomain, setDesc, setType, setStatus, setStartDate, setEndDate,
    setGithubLink: (v: string) => {
      setGithubLink(v);
      if (optionalFieldErrors.githubLink) validateOptionalFields();
    },
    setDriveLink: (v: string) => {
      setDriveLink(v);
      if (optionalFieldErrors.driveLink) validateOptionalFields();
    },
    setContractDurationMonths: (v: string) => {
      setContractDurationMonths(v);
      if (optionalFieldErrors.contractDurationMonths) validateOptionalFields();
    },
    addKeyword, updateKeyword, removeKeyword,
    addLink, updateLink, removeLink,
    campaignTypeItems,
    statusItems,
    lookupsLoading: typesQ.isLoading || statusesQ.isLoading,
    saved,
    savedAsDraft,
    isValid,
    isSaving: mutation.isPending,
    handleSave,
  };
}
