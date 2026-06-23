interface Props { isAr: boolean }

const ANNUAL   = 21;
const USED     = 4;
const REMAINING = ANNUAL - USED;

const ROWS = [
  { typeAr: 'إجازة طارئة',  typeEn: 'Emergency',  from: '2026/06/01', to: '2026/06/03', durationAr: '3 أيام', durationEn: '3 days', status: 'pending' },
  { typeAr: 'إجازة سنوية',  typeEn: 'Annual',      from: '2026/04/10', to: '2026/04/10', durationAr: 'يوم',    durationEn: '1 day',  status: 'approved' },
];

function LeaveBadge({ status, isAr }: { status: string; isAr: boolean }) {
  const cfg =
    status === 'approved'
      ? { bg: 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10', text: 'text-[#709028] dark:text-[#A0CD39]', dot: 'bg-[#709028]', label: isAr ? 'موافق' : 'Approved' }
      : { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', label: isAr ? 'معلقة' : 'Pending' };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function EmployeeDetailLeaves({ isAr }: Props) {
  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100
                        dark:border-gray-700 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{ANNUAL}</p>
          <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
            {isAr ? 'إجمالي الرصيد السنوي' : 'Total Annual Balance'}
          </p>
        </div>

        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100
                        dark:border-red-900/30 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{USED}</p>
          <p className="text-xs mt-1 text-red-400 dark:text-red-500">
            {isAr ? 'المستخدم' : 'Used'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 border border-[#A0CD39]/30
                        shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-[#709028] dark:text-[#A0CD39]">{REMAINING}</p>
          <p className="text-xs mt-1 text-[#709028]/70 dark:text-[#A0CD39]/70">
            {isAr ? 'المتبقي' : 'Remaining'}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100
                      dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                {[
                  isAr ? 'نوع الإجازة' : 'Type',
                  isAr ? 'من'          : 'From',
                  isAr ? 'إلى'         : 'To',
                  isAr ? 'المدة'       : 'Duration',
                  isAr ? 'الحالة'      : 'Status',
                  isAr ? 'التفاصيل'   : 'Details',
                ].map((h, i) => (
                  <th key={i}
                    className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50
                                       hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                    {isAr ? row.typeAr : row.typeEn}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">{row.from}</td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">{row.to}</td>
                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">
                    {isAr ? row.durationAr : row.durationEn}
                  </td>
                  <td className="px-4 py-3.5">
                    <LeaveBadge status={row.status} isAr={isAr} />
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="text-xs text-[#709028] dark:text-[#A0CD39] hover:underline font-medium">
                      {isAr ? 'التفاصيل' : 'Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
