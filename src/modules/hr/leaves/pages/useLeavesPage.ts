import { useState } from 'react';
import { useLeaveList } from '../hooks/useLeaves';
import type { FilterTab, UseLeavesPageReturn } from '../types/leaves.types';

const PAGE_SIZE = 15;

export function useLeavesPage(): UseLeavesPageReturn {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(1);

  const { data: countPage } = useLeaveList({ per_page: 1 });
  const counts = countPage?.counts ?? { all: 0, pending: 0, approved: 0, rejected: 0 };

  const { data: tablePage, isLoading } = useLeaveList({
    status:   activeFilter === 'all' ? undefined : activeFilter,
    search:   search || undefined,
    per_page: PAGE_SIZE,
    page,
    with:     'employee',
  });

  const rows     = tablePage?.data      ?? [];
  const total    = tablePage?.total     ?? 0;
  const lastPage = tablePage?.last_page ?? 1;
  const firstRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRow  = Math.min(page * PAGE_SIZE, total);

  function handleFilterChange(tab: FilterTab) {
    setActiveFilter(tab);
    setPage(1);
  }

  function handleSearchChange(v: string) {
    setSearch(v);
    setPage(1);
  }

  return {
    isLoading,
    activeFilter,
    search,
    page,
    setPage,
    counts,
    rows,
    total,
    lastPage,
    firstRow,
    lastRow,
    handleFilterChange,
    handleSearchChange,
  };
}
