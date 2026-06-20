import { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { PageHeader }      from '@/shared/components/ui/PageHeader';
import { Card }            from '@/shared/components/ui/Card';
import { FilterBar }       from '@/shared/components/tables/FilterBar';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { AttendanceStats }   from '@/features/attendance/components/AttendanceStats';
import { AttendanceSkeleton } from '@/features/attendance/components/AttendanceSkeleton';
import { getAttendanceColumns } from '@/features/attendance/components/AttendanceTable';
import type { AttendanceRecord } from '@/features/attendance/types/attendance.types';

/* ── Mock data ─────────────────────────────────────────────────────── */
const RECORDS: AttendanceRecord[] = [
  { id: '1',  employeeId: 'EMP-1000', name: 'حسن الخطيب',  initial: 'ح', avatarColor: 'bg-red-400',    department: 'تقنية المعلومات',  checkIn: null,     checkOut: null,     workedHours: null, dayStatus: 'absent',  workStatus: 'not_started' },
  { id: '2',  employeeId: 'EMP-1001', name: 'مصطفى حسن',  initial: 'م', avatarColor: 'bg-purple-500', department: 'المبيعات',         checkIn: '08:54 ص', checkOut: null,    workedHours: 4.6,  dayStatus: 'present', workStatus: 'working'     },
  { id: '3',  employeeId: 'EMP-1002', name: 'سارة سعيد',   initial: 'س', avatarColor: 'bg-blue-400',   department: 'العمليات',         checkIn: '08:38 ص', checkOut: null,    workedHours: 4.9,  dayStatus: 'present', workStatus: 'working'     },
  { id: '4',  employeeId: 'EMP-1003', name: 'رنا منصور',   initial: 'ر', avatarColor: 'bg-teal-500',   department: 'الموارد البشرية',  checkIn: '08:50 ص', checkOut: '05:22 م', workedHours: 8.5, dayStatus: 'present', workStatus: 'done'        },
  { id: '5',  employeeId: 'EMP-1004', name: 'كريم حسن',    initial: 'ك', avatarColor: 'bg-green-500',  department: 'التصميم',          checkIn: '08:16 ص', checkOut: null,    workedHours: 5.2,  dayStatus: 'present', workStatus: 'working'     },
  { id: '6',  employeeId: 'EMP-1007', name: 'حسن الخطيب',  initial: 'ح', avatarColor: 'bg-red-400',    department: 'الموارد البشرية',  checkIn: '09:36 ص', checkOut: null,    workedHours: 3.9,  dayStatus: 'late',    workStatus: 'working'     },
  { id: '7',  employeeId: 'EMP-1008', name: 'سلمى رشدي',   initial: 'س', avatarColor: 'bg-green-500',  department: 'المبيعات',         checkIn: '09:39 ص', checkOut: '05:22 م', workedHours: 7.7, dayStatus: 'present', workStatus: 'done'        },
  { id: '8',  employeeId: 'EMP-1010', name: 'آية منصور',   initial: 'آ', avatarColor: 'bg-indigo-500', department: 'تقنية المعلومات',  checkIn: null,     checkOut: null,     workedHours: null, dayStatus: 'leave',   workStatus: 'not_started' },
  { id: '9',  employeeId: 'EMP-1005', name: 'نور أحمد',    initial: 'ن', avatarColor: 'bg-green-600',  department: 'الموارد البشرية',  checkIn: null,     checkOut: null,     workedHours: null, dayStatus: 'absent',  workStatus: 'not_started' },
  { id: '10', employeeId: 'EMP-1006', name: 'أحمد محمد',   initial: 'أ', avatarColor: 'bg-orange-500', department: 'المبيعات',         checkIn: null,     checkOut: null,     workedHours: null, dayStatus: 'absent',  workStatus: 'not_started' },
  { id: '11', employeeId: 'EMP-1009', name: 'مريم سعيد',   initial: 'م', avatarColor: 'bg-pink-500',   department: 'خدمة العملاء',    checkIn: null,     checkOut: null,     workedHours: null, dayStatus: 'leave',   workStatus: 'not_started' },
  { id: '12', employeeId: 'EMP-1011', name: 'فاطمة علي',   initial: 'ف', avatarColor: 'bg-rose-500',   department: 'المحاسبة',         checkIn: '08:45 ص', checkOut: null,    workedHours: 4.7,  dayStatus: 'present', workStatus: 'working'     },
  { id: '13', employeeId: 'EMP-1012', name: 'خالد العمري', initial: 'خ', avatarColor: 'bg-yellow-500', department: 'تقنية المعلومات',  checkIn: '09:48 ص', checkOut: null,    workedHours: 3.5,  dayStatus: 'late',    workStatus: 'working'     },
  { id: '14', employeeId: 'EMP-1013', name: 'رنا صبري',    initial: 'ر', avatarColor: 'bg-orange-400', department: 'المبيعات',         checkIn: '08:30 ص', checkOut: '05:22 م', workedHours: 8.9, dayStatus: 'present', workStatus: 'done'        },
  { id: '15', employeeId: 'EMP-1014', name: 'منى إبراهيم', initial: 'م', avatarColor: 'bg-cyan-500',   department: 'التصميم',          checkIn: '08:55 ص', checkOut: null,    workedHours: 4.4,  dayStatus: 'present', workStatus: 'working'     },
  { id: '16', employeeId: 'EMP-1015', name: 'سامي الجمل',  initial: 'س', avatarColor: 'bg-lime-600',   department: 'العمليات',         checkIn: '08:10 ص', checkOut: null,    workedHours: 5.6,  dayStatus: 'present', workStatus: 'working'     },
  { id: '17', employeeId: 'EMP-1016', name: 'هدى فوزي',    initial: 'ه', avatarColor: 'bg-violet-500', department: 'خدمة العملاء',    checkIn: '08:42 ص', checkOut: '05:22 م', workedHours: 8.7, dayStatus: 'present', workStatus: 'done'        },
  { id: '18', employeeId: 'EMP-1017', name: 'طارق سالم',   initial: 'ط', avatarColor: 'bg-sky-500',    department: 'المحاسبة',         checkIn: '09:55 ص', checkOut: null,    workedHours: 3.4,  dayStatus: 'late',    workStatus: 'working'     },
  { id: '19', employeeId: 'EMP-1019', name: 'علاء حسين',   initial: 'ع', avatarColor: 'bg-teal-600',   department: 'الموارد البشرية',  checkIn: '08:05 ص', checkOut: null,    workedHours: 5.4,  dayStatus: 'present', workStatus: 'working'     },
];

const DEPARTMENTS = ['كل الأقسام', ...Array.from(new Set(RECORDS.map((r) => r.department)))];
const STATUSES    = ['كل الحالات', 'حاضر', 'متأخر', 'غائب', 'إجازة'];

const STATUS_MAP: Record<string, string> = { 'حاضر': 'present', 'متأخر': 'late', 'غائب': 'absent', 'إجازة': 'leave' };

/* ── Component ─────────────────────────────────────────────────────── */
export function AttendancePage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const [isLoading,  setIsLoading]  = useState(true);
  const [sorting,    setSorting]    = useState<SortingState>([]);
  const [search,     setSearch]     = useState('');
  const [deptFilter, setDeptFilter] = useState('كل الأقسام');
  const [statFilter, setStatFilter] = useState('كل الحالات');

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => RECORDS.filter((r) => {
    const q   = search.trim();
    const matchSearch = !q || r.name.includes(q) || r.employeeId.includes(q);
    const matchDept   = deptFilter === 'كل الأقسام' || r.department === deptFilter;
    const matchStatus = statFilter === 'كل الحالات' || r.dayStatus === STATUS_MAP[statFilter];
    return matchSearch && matchDept && matchStatus;
  }), [search, deptFilter, statFilter]);

  const columns = useMemo(() => getAttendanceColumns(isAr), [isAr]);

  const table = useReactTable({
    data:                  filtered,
    columns,
    state:                 { sorting },
    onSortingChange:       setSorting,
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState:          { pagination: { pageSize: 8 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = filtered.length;
  const firstRow  = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow   = Math.min((pageIndex + 1) * pageSize, totalRows);

  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  if (isLoading) return <AttendanceSkeleton />;

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'الحضور اليومي' : 'Daily Attendance'}
        subtitle={isAr
          ? `متابعة حضور موظفينا لحظياً — اليوم ${today}`
          : `Live attendance tracking — ${today}`}
      />

      <AttendanceStats records={RECORDS} isAr={isAr} />

      <Card overflow>
        <FilterBar
          search={{
            value:       search,
            placeholder: isAr ? 'ابحث باسم الموظف أو المعرف...' : 'Search employee...',
            onChange:    (v) => { setSearch(v); table.setPageIndex(0); },
          }}
          filters={[
            { key: 'dept',   value: deptFilter, options: DEPARTMENTS, onChange: (v) => { setDeptFilter(v); table.setPageIndex(0); } },
            { key: 'status', value: statFilter, options: STATUSES,    onChange: (v) => { setStatFilter(v); table.setPageIndex(0); } },
          ]}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id}
                      className="px-5 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {h.isPlaceholder ? null : (
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className={`inline-flex items-center gap-1.5 ${
                            h.column.getCanSort()
                              ? 'cursor-pointer select-none hover:text-gray-800 dark:hover:text-gray-200'
                              : 'cursor-default'
                          }`}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {h.column.getCanSort() && (
                            h.column.getIsSorted() === 'asc'  ? <ChevronUp     size={13} className="text-brand-500" /> :
                            h.column.getIsSorted() === 'desc' ? <ChevronDown   size={13} className="text-brand-500" /> :
                            <ChevronsUpDown size={13} className="text-gray-300 dark:text-gray-600" />
                          )}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}
                    className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                    {isAr ? 'لا توجد نتائج' : 'No results found'}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3.5 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          pageIndex={pageIndex}
          pageCount={table.getPageCount()}
          totalRows={totalRows}
          firstRow={firstRow}
          lastRow={lastRow}
          canPrev={table.getCanPreviousPage()}
          canNext={table.getCanNextPage()}
          onPrev={() => table.previousPage()}
          onNext={() => table.nextPage()}
          onPage={(i) => table.setPageIndex(i)}
          isAr={isAr}
        />
      </Card>

    </div>
  );
}
