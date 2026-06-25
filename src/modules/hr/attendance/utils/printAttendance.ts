import type { ApiEmployeeAttendanceRecord, DayStatus } from '../types/attendance.types';

export function formatDate(dateStr: string, isAr: boolean) {
  try {
    return new Date(dateStr).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  } catch { return dateStr; }
}

export function printAttendance(
  records: ApiEmployeeAttendanceRecord[],
  empName: string,
  isAr:    boolean,
) {
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
  th{background:#f9fafb;border:1px solid #e5e7eb;padding:9px 12px;font-weight:600;text-align:${dir === 'rtl' ? 'right' : 'left'};color:#374151}
  td{border:1px solid #e5e7eb;padding:8px 12px;text-align:${dir === 'rtl' ? 'right' : 'left'}}
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
