import { attendanceApi } from '../api/attendance.api';
import type { ApiEmployeeAttendanceRecord, AttendanceLogRow } from '../types/attendance.types';
import type { ApiEmployee } from '@/modules/hr/employees/types/employee.types';
import { getAvatarColor, getInitial } from '@/modules/hr/employees/types/employee.types';

const HISTORY_PAGE_SIZE = 100;
const FETCH_BATCH_SIZE  = 8;

async function fetchEmployeeHistoryPages(
  employeeId: string,
  dateFrom:   string,
  dateTo:     string,
): Promise<ApiEmployeeAttendanceRecord[]> {
  const first = await attendanceApi.employeeHistory(employeeId, {
    date_from: dateFrom,
    date_to:   dateTo,
    per_page:  HISTORY_PAGE_SIZE,
    page:      1,
  });
  const { data: firstBatch, last_page } = first.data.data;
  if (last_page <= 1) return firstBatch;

  const restPages = Array.from({ length: last_page - 1 }, (_, i) => i + 2);
  const rest = await Promise.all(
    restPages.map((page) =>
      attendanceApi
        .employeeHistory(employeeId, {
          date_from: dateFrom,
          date_to:   dateTo,
          per_page:  HISTORY_PAGE_SIZE,
          page,
        })
        .then((r) => r.data.data.data),
    ),
  );
  return [firstBatch, ...rest].flat();
}

function pickHours(rec: ApiEmployeeAttendanceRecord): number | null {
  const raw = rec.workingHours ?? rec.worked_hours;
  return typeof raw === 'number' && !Number.isNaN(raw) ? raw : null;
}

function toLogRow(emp: ApiEmployee, rec: ApiEmployeeAttendanceRecord): AttendanceLogRow {
  const name = emp.name ?? '';
  return {
    id:               String(rec.id ?? `${emp.id}-${rec.date}`),
    date:             rec.date,
    employeeId:       emp.id,
    name,
    initial:          name ? getInitial(name) : '?',
    avatarColor:      name ? getAvatarColor(name) : 'bg-gray-400',
    department:       emp.department?.name ?? '',
    check_in:         rec.checkInTime ?? rec.check_in ?? null,
    check_out:        rec.checkOutTime ?? rec.check_out ?? null,
    worked_hours:     pickHours(rec),
    day_status:       rec.dayStatus ?? rec.day_status ?? '',
    day_status_label: rec.dayStatusLabel,
  };
}

async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R[]>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const parts = await Promise.all(batch.map(fn));
    out.push(...parts.flat());
  }
  return out;
}

/** Fetch attendance rows for one or all employees within an exact date range. */
export async function fetchAttendanceLog(
  employees: ApiEmployee[],
  dateFrom:  string,
  dateTo:    string,
  employeeId?: string,
): Promise<AttendanceLogRow[]> {
  const targets = employeeId
    ? employees.filter((e) => e.id === employeeId)
    : employees;

  if (targets.length === 0) return [];

  const rows = await mapInBatches(targets, FETCH_BATCH_SIZE, async (emp) => {
    const records = await fetchEmployeeHistoryPages(emp.id, dateFrom, dateTo);
    return records.map((rec) => toLogRow(emp, rec));
  });

  return rows.sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return a.name.localeCompare(b.name, 'ar');
  });
}
