import { useState }                    from 'react';
import { useNavigate }                  from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi }                  from '../api/campaign.api';
import { ROUTES }                       from '@/app/router/routes';
import type { ComboboxItem }            from '@/shared/components/form/Combobox';

function toItems(values: unknown[]): ComboboxItem[] {
  return values.map(v => {
    if (typeof v === 'string') return { id: v, label: v };
    const obj   = v as Record<string, unknown>;
    const label = String(obj.label ?? obj.name  ?? obj.value ?? '');
    const id    = String(obj.id    ?? obj.value ?? obj.name  ?? '');
    return { id, label };
  });
}

export function useNewCampaign() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();

  const [name,         setName]        = useState('');
  const [domain,       setDomain]      = useState('');
  const [description,  setDesc]        = useState('');
  const [campaignType, setType]        = useState('');
  const [status,       setStatus]      = useState('');
  const [startDate,    setStartDate]   = useState('');
  const [endDate,      setEndDate]     = useState('');
  const [keywords,     setKeywords]    = useState<string[]>(['']);
  const [links,        setLinks]       = useState<string[]>(['']);
  const [saved,        setSaved]       = useState(false);

  /* ── Lookups ─────────────────────────────────────────────────────── */
  const typesQ = useQuery({
    queryKey: ['seo', 'lookups', 'campaign-types'],
    queryFn:  () => campaignApi.getCampaignTypes().then(r => r.data.data),
    staleTime: 10 * 60 * 1000,
  });

  const statusesQ = useQuery({
    queryKey: ['seo', 'lookups', 'statuses'],
    queryFn:  () => campaignApi.getStatuses().then(r => r.data.data),
    staleTime: 10 * 60 * 1000,
  });

  /* ── Keywords helpers ────────────────────────────────────────────── */
  const addKeyword    = () => setKeywords(p => [...p, '']);
  const updateKeyword = (i: number, v: string) => setKeywords(p => p.map((k, idx) => idx === i ? v : k));
  const removeKeyword = (i: number) => setKeywords(p => p.filter((_, idx) => idx !== i));

  /* ── Links helpers ───────────────────────────────────────────────── */
  const addLink    = () => setLinks(p => [...p, '']);
  const updateLink = (i: number, v: string) => setLinks(p => p.map((l, idx) => idx === i ? v : l));
  const removeLink = (i: number) => setLinks(p => p.filter((_, idx) => idx !== i));

  /* ── Mutation ────────────────────────────────────────────────────── */
  const mutation = useMutation({
    mutationFn: () => campaignApi.create({
      name:          name.trim(),
      domain:        domain.trim(),
      description:   description.trim(),
      campaign_type: campaignType,
      status,
      start_date:    startDate,
      end_date:      endDate,
      keywords:      keywords.filter(Boolean),
      references:    links.filter(Boolean),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-leader', 'projects'] });
      setSaved(true);
      setTimeout(() => navigate(ROUTES.SEO_LEADER.DASHBOARD), 1500);
    },
  });

  function handleSave(asDraft = false) {
    if (asDraft) setStatus('draft');
    mutation.mutate();
  }

  const isValid = !!name.trim() && !!domain.trim() && !!campaignType && !!status && !!startDate && !!endDate;

  return {
    name, domain, description, campaignType, status, startDate, endDate, keywords, links,
    setName, setDomain, setDesc, setType, setStatus, setStartDate, setEndDate,
    addKeyword, updateKeyword, removeKeyword,
    addLink, updateLink, removeLink,
    campaignTypeItems: toItems(typesQ.data ?? []),
    statusItems:       toItems(statusesQ.data ?? []),
    lookupsLoading:    typesQ.isLoading || statusesQ.isLoading,
    saved,
    isValid,
    isSaving: mutation.isPending,
    handleSave,
  };
}
