import { Card } from '@/shared/components/ui/Card';
import type { SalesEmployeeRow } from '../hooks/useSalesDashboardMock';

interface Props {
  isAr: boolean;
  rows: SalesEmployeeRow[];
}

export function SalesEmployeePerformance({ isAr, rows }: Props) {
  return (
    <Card overflow className="fade-in-up lg:col-span-2 h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {isAr ? 'أداء الموظفين' : 'Employee Performance'}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700">
            <tr>
              {[
                isAr ? 'الموظف'    : 'Employee',
                isAr ? 'مكتسب'     : 'Won',
                isAr ? 'خسارة'     : 'Lost',
                isAr ? 'الإيرادات' : 'Revenue',
                isAr ? 'النسبة'    : 'Rate',
                isAr ? 'الهدف'     : 'Target',
                isAr ? 'العمولة'   : 'Commission',
              ].map(h => (
                <th key={h} className="px-5 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">{row.name}</td>
                <td className="px-5 py-3.5 text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">{row.won}</td>
                <td className="px-5 py-3.5 text-red-500 dark:text-red-400 font-semibold whitespace-nowrap">{row.lost}</td>
                <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.revenue}</td>
                <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.ratePct}%</td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2 min-w-28">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${row.targetPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{row.targetPct}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">{row.commission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
