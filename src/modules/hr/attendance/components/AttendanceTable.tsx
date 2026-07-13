import { type ColumnDef } from '@tanstack/react-table';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge }  from '@/shared/components/ui/Badge';
import { utcClockToLocal } from '@/shared/utils/date.utils';
import type { AttendanceRecord, DailyDayStatus, DailyWorkStatus } from '@/modules/hr/attendance/types/attendance.types';

const DAY_STATUS_MAP: Record<DailyDayStatus, { ar: string; en: string; variant: 'success' | 'warning' | 'error' | 'brand' }> = {
  normal:            { ar: 'عادي',           en: 'Normal',            variant: 'success' },
  late_arrival:      { ar: 'تأخر عن الموعد', en: 'Late Arrival',      variant: 'warning' },
  overtime:          { ar: 'ساعات إضافية',   en: 'Overtime',          variant: 'brand'   },
  absent:            { ar: 'غائب',           en: 'Absent',            variant: 'error'   },
  awaiting_check_in: { ar: 'بانتظار تسجيل الحضور', en: 'Awaiting Check-in', variant: 'brand' },
};

const WORK_STATUS_MAP: Record<DailyWorkStatus, { ar: string; en: string; dot: string }> = {
  currently_working: { ar: 'يعمل حاليًا', en: 'Currently Working', dot: 'bg-emerald-500' },
  on_break:          { ar: 'في استراحة',  en: 'On Break',          dot: 'bg-amber-400'   },
  offline:           { ar: 'غير متصل',    en: 'Offline',           dot: 'bg-gray-400 dark:bg-gray-500' },
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
        const v = utcClockToLocal(getValue<string | null>())?.slice(0, 5);
        return <span className="text-sm text-gray-700 dark:text-gray-300">{v ?? '—'}</span>;
      },
    },
    {
      accessorKey: 'checkOut',
      header: isAr ? 'الخروج' : 'Check Out',
      enableSorting: false,
      cell: ({ getValue }) => {
        const v = utcClockToLocal(getValue<string | null>())?.slice(0, 5);
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
      cell: ({ getValue, row }) => {
        const s = DAY_STATUS_MAP[getValue<DailyDayStatus>()];
        const label = row.original.dayStatusLabel;
        if (!s && !label) return <span className="text-sm text-gray-400">—</span>;
        return <Badge label={label ?? (isAr ? s?.ar : s?.en) ?? String(getValue())} variant={s?.variant ?? 'brand'} />;
      },
    },
    {
      accessorKey: 'workStatus',
      header: isAr ? 'حالة العمل' : 'Work Status',
      enableSorting: false,
      cell: ({ getValue, row }) => {
        const s = WORK_STATUS_MAP[getValue<DailyWorkStatus>()];
        const label = row.original.workStatusLabel;
        if (!s && !label) return <span className="text-sm text-gray-400">—</span>;
        return (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${s?.dot ?? 'bg-gray-400 dark:bg-gray-500'}`} />
            <span className="text-sm text-gray-700 dark:text-gray-300">{label ?? (isAr ? s?.ar : s?.en)}</span>
          </div>
        );
      },
    },
  ];
}
