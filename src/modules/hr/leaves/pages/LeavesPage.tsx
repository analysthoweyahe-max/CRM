import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';
import { useLeaveList } from '../hooks/useLeaves';
import type { LeaveStatus, ApiLeaveRequest } from '../types/leaves.types';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { LeavesSkeleton } from '../components/LeavesSkeleton';
import { getInitial, getAvatarColor } from '@/modules/hr/employees/types/employee.types';

type FilterTab = 'all' | LeaveStatus;

const PAGE_SIZE = 15;

const STATUS_CFG: Record<LeaveStatus, { bgCls: string; textCls: string; dotCls: string; labelAr: string; labelEn: string }> = {
  pending:  { bgCls: 'bg-yellow-100 dark:bg-yellow-900/30', textCls: 'text-yellow-700 dark:text-yellow-400', dotCls: 'bg-yellow-500', labelAr: 'معلقة',      labelEn: 'Pending'  },
  approved: { bgCls: 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10',  textCls: 'text-[#709028] dark:text-[#A0CD39]',   dotCls: 'bg-[#709028]', labelAr: 'موافق عليها', labelEn: 'Approved' },
  rejected: { bgCls: 'bg-red-100 dark:bg-red-900/20',       textCls: 'text-red-600 dark:text-red-400',        dotCls: 'bg-red-500',   labelAr: 'مرفوضة',     labelEn: 'Rejected' },
};

function StatusBadge({ status, isAr }: { status: LeaveStatus; isAr: boolean }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bgCls} ${cfg.textCls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotCls}`} />
      {isAr ? cfg.labelAr : cfg.labelEn}
    </span>
  );
}

export function LeavesPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(1);

  /* Counts query — no status filter, page 1, small per_page */
  const { data: countPage } = useLeaveList({ per_page: 1 });
  const counts = countPage?.counts ?? { all: 0, pending: 0, approved: 0, rejected: 0 };

  /* Table query — server-side filtered */
  const { data: tablePage, isLoading } = useLeaveList({
    status:   activeFilter === 'all' ? undefined : activeFilter,
    search:   search || undefined,
    per_page: PAGE_SIZE,
    page,
  });

  const rows     = tablePage?.data      ?? [];
  const total    = tablePage?.total     ?? 0;
  const lastPage = tablePage?.last_page ?? 1;
  const firstRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRow  = Math.min(page * PAGE_SIZE, total);

  function handleFilterChange(tab: FilterTab) {
    setActiveFilter(tab);
    setPage(1);
  }

  function handleSearchChange(v: string) {
    setSearch(v);
    setPage(1);
  }

  const TABS: { key: FilterTab; labelAr: string; labelEn: string }[] = [
    { key: 'all',      labelAr: 'كل الطلبات',   labelEn: 'All' },
    { key: 'pending',  labelAr: 'معلقة',         labelEn: 'Pending' },
    { key: 'approved', labelAr: 'موافق عليها',   labelEn: 'Approved' },
    { key: 'rejected', labelAr: 'مرفوضة',        labelEn: 'Rejected' },
  ];

  if (isLoading && !tablePage) return <LeavesSkeleton />;

  const COLS_AR = ['الموظف', 'نوع الإجازة', 'من', 'إلى', 'المدة', 'تاريخ الطلب', 'الحالة', 'إجراءات'];
  const COLS_EN = ['Employee', 'Type', 'From', 'To', 'Duration', 'Request Date', 'Status', 'Actions'];

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

      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">

        {/* Filter tabs */}
        <div className="flex items-center gap-2 p-4 pb-0 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleFilterChange(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${activeFilter === tab.key
                  ? 'bg-[#A0CD39] text-gray-900'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:text-gray-400'}`}
            >
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
            <Search size={15} className="absolute inset-y-0 my-auto end-3 text-gray-400" />
            <input
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder={isAr ? 'ابحث باسم الموظف أو القسم...' : 'Search by name or department...'}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600
                         bg-gray-50 dark:bg-gray-700/50 pe-9 ps-4 py-2.5 text-sm
                         text-gray-800 dark:text-gray-200 placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/40 focus:border-[#A0CD39]
                         transition-colors"
            />
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
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    {isAr ? 'جاري التحميل...' : 'Loading...'}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    {isAr ? 'لا توجد طلبات' : 'No requests found'}
                  </td>
                </tr>
              ) : rows.map((row: ApiLeaveRequest) => {
                const name    = row.employee?.name ?? '';
                const initial = name ? getInitial(name) : '?';
                const color   = name ? getAvatarColor(name) : 'bg-gray-400';
                const dept    = row.employee?.department ?? '–';

                return (
                  <tr key={row.id}
                    className="border-b border-gray-50 dark:border-gray-700/50
                               hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">

                    {/* Employee */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shrink-0`}>
                          <span className="text-xs font-bold text-white">{initial}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{dept}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {row.leave_type_label ?? row.leave_type}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.start_date}</td>
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.end_date}</td>
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {row.days_count} {isAr ? (row.days_count === 1 ? 'يوم' : 'أيام') : (row.days_count === 1 ? 'day' : 'days')}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.request_date}</td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={row.status} isAr={isAr} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.LEAVES.DETAIL(row.id))}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400
                                     hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={isAr ? 'عرض' : 'View'}
                        >
                          <Eye size={14} />
                        </button>
                        {row.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(ROUTES.LEAVES.DETAIL(row.id))}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#709028]
                                         hover:bg-[#D8EBAE] dark:hover:bg-[#D8EBAE]/10 transition-colors"
                              title={isAr ? 'موافقة' : 'Approve'}
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(ROUTES.LEAVES.DETAIL(row.id))}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500
                                         hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title={isAr ? 'رفض' : 'Reject'}
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <TablePagination
          pageIndex={page - 1}
          pageCount={lastPage}
          totalRows={total}
          firstRow={firstRow}
          lastRow={lastRow}
          canPrev={page > 1}
          canNext={page < lastPage}
          onPrev={() => setPage(p => p - 1)}
          onNext={() => setPage(p => p + 1)}
          onPage={i => setPage(i + 1)}
          isAr={isAr}
        />
      </div>
    </div>
  );
}
