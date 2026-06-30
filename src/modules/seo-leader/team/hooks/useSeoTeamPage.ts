import { useState, useEffect, useRef } from 'react';
import { toast }                         from 'sonner';
import { seoTeamApi }                    from '../api/seoTeam.api';
import { downloadTeamExcel }             from '@/shared/modules/team/utils/exportTeam';
import type { SeoTeamApiMember, SeoTeamInvitePayload } from '../types/seoTeam.types';

const PER_PAGE = 4;
const DEBOUNCE = 300;

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-sky-500',   'bg-violet-500', 'bg-amber-500',
  'bg-rose-500',    'bg-teal-500',  'bg-indigo-500', 'bg-orange-500',
];

function avatarColor(name: string) {
  const hash = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export type { SeoTeamApiMember };

export function useSeoTeamPage(isAr = true) {
  const [members,       setMembers]       = useState<SeoTeamApiMember[]>([]);
  const [total,         setTotal]         = useState(0);
  const [lastPage,      setLastPage]      = useState(1);
  const [isLoading,     setIsLoading]     = useState(true);
  const [page,          setPage]          = useState(1);
  const [search,        setSearch]        = useState('');
  const [refreshTick,   setRefreshTick]   = useState(0);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [profileMember, setProfileMember] = useState<SeoTeamApiMember | null>(null);
  const [showInvite,    setShowInvite]    = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res   = await seoTeamApi.getTeam({ search: search || undefined, per_page: PER_PAGE, page });
        const paged = res.data.data;
        if (!cancelled) {
          setMembers(paged.data);
          setTotal(paged.total);
          setLastPage(paged.last_page);
        }
      } catch {
        /* leave previous state on error */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, DEBOUNCE);

    return () => { cancelled = true; };
  }, [page, search, refreshTick]);

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
    const m = members.find(m => m.id === id);
    if (m) setProfileMember(m);
  }

  function toggleActive(id: string) {
    const member   = members.find(m => m.id === id);
    const newState = !(member?.isActive ?? true);
    setMembers(prev =>
      prev.map(m => m.id === id ? { ...m, isActive: newState, statusLabel: newState ? 'نشط' : 'غير نشط' } : m)
    );
    toast[newState ? 'success' : 'warning'](
      newState ? `تم تفعيل ${member?.name}` : `تم تعطيل ${member?.name}`
    );
  }

  function getColor(member: SeoTeamApiMember) {
    return avatarColor(member.name);
  }

  function exportSelected() {
    const toExport = members.filter(m => selected.has(m.id));
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
    pageCount: lastPage,
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
