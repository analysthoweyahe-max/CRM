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
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Search } from 'lucide-react';
import { useLang }         from '@/app/providers/LanguageProvider';
import { PageHeader }      from '@/shared/components/ui/PageHeader';
import { Card }            from '@/shared/components/ui/Card';
import { Button }          from '@/shared/components/ui/Button';
import { Combobox, type ComboboxItem } from '@/shared/components/form/Combobox';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { AttendanceLogSkeleton }  from '@/features/attendance/components/AttendanceLogSkeleton';
import { getAttendanceLogColumns, type AttendanceLogRecord } from '@/features/attendance/components/attendanceLogColumns';

/* ── Mock data ─────────────────────────────────────────────────────── */
const RECORDS: AttendanceLogRecord[] = [
  // June 15
  { id: '1',  date: '2026/06/15', employeeId: 'EMP-1000', name: 'حسن الخطيب',  initial: 'ح', avatarColor: 'bg-red-400',    department: 'تقنية المعلومات', checkIn: '08:57 ص', checkOut: '05:33 م', workedHours: 7.3, lateMinutes: null, overtimeHours: 2,    status: 'present' },
  { id: '2',  date: '2026/06/15', employeeId: 'EMP-1001', name: 'مصطفى حسن',  initial: 'م', avatarColor: 'bg-purple-500', department: 'المبيعات',        checkIn: '08:57 ص', checkOut: '05:09 م', workedHours: 8.1, lateMinutes: null, overtimeHours: null, status: 'present' },
  { id: '3',  date: '2026/06/15', employeeId: 'EMP-1002', name: 'سارة سعيد',   initial: 'س', avatarColor: 'bg-green-500',  department: 'العمليات',        checkIn: '08:53 ص', checkOut: '05:16 م', workedHours: 8.5, lateMinutes: null, overtimeHours: null, status: 'present' },
  { id: '4',  date: '2026/06/15', employeeId: 'EMP-1003', name: 'رنا منصور',   initial: 'ر', avatarColor: 'bg-teal-500',   department: 'الموارد البشرية', checkIn: '09:42 ص', checkOut: '05:23 م', workedHours: 7,   lateMinutes: 11,  overtimeHours: 1,    status: 'late'    },
  { id: '5',  date: '2026/06/15', employeeId: 'EMP-1004', name: 'كريم حسن',    initial: 'ك', avatarColor: 'bg-violet-500', department: 'التصميم',         checkIn: '08:55 ص', checkOut: '05:31 م', workedHours: 8.4, lateMinutes: null, overtimeHours: null, status: 'present' },
  { id: '6',  date: '2026/06/15', employeeId: 'EMP-1007', name: 'حسن الخطيب',  initial: 'ح', avatarColor: 'bg-red-400',    department: 'الموارد البشرية', checkIn: '08:53 ص', checkOut: '05:00 م', workedHours: 8.8, lateMinutes: null, overtimeHours: null, status: 'present' },
  { id: '7',  date: '2026/06/15', employeeId: 'EMP-1008', name: 'سلمى رشدي',   initial: 'س', avatarColor: 'bg-cyan-500',   department: 'المبيعات',        checkIn: '08:56 ص', checkOut: '05:30 م', workedHours: 8.2, lateMinutes: null, overtimeHours: null, status: 'present' },
  { id: '8',  date: '2026/06/15', employeeId: 'EMP-1011', name: 'فاطمة علي',   initial: 'ف', avatarColor: 'bg-rose-500',   department: 'المحاسبة',        checkIn: '08:44 ص', checkOut: '05:18 م', workedHours: 8.3, lateMinutes: null, overtimeHours: null, status: 'present' },
  // June 14
  { id: '9',  date: '2026/06/14', employeeId: 'EMP-1000', name: 'حسن الخطيب',  initial: 'ح', avatarColor: 'bg-red-400',    department: 'تقنية المعلومات', checkIn: '09:15 ص', checkOut: '05:10 م', workedHours: 7.1, lateMinutes: 15,  overtimeHours: null, status: 'late'    },
  { id: '10', date: '2026/06/14', employeeId: 'EMP-1001', name: 'مصطفى حسن',  initial: 'م', avatarColor: 'bg-purple-500', department: 'المبيعات',        checkIn: '08:50 ص', checkOut: '05:05 م', workedHours: 8.0, lateMinutes: null, overtimeHours: null, status: 'present' },
  { id: '11', date: '2026/06/14', employeeId: 'EMP-1002', name: 'سارة سعيد',   initial: 'س', avatarColor: 'bg-green-500',  department: 'العمليات',        checkIn: '08:45 ص', checkOut: '05:20 م', workedHours: 8.3, lateMinutes: null, overtimeHours: null, status: 'present' },
  { id: '12', date: '2026/06/14', employeeId: 'EMP-1003', name: 'رنا منصور',   initial: 'ر', avatarColor: 'bg-teal-500',   department: 'الموارد البشرية', checkIn: '',        checkOut: '',        workedHours: 0,   lateMinutes: null, overtimeHours: null, status: 'absent'  },
  { id: '13', date: '2026/06/14', employeeId: 'EMP-1004', name: 'كريم حسن',    initial: 'ك', avatarColor: 'bg-violet-500', department: 'التصميم',         checkIn: '08:58 ص', checkOut: '05:25 م', workedHours: 8.2, lateMinutes: null, overtimeHours: null, status: 'present' },
  { id: '14', date: '2026/06/14', employeeId: 'EMP-1007', name: 'حسن الخطيب',  initial: 'ح', avatarColor: 'bg-red-400',    department: 'الموارد البشرية', checkIn: '09:32 ص', checkOut: '05:15 م', workedHours: 7.3, lateMinutes: 32,  overtimeHours: null, status: 'late'    },
  { id: '15', date: '2026/06/14', employeeId: 'EMP-1008', name: 'سلمى رشدي',   initial: 'س', avatarColor: 'bg-cyan-500',   department: 'المبيعات',        checkIn: '08:52 ص', checkOut: '06:00 م', workedHours: 9.0, lateMinutes: null, overtimeHours: 2,    status: 'present' },
  { id: '16', date: '2026/06/14', employeeId: 'EMP-1011', name: 'فاطمة علي',   initial: 'ف', avatarColor: 'bg-rose-500',   department: 'المحاسبة',        checkIn: '',        checkOut: '',        workedHours: 0,   lateMinutes: null, overtimeHours: null, status: 'leave'   },
  // June 13
  { id: '17', date: '2026/06/13', employeeId: 'EMP-1000', name: 'حسن الخطيب',  initial: 'ح', avatarColor: 'bg-red-400',    department: 'تقنية المعلومات', checkIn: '08:50 ص', checkOut: '05:30 م', workedHours: 8.5, lateMinutes: null, overtimeHours: 1,    status: 'present' },
  { id: '18', date: '2026/06/13', employeeId: 'EMP-1001', name: 'مصطفى حسن',  initial: 'م', avatarColor: 'bg-purple-500', department: 'المبيعات',        checkIn: '09:05 ص', checkOut: '05:00 م', workedHours: 7.6, lateMinutes: 5,   overtimeHours: null, status: 'late'    },
  { id: '19', date: '2026/06/13', employeeId: 'EMP-1002', name: 'سارة سعيد',   initial: 'س', avatarColor: 'bg-green-500',  department: 'العمليات',        checkIn: '08:40 ص', checkOut: '05:22 م', workedHours: 8.6, lateMinutes: null, overtimeHours: null, status: 'present' },
  { id: '20', date: '2026/06/13', employeeId: 'EMP-1004', name: 'كريم حسن',    initial: 'ك', avatarColor: 'bg-violet-500', department: 'التصميم',         checkIn: '08:55 ص', checkOut: '05:10 م', workedHours: 8.1, lateMinutes: null, overtimeHours: null, status: 'present' },
  { id: '21', date: '2026/06/13', employeeId: 'EMP-1007', name: 'حسن الخطيب',  initial: 'ح', avatarColor: 'bg-red-400',    department: 'الموارد البشرية', checkIn: '08:48 ص', checkOut: '05:40 م', workedHours: 8.8, lateMinutes: null, overtimeHours: 2,    status: 'present' },
  { id: '22', date: '2026/06/13', employeeId: 'EMP-1008', name: 'سلمى رشدي',   initial: 'س', avatarColor: 'bg-cyan-500',   department: 'المبيعات',        checkIn: '',        checkOut: '',        workedHours: 0,   lateMinutes: null, overtimeHours: null, status: 'absent'  },
  { id: '23', date: '2026/06/13', employeeId: 'EMP-1011', name: 'فاطمة علي',   initial: 'ف', avatarColor: 'bg-rose-500',   department: 'المحاسبة',        checkIn: '08:59 ص', checkOut: '05:05 م', workedHours: 8.0, lateMinutes: null, overtimeHours: null, status: 'present' },
  { id: '24', date: '2026/06/13', employeeId: 'EMP-1003', name: 'رنا منصور',   initial: 'ر', avatarColor: 'bg-teal-500',   department: 'الموارد البشرية', checkIn: '09:50 ص', checkOut: '05:20 م', workedHours: 6.9, lateMinutes: 50,  overtimeHours: null, status: 'late'    },
];

/* ── Filter options ────────────────────────────────────────────────── */
const EMP_ITEMS: ComboboxItem[] = [
  { id: 'all', label: 'كل الموظفين' },
  ...Array.from(new Set(RECORDS.map((r) => r.name))).map((n) => ({ id: n, label: n })),
];
const MONTH_ITEMS: ComboboxItem[] = [
  { id: 'all',        label: 'كل الشهور'  },
  { id: '2026/06',    label: 'يونيو 2026' },
  { id: '2026/05',    label: 'مايو 2026'  },
  { id: '2026/04',    label: 'أبريل 2026' },
];
const STATUS_ITEMS: ComboboxItem[] = [
  { id: 'all',     label: 'كل الحالات' },
  { id: 'present', label: 'حاضر'       },
  { id: 'late',    label: 'متأخر'      },
  { id: 'absent',  label: 'غائب'       },
  { id: 'leave',   label: 'إجازة'      },
];

const STATUS_LABEL: Record<string, string> = { present: 'حاضر', late: 'متأخر', absent: 'غائب', leave: 'إجازة' };

/* ── Print helper ──────────────────────────────────────────────────── */
function printRecords(records: AttendanceLogRecord[]) {
  const win = window.open('', '_blank', 'width=1100,height=700');
  if (!win) return;

  const rows = records.map((r) => `
    <tr>
      <td>${r.date}</td>
      <td>${r.name}</td>
      <td>${r.department}</td>
      <td>${r.checkIn  || '—'}</td>
      <td>${r.checkOut || '—'}</td>
      <td>${r.workedHours ? r.workedHours + ' س' : '—'}</td>
      <td style="color:${r.lateMinutes    ? '#ef4444' : '#9ca3af'}">${r.lateMinutes    ? r.lateMinutes    + ' د' : '—'}</td>
      <td style="color:${r.overtimeHours  ? '#10b981' : '#9ca3af'}">${r.overtimeHours  ? r.overtimeHours  + ' س' : '—'}</td>
      <td><span class="badge badge-${r.status}">${STATUS_LABEL[r.status] ?? r.status}</span></td>
    </tr>`).join('');

  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سجل الحضور والانصراف</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; color: #1f2937; padding: 24px; }
    h1  { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    p   { font-size: 12px; color: #6b7280; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th  { background: #f9fafb; border: 1px solid #e5e7eb; padding: 9px 12px; font-weight: 600; text-align: right; color: #374151; }
    td  { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: right; }
    tr:nth-child(even) td { background: #f9fafb; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .badge-present { background:#d1fae5; color:#065f46; }
    .badge-late    { background:#fef3c7; color:#92400e; }
    .badge-absent  { background:#fee2e2; color:#991b1b; }
    .badge-leave   { background:#dbeafe; color:#1e40af; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>سجل الحضور والانصراف</h1>
  <p>عرض وتصفية سجلات الحضور التاريخية — ${records.length} سجل</p>
  <table>
    <thead>
      <tr>
        <th>التاريخ</th><th>الموظف</th><th>القسم</th>
        <th>الدخول</th><th>الخروج</th><th>الساعات</th>
        <th>التأخير</th><th>الإضافي</th><th>الحالة</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
</body>
</html>`);
  win.document.close();
}

/* ── Component ─────────────────────────────────────────────────────── */
export function AttendanceLogPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const [isLoading,   setIsLoading]   = useState(true);
  const [sorting,     setSorting]     = useState<SortingState>([{ id: 'date', desc: true }]);
  const [search,      setSearch]      = useState('');
  const [empFilter,   setEmpFilter]   = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [statFilter,  setStatFilter]  = useState('all');

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => RECORDS.filter((r) => {
    const q = search.trim();
    const matchSearch = !q || r.name.includes(q) || r.employeeId.includes(q);
    const matchEmp    = empFilter   === 'all' || r.name === empFilter;
    const matchMonth  = monthFilter === 'all' || r.date.startsWith(monthFilter);
    const matchStatus = statFilter  === 'all' || r.status === statFilter;
    return matchSearch && matchEmp && matchMonth && matchStatus;
  }), [search, empFilter, monthFilter, statFilter]);

  const columns = useMemo(() => getAttendanceLogColumns(isAr), [isAr]);

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

  if (isLoading) return <AttendanceLogSkeleton />;

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'سجل الحضور والانصراف' : 'Attendance Log'}
        subtitle={isAr ? 'عرض وتصفية سجلات الحضور التاريخية' : 'View and filter historical attendance records'}
        actions={
          <Button
            variant="secondary"
            startIcon={<Download size={15} />}
            onClick={() => printRecords(filtered)}
          >
            {isAr ? 'تصدير PDF' : 'Export PDF'}
          </Button>
        }
      />

      <Card overflow>
        {/* ── Filter row ── */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4
                        border-b border-gray-100 dark:border-gray-700">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); table.setPageIndex(0); }}
              placeholder={isAr ? 'اسم الموظف...' : 'Employee name...'}
              className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-600
                         bg-gray-50 dark:bg-gray-700/50 ps-4 pe-9
                         text-sm text-gray-800 dark:text-gray-200
                         outline-none focus:border-brand-400 focus:ring-2
                         focus:ring-brand-400/20 transition placeholder:text-gray-400"
            />
            <Search size={14} className="absolute inset-y-0 my-auto inset-e-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Combobox filters */}
          <div className="w-44">
            <Combobox
              items={EMP_ITEMS}
              value={empFilter}
              onChange={(v) => { setEmpFilter(v); table.setPageIndex(0); }}
              searchPlaceholder={isAr ? 'ابحث عن موظف...' : 'Search employee...'}
              noResultsText={isAr ? 'لا نتائج' : 'No results'}
            />
          </div>
          <div className="w-40">
            <Combobox
              items={MONTH_ITEMS}
              value={monthFilter}
              onChange={(v) => { setMonthFilter(v); table.setPageIndex(0); }}
              searchPlaceholder={isAr ? 'ابحث عن شهر...' : 'Search month...'}
              noResultsText={isAr ? 'لا نتائج' : 'No results'}
            />
          </div>
          <div className="w-36">
            <Combobox
              items={STATUS_ITEMS}
              value={statFilter}
              onChange={(v) => { setStatFilter(v); table.setPageIndex(0); }}
              searchPlaceholder={isAr ? 'ابحث عن حالة...' : 'Search status...'}
              noResultsText={isAr ? 'لا نتائج' : 'No results'}
            />
          </div>
        </div>

        {/* ── Table ── */}
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
