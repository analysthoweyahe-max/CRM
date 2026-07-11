import { useMemo, useState } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/app/providers/LanguageProvider';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import {
  currentMonth,
  getMonthOptions,
} from '../utils/salaryMonth.utils';
import { useSalaryList } from './useSalaries';
import { getSalaryColumns } from '../components/salaryColumns';

const PER_PAGE = 15;

export function useSalarySheetPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [search,     setSearch] = useState('');
  const [month,      setMonth]  = useState(() => currentMonth());
  const [deptFilter, setDept]   = useState('');
  const [page,       setPage]   = useState(1);

  const { data: listData, isLoading, isFetching } = useSalaryList({
    financial_month: month || undefined,
    department_id:   deptFilter || undefined,
    search:          search.trim() || undefined,
    per_page:        PER_PAGE,
    page,
  });

  const { data: deptsRaw } = useQuery({
    queryKey:  ['employees', 'lookups', 'departments'],
    queryFn:   () => employeeApi.lookupDepartments().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const monthItems = useMemo(() => getMonthOptions(isAr), [isAr]);

  const deptItems = useMemo(() => [
    { id: '', label: isAr ? 'كل الأقسام' : 'All Departments' },
    ...(deptsRaw ?? []).map((d) => ({
      id:    String(d.id),
      label: isAr ? (d.nameAr ?? d.name) : d.name,
    })),
  ], [deptsRaw, isAr]);

  const rows    = listData?.data ?? [];
  const last    = listData?.last_page ?? 1;
  const total   = listData?.total ?? 0;
  const summary = listData?.summary;

  const columns = useMemo(() => getSalaryColumns(isAr), [isAr]);

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
    isFetching,
    table,
    summary,
    month,
    serverPagination: {
      page,
      lastPage: last,
      total,
      firstRow,
      lastRow,
      onPrev: () => setPage((p) => Math.max(1, p - 1)),
      onNext: () => setPage((p) => Math.min(last, p + 1)),
      onPage: (i: number) => setPage(i),
    },
    search: {
      value:       search,
      placeholder: isAr ? 'ابحث بالاسم أو الرقم الوظيفي...' : 'Search name or employee number...',
      onChange:    (v: string) => { setSearch(v); setPage(1); },
    },
    filters: [
      {
        key: 'month',
        value: month,
        items: monthItems,
        onChange: (v: string) => { setMonth(v || currentMonth()); setPage(1); },
        searchPlaceholder: isAr ? 'ابحث عن الشهر...' : 'Search month...',
        noResultsText:     isAr ? 'لا نتائج' : 'No results',
      },
      {
        key: 'dept',
        value: deptFilter,
        items: deptItems,
        onChange: (v: string) => { setDept(v); setPage(1); },
        searchPlaceholder: isAr ? 'ابحث عن القسم...' : 'Search department...',
        noResultsText:     isAr ? 'لا نتائج' : 'No results',
      },
    ],
  };
}
