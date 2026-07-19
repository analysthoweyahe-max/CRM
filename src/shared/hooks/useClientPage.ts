import { useEffect, useMemo, useState } from 'react';

/** Client-side pagination over an already-filtered in-memory list. */
export function useClientPage<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const safePage = Math.min(page, pageCount);

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  const total = items.length;
  const firstRow = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastRow  = Math.min(safePage * pageSize, total);

  return {
    page: safePage,
    pageCount,
    pageItems,
    total,
    firstRow,
    lastRow,
    canPrev: safePage > 1,
    canNext: safePage < pageCount,
    setPage,
    resetPage: () => setPage(1),
  };
}
