import { useState, useEffect, useMemo } from 'react';
import { toast }             from 'sonner';
import { seoTeamApi }                    from '../api/seoTeam.api';
import { getAvatarColor, matchesSearch } from '@/shared/utils';
import { downloadTeamExcel }             from '@/shared/modules/team/utils/exportTeam';
import type { SeoTeamApiMember, SeoTeamInvitePayload } from '../types/seoTeam.types';

const PAGE_SIZE       = 4;
const FETCH_PAGE_SIZE = 100;

export type { SeoTeamApiMember };

// Backend `search` matching isn't reliable for Arabic name variants (e.g. "احمد" vs "أحمد"),
// so the full roster is fetched once and searched client-side with normalization instead.
async function fetchAllMembers(): Promise<SeoTeamApiMember[]> {
  const first = await seoTeamApi.getTeam({ per_page: FETCH_PAGE_SIZE, page: 1 });
  const { data: firstBatch, last_page } = first.data.data;
  if (last_page <= 1) return firstBatch;

  const restPages = Array.from({ length: last_page - 1 }, (_, i) => i + 2);
  const rest = await Promise.all(
    restPages.map(page => seoTeamApi.getTeam({ per_page: FETCH_PAGE_SIZE, page }).then(r => r.data.data.data))
  );
  return [firstBatch, ...rest].flat();
}

export function useSeoTeamPage(isAr = true) {
  const [allMembers,    setAllMembers]    = useState<SeoTeamApiMember[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [page,          setPage]          = useState(1);
  const [search,        setSearch]        = useState('');
  const [refreshTick,   setRefreshTick]   = useState(0);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [profileMember, setProfileMember] = useState<SeoTeamApiMember | null>(null);
  const [showInvite,    setShowInvite]    = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchAllMembers()
      .then(members => { if (!cancelled) setAllMembers(members); })
      .catch(() => { /* leave previous state on error */ })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [refreshTick]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allMembers;
    return allMembers.filter(m => matchesSearch(
      [m.name, m.email, m.phone, m.jobTitle?.name, m.team?.name, m.team?.nameAr],
      search,
    ));
  }, [allMembers, search]);

  const total     = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const members   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
    setSelected(new Set());
  }

  const isAllSelected = members.length > 0 && members.every(m => selected.has(m.id));

  function toggleAll() {
    setSelected(prev => {
      const next = new Set(prev);
      if (isAllSelected) members.forEach(m => next.delete(m.id));
      else               members.forEach(m => next.add(m.id));
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openProfile(id: string) {
    const m = allMembers.find(m => m.id === id);
    if (m) setProfileMember(m);
  }

  function toggleActive(id: string) {
    const member   = allMembers.find(m => m.id === id);
    const newState = !(member?.isActive ?? true);
    setAllMembers(prev =>
      prev.map(m => m.id === id ? { ...m, isActive: newState, statusLabel: newState ? 'نشط' : 'غير نشط' } : m)
    );
    toast[newState ? 'success' : 'warning'](
      newState ? `تم تفعيل ${member?.name}` : `تم تعطيل ${member?.name}`
    );
  }

  function getColor(member: SeoTeamApiMember) {
    return getAvatarColor(member.id);
  }

  function exportSelected() {
    const toExport = allMembers.filter(m => selected.has(m.id));
    if (toExport.length === 0) return;

    const headers = isAr
      ? ['الاسم', 'البريد الإلكتروني', 'الهاتف', 'المسمى الوظيفي', 'المشاريع النشطة', 'الحالة']
      : ['Name', 'Email', 'Phone', 'Job Title', 'Active Projects', 'Status'];

    const rows = toExport.map(m => [
      m.name,
      m.email,
      m.phone ?? '',
      m.jobTitle?.name ?? '',
      m.activeProjectsCount,
      m.statusLabel,
    ]);

    downloadTeamExcel(headers, rows, 'seo-team.xls', isAr ? 'فريق SEO' : 'SEO Team');
  }

  async function handleInvite(payload: SeoTeamInvitePayload) {
    try {
      await seoTeamApi.invite(payload);
      toast.success(isAr ? 'تم إرسال الدعوة بنجاح' : 'Invitation sent successfully');
      setRefreshTick(t => t + 1);
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response?.data;
      const firstFieldError = res?.errors ? Object.values(res.errors)[0]?.[0] : null;
      const msg = firstFieldError ?? res?.message ?? (isAr ? 'فشل إرسال الدعوة' : 'Failed to send invitation');
      throw new Error(msg);
    }
  }

  return {
    members,
    total,
    page,
    setPage,
    pageCount,
    selected,
    selectedCount: selected.size,
    isAllSelected,
    search,
    handleSearch,
    toggleAll,
    toggleOne,
    clearSelection: () => setSelected(new Set()),
    toggleActive,
    exportSelected,
    showInvite,
    openInvite:  () => setShowInvite(true),
    closeInvite: () => setShowInvite(false),
    handleInvite,
    profileMember,
    openProfile,
    closeProfile: () => setProfileMember(null),
    isLoading,
    getColor,
  };
}
