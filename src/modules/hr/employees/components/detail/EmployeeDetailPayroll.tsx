import { useEmployeeDeductions } from '@/modules/hr/payroll/hooks/useDeductions';
import { useEmployeeBonuses } from '@/modules/hr/payroll/hooks/useBonuses';

interface Props {
  employeeId: string;
  isAr:       boolean;
}

interface Row {
  id:          string;
  date:        string;
  type:        string;
  reason:      string;
  amount:      number;
  sign:        1 | -1;
  status:      string | null;
  statusLabel: string | null;
}

const fmt = (n: number) => n.toLocaleString('ar-EG');

function StatusBadge({ status, statusLabel }: { status: string; statusLabel: string }) {
  const isPending = status === 'pending';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold
      ${isPending
        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
        : 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028] dark:text-[#A0CD39]'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-yellow-500' : 'bg-[#709028]'}`} />
      {statusLabel}
    </span>
  );
}

export function EmployeeDetailPayroll({ employeeId, isAr }: Props) {
  const { data: deductionsData, isLoading: loadingDeductions } = useEmployeeDeductions(employeeId);
  const { data: bonusesData,    isLoading: loadingBonuses }    = useEmployeeBonuses(employeeId);

  const isLoading = loadingDeductions || loadingBonuses;

  const rows: Row[] = [
    ...(deductionsData?.data ?? []).map((d): Row => ({
      id:          `d-${d.id}`,
      date:        d.deductionDate,
      type:        d.deductionTypeLabel,
      reason:      d.reason,
      amount:      d.amount,
      sign:        -1,
      status:      d.status,
      statusLabel: d.statusLabel,
    })),
    ...(bonusesData?.data ?? []).map((b): Row => ({
      id:          `b-${b.id}`,
      date:        b.adjustmentDate,
      type:        b.adjustmentTypeLabel,
      reason:      b.reason,
      amount:      b.amount,
      sign:        1,
      status:      null,
      statusLabel: null,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100
                    dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
          {isAr ? 'سجل الرواتب' : 'Payroll History'}
        </h3>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'لا يوجد سجل رواتب بعد' : 'No payroll history yet'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                {[
                  isAr ? 'التاريخ' : 'Date',
                  isAr ? 'النوع'   : 'Type',
                  isAr ? 'الوصف'   : 'Description',
                  isAr ? 'المبلغ'  : 'Amount',
                  isAr ? 'الحالة'  : 'Status',
                ].map((h, i) => (
                  <th key={i}
                    className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 dark:border-gray-700/50
                                       hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {row.type}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">
                    {row.reason}
                  </td>
                  <td className={`px-4 py-3.5 font-medium whitespace-nowrap ${
                    row.sign > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                  }`}>
                    {row.sign > 0 ? '+' : '-'}{fmt(row.amount)} ج.م
                  </td>
                  <td className="px-4 py-3.5">
                    {row.status && row.statusLabel
                      ? <StatusBadge status={row.status} statusLabel={row.statusLabel} />
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
