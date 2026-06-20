import { type ColumnDef } from '@tanstack/react-table';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge }  from '@/shared/components/ui/Badge';

export interface AttendanceLogRecord {
  id:            string;
  date:          string;
  employeeId:    string;
  name:          string;
  initial:       string;
  avatarColor:   string;
  department:    string;
  checkIn:       string;
  checkOut:      string;
  workedHours:   number;
  lateMinutes:   number | null;
  overtimeHours: number | null;
  status:        'present' | 'late' | 'absent' | 'leave';
}

const STATUS_MAP = {
  present: { ar: 'حاضر',  en: 'Present', variant: 'success' as const },
  late:    { ar: 'متأخر', en: 'Late',    variant: 'warning' as const },
  absent:  { ar: 'غائب',  en: 'Absent',  variant: 'error'   as const },
  leave:   { ar: 'إجازة', en: 'Leave',   variant: 'brand'   as const },
};

export function getAttendanceLogColumns(isAr: boolean): ColumnDef<AttendanceLogRecord>[] {
  return [
    {
      accessorKey: 'date',
      header: isAr ? 'التاريخ' : 'Date',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
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
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{getValue<string>() || '—'}</span>
      ),
    },
    {
      accessorKey: 'checkOut',
      header: isAr ? 'الخروج' : 'Check Out',
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{getValue<string>() || '—'}</span>
      ),
    },
    {
      accessorKey: 'workedHours',
      header: isAr ? 'الساعات' : 'Hours',
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
          {getValue<number>()} {isAr ? 'س' : 'h'}
        </span>
      ),
    },
    {
      accessorKey: 'lateMinutes',
      header: isAr ? 'التأخير' : 'Late',
      enableSorting: false,
      cell: ({ getValue }) => {
        const v = getValue<number | null>();
        return v
          ? <span className="text-sm font-medium text-red-500">{v} {isAr ? 'د' : 'm'}</span>
          : <span className="text-sm text-gray-400">—</span>;
      },
    },
    {
      accessorKey: 'overtimeHours',
      header: isAr ? 'الإضافي' : 'Overtime',
      enableSorting: false,
      cell: ({ getValue }) => {
        const v = getValue<number | null>();
        return v
          ? <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{v} {isAr ? 'س' : 'h'}</span>
          : <span className="text-sm text-gray-400">—</span>;
      },
    },
    {
      accessorKey: 'status',
      header: isAr ? 'الحالة' : 'Status',
      cell: ({ getValue }) => {
        const s = STATUS_MAP[getValue<AttendanceLogRecord['status']>()];
        return <Badge label={isAr ? s.ar : s.en} variant={s.variant} />;
      },
    },
  ];
}
