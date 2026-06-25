import { useMemo, useState } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useQuery }  from '@tanstack/react-query';
import { useLang }   from '@/app/providers/LanguageProvider';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import { useBonusList, useBonusTypes } from './useBonuses';
import { getBonusColumns } from '../components/bonusColumns';

const PER_PAGE = 10;

export function useBonusesPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [search,     setSearch] = useState('');
  const [typeFilter, setType]   = useState('');
  const [deptFilter, setDept]   = useState('');
  const [page,       setPage]   = useState(1);

  const { data: listData, isLoading } = useBonusList({
    search:          search     || undefined,
    adjustment_type: typeFilter || undefined,
    department_id:   deptFilter || undefined,
    per_page: PER_PAGE,
    page,
  });

  const { data: typesRaw } = useBonusTypes();

  const { data: deptsRaw } = useQuery({
    queryKey:  ['employees', 'lookups', 'departments'],
    queryFn:   () => employeeApi.lookupDepartments().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const typeItems = useMemo(() => [
    { id: '', label: isAr ? 'كل الأنواع' : 'All Types' },
    ...(typesRaw ?? []).map((t) => ({ id: t.key, label: isAr ? (t.label_ar ?? t.label) : t.label })),
  ], [typesRaw, isAr]);

  const deptItems = useMemo(() => [
    { id: '', label: isAr ? 'كل الأقسام' : 'All Departments' },
    ...(deptsRaw ?? []).map((d) => ({ id: String(d.id), label: isAr ? (d.nameAr ?? d.name) : d.name })),
  ], [deptsRaw, isAr]);

  const rows    = listData?.data    ?? [];
  const last    = listData?.last_page ?? 1;
  const total   = listData?.total   ?? 0;
  const summary = listData?.summary;

  const columns = useMemo(() => getBonusColumns(isAr), [isAr]);

  const table = useReactTable({
    data:             rows,
    columns,
    manualPagination: true,
    pageCount:        last,
    getCoreRowModel:  getCoreRowModel(),
  });

  const firstRow = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const lastRow  = Math.min(page * PER_PAGE, total);

  return {
    isAr,
    isLoading,
    table,
    summary,
    serverPagination: {
      page, lastPage: last, total, firstRow, lastRow,
      onPrev: () => setPage((p) => Math.max(1, p - 1)),
      onNext: () => setPage((p) => Math.min(last, p + 1)),
      onPage: (i: number) => setPage(i),
    },
    search: {
      value:       search,
      placeholder: isAr ? 'ابحث باسم الموظف...' : 'Search employee...',
      onChange:    (v: string) => { setSearch(v); setPage(1); },
    },
    filters: [
      {
        key: 'dept', value: deptFilter, items: deptItems,
        onChange: (v: string) => { setDept(v); setPage(1); },
        searchPlaceholder: isAr ? 'ابحث عن القسم...' : 'Search department...',
        noResultsText:     isAr ? 'لا نتائج' : 'No results',
      },
      {
        key: 'type', value: typeFilter, items: typeItems,
        onChange: (v: string) => { setType(v); setPage(1); },
        searchPlaceholder: isAr ? 'ابحث عن النوع...' : 'Search type...',
        noResultsText:     isAr ? 'لا نتائج' : 'No results',
      },
    ],
  };
}
