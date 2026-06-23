interface Props { isAr: boolean }

const ROWS = [
  { monthAr: 'يونيو 2026',  monthEn: 'Jun 2026',  payDate: '2026/06/28', base: 18000, overtime: 200,  deductions: 600, status: 'pending' },
  { monthAr: 'مايو 2026',   monthEn: 'May 2026',  payDate: '2026/05/28', base: 18000, overtime: 0,    deductions: 0,   status: 'paid'    },
  { monthAr: 'أبريل 2026',  monthEn: 'Apr 2026',  payDate: '2026/04/28', base: 18000, overtime: 700,  deductions: 0,   status: 'paid'    },
  { monthAr: 'مارس 2026',   monthEn: 'Mar 2026',  payDate: '2026/03/28', base: 18000, overtime: 0,    deductions: 600, status: 'paid'    },
  { monthAr: 'فبراير 2026', monthEn: 'Feb 2026',  payDate: '2026/02/28', base: 18000, overtime: 700,  deductions: 0,   status: 'paid'    },
  { monthAr: 'يناير 2026',  monthEn: 'Jan 2026',  payDate: '2026/01/28', base: 18000, overtime: 0,    deductions: 0,   status: 'paid'    },
];

const fmt = (n: number) => n.toLocaleString('ar-EG');

function StatusBadge({ status, isAr }: { status: string; isAr: boolean }) {
  const isPending = status === 'pending';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold
      ${isPending
        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
        : 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028] dark:text-[#A0CD39]'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-yellow-500' : 'bg-[#709028]'}`} />
      {isAr ? (isPending ? 'معلق' : 'مدفوع') : (isPending ? 'Pending' : 'Paid')}
    </span>
  );
}

export function EmployeeDetailPayroll({ isAr }: Props) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100
                    dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
          {isAr ? 'سجل الرواتب' : 'Payroll History'}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              {[
                isAr ? 'الشهر'         : 'Month',
                isAr ? 'تاريخ الصرف'  : 'Pay Date',
                isAr ? 'الراتب الأساسي': 'Base',
                isAr ? 'الإضافي'      : 'Overtime',
                isAr ? 'الخصومات'     : 'Deductions',
                isAr ? 'صافي الراتب'  : 'Net Salary',
                isAr ? 'الحالة'        : 'Status',
              ].map((h, i) => (
                <th key={i}
                  className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => {
              const net = row.base + row.overtime - row.deductions;
              return (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50
                                       hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {isAr ? row.monthAr : row.monthEn}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {row.payDate}
                  </td>
                  <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {fmt(row.base)} ج.م
                  </td>
                  <td className="px-4 py-3.5 font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {row.overtime > 0 ? `+${fmt(row.overtime)}` : '+0'} ج.م
                  </td>
                  <td className="px-4 py-3.5 font-medium text-red-500 dark:text-red-400 whitespace-nowrap">
                    {row.deductions > 0 ? `-${fmt(row.deductions)}` : '-0'} ج.م
                  </td>
                  <td className="px-4 py-3.5 font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                    {fmt(net)} ج.م
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={row.status} isAr={isAr} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
