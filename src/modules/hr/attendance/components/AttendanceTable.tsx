import { type ColumnDef } from '@tanstack/react-table';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge }  from '@/shared/components/ui/Badge';
import type { AttendanceRecord, DayStatus, WorkStatus } from '@/modules/hr/attendance/types/attendance.types';

const DAY_STATUS_MAP: Record<DayStatus, { ar: string; en: string; variant: 'success' | 'warning' | 'error' | 'brand' }> = {
  present: { ar: 'حاضر',  en: 'Present', variant: 'success' },
  late:    { ar: 'متأخر', en: 'Late',    variant: 'warning' },
  absent:  { ar: 'غائب',  en: 'Absent',  variant: 'error'   },
  leave:   { ar: 'إجازة', en: 'Leave',   variant: 'brand'   },
};

const WORK_STATUS_MAP: Record<WorkStatus, { ar: string; en: string; dot: string }> = {
  working:     { ar: 'يعمل الآن',    en: 'Working Now', dot: 'bg-emerald-500' },
  done:        { ar: 'انتهى الدوام', en: 'Done',        dot: 'bg-blue-400'   },
  not_started: { ar: 'لم يبدأ',      en: 'Not Started', dot: 'bg-gray-300 dark:bg-gray-600' },
  offline:     { ar: 'غير متصل',     en: 'Offline',     dot: 'bg-gray-400 dark:bg-gray-500' },
};

export function getAttendanceColumns(isAr: boolean): ColumnDef<AttendanceRecord>[] {
  return [
    {
      accessorKey: 'employeeId',
      header: isAr ? 'المعرف' : 'ID',
      cell: ({ getValue }) => (
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: isAr ? 'الموظف' : 'Employee',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <Avatar initial={row.original.initial} color={row.original.avatarColor} size="sm" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {row.original.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: isAr ? 'القسم' : 'Department',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'checkIn',
      header: isAr ? 'الدخول' : 'Check In',
      enableSorting: false,
      cell: ({ getValue }) => {
        const v = getValue<string | null>();
        return <span className="text-sm text-gray-700 dark:text-gray-300">{v ?? '—'}</span>;
      },
    },
    {
      accessorKey: 'checkOut',
      header: isAr ? 'الخروج' : 'Check Out',
      enableSorting: false,
      cell: ({ getValue }) => {
        const v = getValue<string | null>();
        return <span className="text-sm text-gray-700 dark:text-gray-300">{v ?? '—'}</span>;
      },
    },
    {
      accessorKey: 'workedHours',
      header: isAr ? 'ساعات العمل' : 'Hours',
      cell: ({ getValue }) => {
        const v = getValue<number | null>();
        return (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {v !== null ? `${v} ${isAr ? 'س' : 'h'}` : '—'}
          </span>
        );
      },
    },
    {
      accessorKey: 'dayStatus',
      header: isAr ? 'حالة اليوم' : 'Status',
      cell: ({ getValue }) => {
        const s = DAY_STATUS_MAP[getValue<DayStatus>()];
        if (!s) return <span className="text-sm text-gray-400">—</span>;
        return <Badge label={isAr ? s.ar : s.en} variant={s.variant} />;
      },
    },
    {
      accessorKey: 'workStatus',
      header: isAr ? 'حالة العمل' : 'Work Status',
      enableSorting: false,
      cell: ({ getValue }) => {
        const s = WORK_STATUS_MAP[getValue<WorkStatus>()];
        if (!s) return <span className="text-sm text-gray-400">—</span>;
        return (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
            <span className="text-sm text-gray-700 dark:text-gray-300">{isAr ? s.ar : s.en}</span>
          </div>
        );
      },
    },
  ];
}
