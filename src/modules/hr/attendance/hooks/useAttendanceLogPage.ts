import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, getSortedRowModel, type SortingState } from '@tanstack/react-table';
import { useLang } from '@/app/providers/LanguageProvider';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { useEmployeeList } from '@/modules/hr/employees/hooks/useEmployeeList';
import { getAttendanceLogColumns } from '../components/attendanceLogColumns';
import { fetchAttendanceLog } from '../utils/fetchAttendanceLog';
import { exportAttendanceExcel } from '../utils/exportAttendanceExcel';

const PER_PAGE = 15;

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function defaultDateRange() {
  const now = new Date();
  return {
    dateFrom: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    dateTo:   toIsoDate(now),
  };
}

export function useAttendanceLogPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const defaults = defaultDateRange();

  const [sorting,    setSorting]    = useState<SortingState>([{ id: 'date', desc: true }]);
  const [selectedId, setSelectedId] = useState('');
  const [dateFrom,   setDateFrom]   = useState(defaults.dateFrom);
  const [dateTo,     setDateTo]     = useState(defaults.dateTo);
  const [page,       setPage]       = useState(1);

  const { data: empList = [], isLoading: empsLoading } = useEmployeeList();

  const empItems: ComboboxItem[] = useMemo(() => [
    { id: '', label: isAr ? 'كل الموظفين' : 'All employees' },
    ...empList.map((e) => ({ id: e.id, label: e.name })),
  ], [empList, isAr]);

  const rangeValid = Boolean(dateFrom && dateTo && dateFrom <= dateTo);

  const { data: allRows = [], isFetching } = useQuery({
    queryKey: ['attendance', 'log', selectedId || 'all', dateFrom, dateTo, empList.length],
    queryFn:  () => fetchAttendanceLog(empList, dateFrom, dateTo, selectedId || undefined),
    enabled:  rangeValid && empList.length > 0,
  });

  const total    = allRows.length;
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, lastPage);
  const records  = allRows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const firstRow = total === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
  const lastRow  = Math.min(safePage * PER_PAGE, total);

  const columns = useMemo(() => getAttendanceLogColumns(isAr), [isAr]);

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

  function handleExport() {
    if (allRows.length === 0) return;
    exportAttendanceExcel(allRows, dateFrom, dateTo, isAr);
  }

  return {
    isAr,
    selectedId, setSelectedId,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    page: safePage, setPage,
    empItems,
    records,
    isFetching: isFetching || empsLoading,
    rangeValid,
    total, lastPage, firstRow, lastRow,
    table,
    handleExport,
    canExport: allRows.length > 0 && !isFetching,
  };
}
