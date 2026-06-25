import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Users } from 'lucide-react';
import { useLang }         from '@/app/providers/LanguageProvider';
import { PageHeader }      from '@/shared/components/ui/PageHeader';
import { Card }            from '@/shared/components/ui/Card';
import { Button }          from '@/shared/components/ui/Button';
import { FilterBar }       from '@/shared/components/tables/FilterBar';
import { type ComboboxItem } from '@/shared/components/form/Combobox';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { employeeApi }     from '@/modules/hr/employees/api/employee.api';
import { useEmployeeAttendanceHistory } from '@/modules/hr/attendance/hooks/useEmployeeAttendanceHistory';
import type { ApiEmployeeAttendanceRecord, DayStatus } from '@/modules/hr/attendance/types/attendance.types';
import type { ApiEmployee } from '@/modules/hr/employees/types/employee.types';

const PER_PAGE = 15;

/* ── Status badge ───────────────────────────────────────────── */
const STATUS_CFG: Record<DayStatus, { bg: string; text: string; dot: string; ar: string; en: string }> = {
  present: { bg: 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10', text: 'text-[#709028] dark:text-[#A0CD39]', dot: 'bg-[#709028]', ar: 'حاضر',  en: 'Present' },
  late:    { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', ar: 'متأخر', en: 'Late'    },
  absent:  { bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-600 dark:text-red-400',       dot: 'bg-red-500',    ar: 'غائب',  en: 'Absent'  },
  leave:   { bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-600 dark:text-blue-400',     dot: 'bg-blue-500',   ar: 'إجازة', en: 'Leave'   },
};

function DayBadge({ status, isAr }: { status: DayStatus; isAr: boolean }) {
  const cfg = STATUS_CFG[status];
  if (!cfg) return <span className="text-sm text-gray-400">—</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {isAr ? cfg.ar : cfg.en}
    </span>
  );
}

function formatDate(dateStr: string, isAr: boolean) {
  try {
    return new Date(dateStr).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  } catch { return dateStr; }
}

/* ── Month options (last 12 months) ────────────────────────── */
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

/* ── PDF export ─────────────────────────────────────────────── */
function printPage(records: ApiEmployeeAttendanceRecord[], empName: string, isAr: boolean) {
  const LABELS: Record<DayStatus, string> = {
    present: isAr ? 'حاضر'  : 'Present',
    late:    isAr ? 'متأخر' : 'Late',
    absent:  isAr ? 'غائب'  : 'Absent',
    leave:   isAr ? 'إجازة' : 'Leave',
  };
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  const dir  = isAr ? 'rtl' : 'ltr';
  const rows = records.map((r) => `
    <tr>
      <td>${formatDate(r.date, isAr)}</td>
      <td>${r.check_in  ?? '—'}</td>
      <td>${r.check_out ?? '—'}</td>
      <td>${r.worked_hours !== null ? (isAr ? `${r.worked_hours} س` : `${r.worked_hours}h`) : '—'}</td>
      <td><span class="badge badge-${r.day_status}">${LABELS[r.day_status] ?? r.day_status}</span></td>
    </tr>`).join('');
  win.document.write(`<!DOCTYPE html>
<html dir="${dir}" lang="${isAr ? 'ar' : 'en'}">
<head><meta charset="UTF-8">
<title>${isAr ? 'سجل الحضور' : 'Attendance Log'} — ${empName}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:${dir};color:#1f2937;padding:24px}
  h1{font-size:20px;font-weight:700;margin-bottom:4px}
  p{font-size:12px;color:#6b7280;margin-bottom:20px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{background:#f9fafb;border:1px solid #e5e7eb;padding:9px 12px;font-weight:600;text-align:${dir==='rtl'?'right':'left'};color:#374151}
  td{border:1px solid #e5e7eb;padding:8px 12px;text-align:${dir==='rtl'?'right':'left'}}
  tr:nth-child(even) td{background:#f9fafb}
  .badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600}
  .badge-present{background:#d1fae5;color:#065f46}
  .badge-late{background:#fef3c7;color:#92400e}
  .badge-absent{background:#fee2e2;color:#991b1b}
  .badge-leave{background:#dbeafe;color:#1e40af}
  @media print{body{padding:0}}
</style></head>
<body>
  <h1>${isAr ? 'سجل الحضور والانصراف' : 'Attendance Log'}</h1>
  <p>${empName} — ${records.length} ${isAr ? 'سجل' : 'records'}</p>
  <table><thead><tr>
    <th>${isAr ? 'التاريخ'      : 'Date'}</th>
    <th>${isAr ? 'وقت الدخول'  : 'Check In'}</th>
    <th>${isAr ? 'وقت الخروج'  : 'Check Out'}</th>
    <th>${isAr ? 'ساعات العمل' : 'Hours'}</th>
    <th>${isAr ? 'الحالة'       : 'Status'}</th>
  </tr></thead><tbody>${rows}</tbody></table>
  <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\/script>
</body></html>`);
  win.document.close();
}

/* ── Page ───────────────────────────────────────────────────── */
export function AttendanceLogPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const [sorting,    setSorting]    = useState<SortingState>([{ id: 'date', desc: true }]);
  const [selectedId, setSelectedId] = useState('');
  const [month,      setMonth]      = useState('');
  const [page,       setPage]       = useState(1);

  /* employees list for combobox */
  const { data: empList } = useQuery({
    queryKey: ['employees', 'list-all'],
    queryFn:  () => employeeApi.list({ per_page: 100 }).then((r) => r.data.data.data),
  });

  const empItems: ComboboxItem[] = useMemo(() => [
    { id: '', label: isAr ? 'اختر موظفاً...' : 'Select employee...' },
    ...(empList ?? []).map((e) => ({ id: e.id, label: e.name })),
  ], [empList, isAr]);

  const monthItems = useMemo(() => buildMonthItems(isAr), [isAr]);

  const selectedEmp: ApiEmployee | undefined = useMemo(
    () => (empList ?? []).find((e) => e.id === selectedId),
    [empList, selectedId],
  );

  /* attendance history */
  const { data: histPage, isFetching } = useEmployeeAttendanceHistory(
    selectedId || undefined,
    { month: month || undefined, per_page: PER_PAGE, page },
  );

  const records  = histPage?.data      ?? [];
  const lastPage = histPage?.last_page ?? 1;
  const total    = histPage?.total     ?? 0;
  const firstRow = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const lastRow  = Math.min(page * PER_PAGE, total);

  /* columns */
  const columns = useMemo<ColumnDef<ApiEmployeeAttendanceRecord>[]>(() => [
    {
      id: 'date', accessorKey: 'date',
      header: isAr ? 'التاريخ' : 'Date',
      cell: ({ getValue }) => (
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {formatDate(getValue<string>(), isAr)}
        </span>
      ),
    },
    {
      id: 'check_in', accessorKey: 'check_in',
      header: isAr ? 'وقت الدخول' : 'Check In',
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-gray-600 dark:text-gray-300">{getValue<string | null>() ?? '—'}</span>
      ),
    },
    {
      id: 'check_out', accessorKey: 'check_out',
      header: isAr ? 'وقت الخروج' : 'Check Out',
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-gray-600 dark:text-gray-300">{getValue<string | null>() ?? '—'}</span>
      ),
    },
    {
      id: 'worked_hours', accessorKey: 'worked_hours',
      header: isAr ? 'ساعات العمل' : 'Hours',
      cell: ({ getValue }) => {
        const v = getValue<number | null>();
        return v !== null
          ? <span className="text-[#709028] dark:text-[#A0CD39] font-medium">{isAr ? `${v} س` : `${v}h`}</span>
          : <span className="text-gray-400">—</span>;
      },
    },
    {
      id: 'day_status', accessorKey: 'day_status',
      header: isAr ? 'الحالة' : 'Status',
      enableSorting: false,
      cell: ({ getValue }) => <DayBadge status={getValue<DayStatus>()} isAr={isAr} />,
    },
  ], [isAr]);

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

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'سجل الحضور والانصراف' : 'Attendance Log'}
        subtitle={isAr ? 'عرض سجلات الحضور التفصيلية للموظفين' : 'View detailed employee attendance records'}
        actions={
          selectedId ? (
            <Button
              variant="secondary"
              startIcon={<Download size={15} />}
              onClick={() => printPage(records, selectedEmp?.name ?? '', isAr)}
            >
              {isAr ? 'تصدير PDF' : 'Export PDF'}
            </Button>
          ) : undefined
        }
      />

      <Card overflow>
        <FilterBar
          filters={[
            {
              key:               'emp',
              value:             selectedId,
              items:             empItems,
              onChange:          (v) => { setSelectedId(v); setPage(1); },
              searchPlaceholder: isAr ? 'ابحث عن موظف...' : 'Search employee...',
              noResultsText:     isAr ? 'لا نتائج'         : 'No results',
              width:             'w-52',
            },
            {
              key:               'month',
              value:             month,
              items:             monthItems,
              onChange:          (v) => { setMonth(v); setPage(1); },
              searchPlaceholder: isAr ? 'ابحث...' : 'Search...',
              noResultsText:     isAr ? 'لا نتائج' : 'No results',
              width:             'w-44',
            },
          ]}
        />

        {!selectedId ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700
                            flex items-center justify-center mb-4">
              <Users size={24} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {isAr ? 'اختر موظفاً لعرض سجل حضوره' : 'Select an employee to view their attendance log'}
            </p>
            <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
              {isAr ? 'استخدم القائمة أعلاه للبحث عن موظف' : 'Use the dropdown above to search for an employee'}
            </p>
          </div>
        ) : (
          <>
            {/* ── Selected employee banner ── */}
            {selectedEmp && (
              <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl
                              bg-[#D8EBAE]/50 dark:bg-[#D8EBAE]/10
                              border border-[#A0CD39]/30
                              flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#A0CD39]
                                flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white">{selectedEmp.name.trim()[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#709028] dark:text-[#A0CD39] truncate">
                    {selectedEmp.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {[selectedEmp.department?.name, selectedEmp.jobTitle?.name]
                      .filter(Boolean).join(' · ') || (isAr ? 'غير محدد' : 'N/A')}
                  </p>
                </div>
                {total > 0 && (
                  <span className="ms-auto shrink-0 text-xs text-[#709028] dark:text-[#A0CD39] font-medium">
                    {total} {isAr ? 'سجل' : 'records'}
                  </span>
                )}
              </div>
            )}

            {/* ── Table ── */}
            <div className="overflow-x-auto mt-3">
              {isFetching && records.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                  {isAr ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700">
                    {table.getHeaderGroups().map((hg) => (
                      <tr key={hg.id}>
                        {hg.headers.map((h) => (
                          <th key={h.id}
                            className="px-5 py-3 text-start text-xs font-semibold
                                       text-gray-500 dark:text-gray-400 whitespace-nowrap">
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
                                  h.column.getIsSorted() === 'asc'  ? <ChevronUp   size={13} className="text-brand-500" /> :
                                  h.column.getIsSorted() === 'desc' ? <ChevronDown  size={13} className="text-brand-500" /> :
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
                          {isAr ? 'لا توجد سجلات حضور' : 'No attendance records found'}
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
              )}
            </div>

            <TablePagination
              pageIndex={page - 1}
              pageCount={lastPage}
              totalRows={total}
              firstRow={firstRow}
              lastRow={lastRow}
              canPrev={page > 1}
              canNext={page < lastPage}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
              onPage={(i) => setPage(i + 1)}
              isAr={isAr}
            />
          </>
        )}
      </Card>

    </div>
  );
}
