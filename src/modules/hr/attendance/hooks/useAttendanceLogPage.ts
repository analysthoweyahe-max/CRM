import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, getSortedRowModel, type SortingState } from '@tanstack/react-table';
import { useLang } from '@/app/providers/LanguageProvider';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import { useEmployeeAttendanceHistory } from './useEmployeeAttendanceHistory';
import { getAttendanceColumns } from '../components/attendanceColumns';

const PER_PAGE = 15;

function buildMonthItems(isAr: boolean): ComboboxItem[] {
  const items: ComboboxItem[] = [{ id: '', label: isAr ? 'كل الشهور' : 'All months' }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    items.push({
      id:    val,
      label: d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' }),
    });
  }
  return items;
}

export function useAttendanceLogPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [sorting,    setSorting]    = useState<SortingState>([{ id: 'date', desc: true }]);
  const [selectedId, setSelectedId] = useState('');
  const [month,      setMonth]      = useState('');
  const [page,       setPage]       = useState(1);

  const { data: empList } = useQuery({
    queryKey: ['employees', 'list-all'],
    queryFn:  () => employeeApi.list({ per_page: 100 }).then((r) => r.data.data.data),
  });

  const empItems: ComboboxItem[] = useMemo(() => [
    { id: '', label: isAr ? 'اختر موظفاً...' : 'Select employee...' },
    ...(empList ?? []).map((e) => ({ id: e.id, label: e.name })),
  ], [empList, isAr]);

  const monthItems = useMemo(() => buildMonthItems(isAr), [isAr]);

  const selectedEmp = useMemo(
    () => (empList ?? []).find((e) => e.id === selectedId),
    [empList, selectedId],
  );

  const { data: histPage, isFetching } = useEmployeeAttendanceHistory(
    selectedId || undefined,
    { month: month || undefined, per_page: PER_PAGE, page },
  );

  const records  = histPage?.data      ?? [];
  const lastPage = histPage?.last_page ?? 1;
  const total    = histPage?.total     ?? 0;
  const firstRow = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const lastRow  = Math.min(page * PER_PAGE, total);

  const columns = useMemo(() => getAttendanceColumns(isAr), [isAr]);

  const table = useReactTable({
    data:              records,
    columns,
    state:             { sorting },
    onSortingChange:   setSorting,
    getCoreRowModel:   getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination:  true,
    pageCount:         lastPage,
  });

  return {
    isAr, selectedId, setSelectedId,
    month, setMonth, page, setPage,
    empItems, monthItems, selectedEmp,
    records, isFetching,
    total, lastPage, firstRow, lastRow,
    table,
  };
}
