import { useState, useEffect, useMemo } from 'react';
import { toast }               from 'sonner';
import { getAvatarColor, matchesSearch } from '@/shared/utils';
import { downloadTeamExcel }   from '@/shared/modules/team/utils/exportTeam';
import { pmTeamApi }           from '../api/team.api';
import type { PmTeamMemberApi } from '../types/team.types';

const PAGE_SIZE       = 12;
const FETCH_PAGE_SIZE = 100;

export type { PmTeamMemberApi };

// Backend `search` matching isn't reliable for Arabic name variants (e.g. "احمد" vs "أحمد"),
// so the full roster is fetched once and searched client-side with normalization instead.
export async function fetchAllMembers(): Promise<PmTeamMemberApi[]> {
  const first = await pmTeamApi.list({ per_page: FETCH_PAGE_SIZE, page: 1 });
  const { data: firstBatch, last_page } = first.data.data;
  if (last_page <= 1) return firstBatch;

  const restPages = Array.from({ length: last_page - 1 }, (_, i) => i + 2);
  const rest = await Promise.all(
    restPages.map(page => pmTeamApi.list({ per_page: FETCH_PAGE_SIZE, page }).then(r => r.data.data.data))
  );
  return [firstBatch, ...rest].flat();
}

export function useProjectTeamPage(isAr = true) {
  const [allMembers,    setAllMembers]    = useState<PmTeamMemberApi[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [page,          setPage]          = useState(1);
  const [search,        setSearch]        = useState('');
  const [selected,      setSelected]      = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchAllMembers()
      .then(members => { if (!cancelled) setAllMembers(members); })
      .catch(() => { /* leave previous state on error */ })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return allMembers;
    return allMembers.filter(m => matchesSearch([m.name, m.email, m.jobTitle, m.department], search));
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

  function toggleActive(id: string) {
    const member   = allMembers.find(m => m.id === id);
    const newState = !(member?.isActive ?? true);
    setAllMembers(prev =>
      prev.map(m => m.id === id
        ? { ...m, isActive: newState, statusLabel: newState ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive') }
        : m)
    );
    toast[newState ? 'success' : 'warning'](
      newState
        ? (isAr ? `تم تفعيل ${member?.name}` : `${member?.name} activated`)
        : (isAr ? `تم تعطيل ${member?.name}` : `${member?.name} deactivated`)
    );
  }

  function getColor(member: PmTeamMemberApi) {
    return getAvatarColor(member.id);
  }

  function exportSelected() {
    const toExport = allMembers.filter(m => selected.has(m.id));
    if (toExport.length === 0) return;

    const headers = isAr
      ? ['الاسم', 'البريد الإلكتروني', 'المسمى الوظيفي', 'القسم', 'المشاريع النشطة', 'الحالة']
      : ['Name', 'Email', 'Job Title', 'Department', 'Active Projects', 'Status'];

    const rows = toExport.map(m => [
      m.name,
      m.email,
      m.jobTitle,
      m.department,
      m.activeProjectsCount,
      m.statusLabel,
    ]);

    downloadTeamExcel(headers, rows, 'pm-team.xls', isAr ? 'فريق العمل' : 'Team');
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
    isLoading,
    getColor,
  };
}
