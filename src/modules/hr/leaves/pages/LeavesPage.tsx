import { useLang }     from '@/app/providers/LanguageProvider';
import { Search }      from 'lucide-react';
import { Card }        from '@/shared/components/ui/Card';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { LeavesSkeleton }  from '../components/LeavesSkeleton';
import { LeaveTableRow }   from '../components/LeaveTableRow';
import { useLeavesPage }   from './useLeavesPage';
import { LEAVES_TABS, COLS_AR, COLS_EN } from '../types/leaves.types';

export function LeavesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    isLoading, activeFilter, search, page, setPage,
    counts, rows, total, lastPage, firstRow, lastRow,
    handleFilterChange, handleSearchChange,
  } = useLeavesPage();

  if (isLoading && !rows.length) return <LeavesSkeleton />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {isAr ? 'إدارة الإجازات' : 'Leave Management'}
        </h1>
        <p className="text-sm mt-0.5 text-gray-500">
          {isAr ? 'مراجعة طلبات الإجازات والموافقة عليها' : 'Review and approve leave requests'}
        </p>
      </div>

      <Card>
        {/* Filter tabs */}
        <div className="flex items-center gap-2 p-4 pb-0 flex-wrap">
          {LEAVES_TABS.map((tab) => (
            <button key={tab.key} type="button" onClick={() => handleFilterChange(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${activeFilter === tab.key
                  ? 'bg-[#A0CD39] text-gray-900'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:text-gray-400'}`}>
              {isAr ? tab.labelAr : tab.labelEn}
              {counts[tab.key] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                  ${activeFilter === tab.key
                    ? 'bg-white/30 text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search size={15} className="absolute inset-y-0 my-auto inset-e-3 text-gray-400" />
            <input value={search} onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={isAr ? 'ابحث باسم الموظف أو القسم...' : 'Search by name or department...'}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600
                         bg-gray-50 dark:bg-gray-700/50 pe-9 ps-4 py-2.5 text-sm
                         text-gray-800 dark:text-gray-200 placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/40 focus:border-[#A0CD39]
                         transition-colors" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                {(isAr ? COLS_AR : COLS_EN).map((h, i) => (
                  <th key={i} className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-gray-400">{isAr ? 'جاري التحميل...' : 'Loading...'}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-gray-400">{isAr ? 'لا توجد طلبات' : 'No requests found'}</td></tr>
              ) : rows.map((row) => <LeaveTableRow key={row.id} row={row} isAr={isAr} />)}
            </tbody>
          </table>
        </div>

        <TablePagination
          pageIndex={page - 1} pageCount={lastPage} totalRows={total}
          firstRow={firstRow} lastRow={lastRow}
          canPrev={page > 1} canNext={page < lastPage}
          onPrev={() => setPage(page - 1)} onNext={() => setPage(page + 1)} onPage={(i) => setPage(i + 1)}
          isAr={isAr}
        />
      </Card>
    </div>
  );
}
