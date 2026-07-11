import { type ColumnDef } from '@tanstack/react-table';
import { Avatar } from '@/shared/components/ui/Avatar';
import { utcClockToLocal } from '@/shared/utils/date.utils';
import { DayBadge } from './DayBadge';
import { formatDate } from '../utils/printAttendance';
import type { AttendanceLogRow, DayStatus } from '../types/attendance.types';

function formatAttendanceClock(time: string | null | undefined): string {
  return utcClockToLocal(time)?.slice(0, 5) ?? '—';
}
export function getAttendanceLogColumns(isAr: boolean): ColumnDef<AttendanceLogRow>[] {
  return [
    {
      accessorKey: 'date',
      header: isAr ? 'التاريخ' : 'Date',
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 font-mono">
          {formatDate(getValue<string>(), isAr)}
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
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {getValue<string>() || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'check_in',
      header: isAr ? 'وقت الدخول' : 'Check In',
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {formatAttendanceClock(getValue<string | null>())}
        </span>
      ),
    },
    {
      accessorKey: 'check_out',
      header: isAr ? 'وقت الخروج' : 'Check Out',
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {formatAttendanceClock(getValue<string | null>())}
        </span>
      ),
    },
    {
      accessorKey: 'worked_hours',
      header: isAr ? 'ساعات العمل' : 'Hours',
      cell: ({ getValue }) => {
        const v = getValue<number | null | undefined>();
        if (v == null || Number.isNaN(v)) {
          return <span className="text-sm text-gray-400">—</span>;
        }
        return (
          <span className="text-sm font-medium text-[#709028] dark:text-[#A0CD39]">
            {isAr ? `${v} س` : `${v}h`}
          </span>
        );
      },
    },
    {
      accessorKey: 'day_status',
      header: isAr ? 'الحالة' : 'Status',
      enableSorting: false,
      cell: ({ row, getValue }) => (
        <DayBadge
          status={getValue<DayStatus | ''>()}
          label={row.original.day_status_label}
          isAr={isAr}
        />
      ),
    },
  ];
}
