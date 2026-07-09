import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useLang } from '@/app/providers/LanguageProvider';
import { PageHeader }      from '@/shared/components/ui/PageHeader';
import { Card }            from '@/shared/components/ui/Card';
import { FilterBar }       from '@/shared/components/tables/FilterBar';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { AttendanceStats }   from '@/modules/hr/attendance/components/AttendanceStats';
import { AttendanceSkeleton } from '@/modules/hr/attendance/components/AttendanceSkeleton';
import { getAttendanceColumns } from '@/modules/hr/attendance/components/AttendanceTable';
import { useDailyAttendance }   from '@/modules/hr/attendance/hooks/useDailyAttendance';
import { useDepartments }       from '@/modules/hr/employees/hooks/useLookups';
import { getInitial, getAvatarColor } from '@/modules/hr/employees/types/employee.types';
import type { AttendanceRecord, ApiDailyRecord, DayStatus, WorkStatus } from '@/modules/hr/attendance/types/attendance.types';

const PAGE_SIZE = 15;

function mapRecord(r: ApiDailyRecord): AttendanceRecord {
  const name = r.employeeName ?? '';
  return {
    id:          r.employeeId,
    employeeId:  r.employeeNumber ?? r.employeeId,
    name,
    initial:     name ? getInitial(name) : '?',
    avatarColor: name ? getAvatarColor(name) : 'bg-gray-400',
    department:  r.department ?? '',
    checkIn:     r.checkInTime,
    checkOut:    r.checkOutTime,
    workedHours: r.workingHours,
    dayStatus:   r.dayStatus,
    dayStatusLabel: r.dayStatusLabel,
    workStatus:  r.workStatus,
  };
}

type CardKey = 'checkedIn' | 'working' | 'late' | 'absent';

const CARD_TO_PARAMS: Record<CardKey, { day_status?: DayStatus; work_status?: WorkStatus }> = {
  checkedIn: {},
  working:   { work_status: 'working' },
  late:      { day_status: 'late' },
  absent:    { day_status: 'absent' },
};

export function AttendancePage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const [search,     setSearch]     = useState('');
  const [deptId,     setDeptId]     = useState('');
  const [dayStatus,  setDayStatus]  = useState<DayStatus | ''>('');
  const [cardFilter, setCardFilter] = useState<CardKey | null>(null);
  const [page,       setPage]       = useState(1);

  const { data: depts = [] } = useDepartments();

  /* Table query — server-side filters + pagination */
  const cardParams = cardFilter ? CARD_TO_PARAMS[cardFilter] : {};
  const tableParams = {
    search:        search || undefined,
    department_id: deptId || undefined,
    day_status:    cardFilter ? cardParams.day_status : (dayStatus || undefined),
    work_status:   cardParams.work_status,
    per_page:      PAGE_SIZE,
    page,
  };

  const { data: tablePage, isLoading } = useDailyAttendance(tableParams);
  const tableRecords = useMemo(() => (tablePage?.data ?? []).map(mapRecord), [tablePage]);

  const pageCount = tablePage?.last_page  ?? 1;
  const totalRows = tablePage?.total      ?? 0;
  const firstRow  = totalRows === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRow   = Math.min(page * PAGE_SIZE, totalRows);

  const columns = useMemo(() => getAttendanceColumns(isAr), [isAr]);

  const table = useReactTable({
    data:             tableRecords,
    columns,
    getCoreRowModel:  getCoreRowModel(),
    manualPagination: true,
    pageCount,
  });

  const deptOptions = [
    isAr ? 'كل الأقسام' : 'All Departments',
    ...depts.map((d) => isAr ? (d.nameAr || d.name) : d.name),
  ];

  const today = new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  function handleDeptChange(label: string) {
    const allLabel = isAr ? 'كل الأقسام' : 'All Departments';
    if (label === allLabel) {
      setDeptId('');
    } else {
      const found = depts.find((d) => (isAr ? (d.nameAr || d.name) : d.name) === label);
      setDeptId(found ? String(found.id) : '');
    }
    setPage(1);
  }

  const selectedDeptLabel = useMemo(() => {
    if (!deptId) return isAr ? 'كل الأقسام' : 'All Departments';
    const found = depts.find((d) => String(d.id) === deptId);
    return found ? (isAr ? (found.nameAr || found.name) : found.name) : (isAr ? 'كل الأقسام' : 'All Departments');
  }, [deptId, depts, isAr]);

  const STATUS_OPTIONS_AR = ['كل الحالات', 'حاضر', 'متأخر', 'غائب', 'إجازة'];
  const STATUS_OPTIONS_EN = ['All Statuses', 'Present', 'Late', 'Absent', 'Leave'];
  const STATUS_MAP_AR: Record<string, DayStatus | ''> = { 'كل الحالات': '', 'حاضر': 'present', 'متأخر': 'late', 'غائب': 'absent', 'إجازة': 'leave' };
  const STATUS_MAP_EN: Record<string, DayStatus | ''> = { 'All Statuses': '', 'Present': 'present', 'Late': 'late', 'Absent': 'absent', 'Leave': 'leave' };

  const statusOptions   = isAr ? STATUS_OPTIONS_AR : STATUS_OPTIONS_EN;
  const statusMap       = isAr ? STATUS_MAP_AR : STATUS_MAP_EN;
  const selectedStatus  = statusOptions.find((o) => statusMap[o] === dayStatus) ?? statusOptions[0];

  if (isLoading && !tablePage) return <AttendanceSkeleton />;

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'الحضور اليومي' : 'Daily Attendance'}
        subtitle={isAr
          ? `متابعة حضور موظفينا لحظياً — اليوم ${today}`
          : `Live attendance tracking — ${today}`}
      />

      <AttendanceStats
        summary={tablePage?.summary}
        isAr={isAr}
        activeCard={cardFilter}
        onFilter={(key) => {
          setCardFilter(key as CardKey | null);
          setDayStatus('');
          setPage(1);
        }}
      />

      <Card overflow>
        <FilterBar
          search={{
            value:       search,
            placeholder: isAr ? 'ابحث باسم الموظف أو المعرف...' : 'Search employee...',
            onChange:    (v) => { setSearch(v); setPage(1); },
          }}
          filters={[
            {
              key:      'dept',
              value:    selectedDeptLabel,
              options:  deptOptions,
              onChange: handleDeptChange,
            },
            {
              key:     'status',
              value:   selectedStatus,
              options: statusOptions,
              onChange: (v) => {
                setDayStatus(statusMap[v] ?? '');
                setCardFilter(null);
                setPage(1);
              },
            },
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
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400">
                    {isAr ? 'جاري التحميل...' : 'Loading...'}
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
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
          pageIndex={page - 1}
          pageCount={pageCount}
          totalRows={totalRows}
          firstRow={firstRow}
          lastRow={lastRow}
          canPrev={page > 1}
          canNext={page < pageCount}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
          onPage={(i) => setPage(i + 1)}
          isAr={isAr}
        />
      </Card>

    </div>
  );
}
