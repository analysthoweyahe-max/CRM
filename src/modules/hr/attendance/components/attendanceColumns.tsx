import type { ColumnDef } from '@tanstack/react-table';
import { DayBadge } from './DayBadge';
import { formatDate } from '../utils/printAttendance';
import type { ApiEmployeeAttendanceRecord, DayStatus } from '../types/attendance.types';

export function getAttendanceColumns(isAr: boolean): ColumnDef<ApiEmployeeAttendanceRecord>[] {
  return [
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
  ];
}
