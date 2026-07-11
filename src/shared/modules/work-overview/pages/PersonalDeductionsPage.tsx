import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Combobox } from '@/shared/components/form/Combobox';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { WorkApiErrorBanner } from '../components/WorkApiErrorBanner';
import { usePersonalDeductions, useApiQueryError } from '../hooks/useWorkOverview';
import { useWorkScopeContext, type UseWorkScopeOptions } from '../hooks/useWorkScopeContext';
import { currentMonth, formatMoney, getMonthOptions } from '../utils/workOverview.utils';

const PER_PAGE = 15;

export type PersonalDeductionsPageProps = UseWorkScopeOptions;

export function PersonalDeductionsPage({ layoutScope, seoRouteVariant }: PersonalDeductionsPageProps) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { scope, routes } = useWorkScopeContext({ layoutScope, seoRouteVariant });

  const [month, setMonth] = useState(currentMonth);
  const [page, setPage] = useState(1);
  const monthItems = useMemo(() => getMonthOptions(isAr), [isAr]);

  const { data, isLoading, error, isError } = usePersonalDeductions(scope, {
    financial_month: month,
    per_page: PER_PAGE,
    page,
  });
  const apiError = useApiQueryError(isError ? error : null);

  const rows = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;
  const firstRow = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const lastRow = Math.min(page * PER_PAGE, total);

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isAr ? 'خصوماتي' : 'My Deductions'}
        subtitle={isAr ? 'عرض خصوماتك الشخصية فقط' : 'View your personal deductions only'}
        actions={
          <div className="flex items-center gap-3">
            <Link
              to={routes.overview}
              className="text-sm text-gray-500 hover:text-[#709028] dark:hover:text-[#A0CD39]"
            >
              {isAr ? 'نظرة عامة' : 'Work overview'}
            </Link>
            <Combobox
              items={monthItems}
              value={month}
              onChange={(v) => { setMonth(v); setPage(1); }}
              placeholder={isAr ? 'اختر الشهر' : 'Select month'}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
              noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
            />
          </div>
        }
      />

      {apiError && (
        <WorkApiErrorBanner message={apiError.message} status={apiError.status} isAr={isAr} />
      )}

      {isLoading && !data ? (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : !apiError && rows.length === 0 ? (
        <EmptyState
          title={isAr ? 'لا توجد خصومات' : 'No deductions'}
          description={isAr ? 'لا توجد خصومات مسجّلة لهذا الشهر' : 'No deductions recorded for this month'}
        />
      ) : rows.length > 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'التاريخ' : 'Date'}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'النوع' : 'Type'}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'السبب' : 'Reason'}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'الشهر المالي' : 'Month'}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'المبلغ' : 'Amount'}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((r) => (
                  <tr key={r.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/60">
                    <td className="px-4 py-2.5">
                      <Link to={routes.deductionDetail(r.id)} className="font-mono text-xs text-[#709028] dark:text-[#A0CD39] hover:underline">
                        {r.deductionDate || '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">{r.type?.label || r.deductionTypeLabel || r.sourceLabel || '—'}</td>
                    <td className="px-4 py-2.5 max-w-xs">
                      <span className="line-clamp-2">{r.reason || '—'}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">{r.financialMonth || '—'}</td>
                    <td className="px-4 py-2.5 font-semibold text-red-600 dark:text-red-400">
                      {formatMoney(r.amount, isAr)}
                    </td>
                    <td className="px-4 py-2.5">{r.statusLabel || r.status || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lastPage > 1 && (
            <TablePagination
              isAr={isAr}
              pageIndex={page - 1}
              pageCount={lastPage}
              totalRows={total}
              firstRow={firstRow}
              lastRow={lastRow}
              canPrev={page > 1}
              canNext={page < lastPage}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
              onPage={(i) => setPage(i + 1)}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
