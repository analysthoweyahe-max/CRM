import { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';
import { Card }             from '@/shared/components/ui/Card';
import { PageHeader }       from '@/shared/components/ui/PageHeader';
import { FilterBar }        from '@/shared/components/tables/FilterBar';
import { TablePagination }  from '@/shared/components/tables/TablePagination';
import { DeductionStats }   from '@/features/payroll/components/DeductionStats';
import { DeductionsSkeleton } from '@/features/payroll/components/DeductionsSkeleton';
import { getDeductionColumns, type Deduction } from '@/features/payroll/components/deductionColumns';

/* ─── Data ──────────────────────────────────────── */
const DUMMY_DATA: Deduction[] = [
  { id: '1',  employeeName: 'حسن الخطيب',  department: 'الموارد البشرية',  initial: 'ح', avatarColor: 'bg-red-400',    type: 'تجاوز حد الإجازات', amount: 200,  reason: 'تجاوز رصيد الإجازات المسموح',            date: '2026/06/14', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '2',  employeeName: 'حسن الخطيب',  department: 'تقنية المعلومات', initial: 'ح', avatarColor: 'bg-red-400',    type: 'غياب',               amount: 400,  reason: 'غياب بدون إذن مسبق',                     date: '2026/06/12', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '3',  employeeName: 'سارة سعيد',   department: 'العمليات',        initial: 'س', avatarColor: 'bg-blue-400',   type: 'تأخر متكرر',         amount: 100,  reason: 'تكرار التأخر الصباحي 4 مرات هذا الشهر', date: '2026/06/12', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '4',  employeeName: 'سارة سعيد',   department: 'العمليات',        initial: 'س', avatarColor: 'bg-blue-400',   type: 'تأخر متكرر',         amount: 1000, reason: 'تكرار التأخر الصباحي 4 مرات هذا الشهر', date: '2026/06/12', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '5',  employeeName: 'مريم سعيد',   department: 'خدمة العملاء',    initial: 'م', avatarColor: 'bg-purple-400', type: 'غياب',               amount: 200,  reason: 'غياب بدون إذن مسبق',                     date: '2026/06/11', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '6',  employeeName: 'رنا صبري',    department: 'المبيعات',        initial: 'ر', avatarColor: 'bg-orange-400', type: 'خصم يدوي',           amount: 200,  reason: 'خصم إداري',                               date: '2026/06/10', financialMonth: 'يونيو 2026', source: 'manual' },
  { id: '7',  employeeName: 'نور أحمد',    department: 'الموارد البشرية',  initial: 'ن', avatarColor: 'bg-green-500',  type: 'تأخر متكرر',         amount: 150,  reason: 'تكرار التأخر الصباحي هذا الشهر',         date: '2026/06/09', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '8',  employeeName: 'نور أحمد',    department: 'الموارد البشرية',  initial: 'ن', avatarColor: 'bg-green-500',  type: 'خصم يدوي',           amount: 500,  reason: 'خصم بقرار إداري موافق عليه',             date: '2026/06/08', financialMonth: 'يونيو 2026', source: 'manual' },
  { id: '9',  employeeName: 'أحمد محمد',   department: 'المبيعات',        initial: 'أ', avatarColor: 'bg-teal-400',   type: 'غياب',               amount: 300,  reason: 'غياب بدون إذن مسبق',                     date: '2026/06/07', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '10', employeeName: 'نور أحمد',    department: 'الموارد البشرية',  initial: 'ن', avatarColor: 'bg-green-500',  type: 'تجاوز حد الإجازات', amount: 350,  reason: 'تجاوز رصيد الإجازات المتاح',             date: '2026/06/06', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '11', employeeName: 'خالد العمري', department: 'تقنية المعلومات', initial: 'خ', avatarColor: 'bg-yellow-500', type: 'تأخر متكرر',         amount: 200,  reason: 'تكرار التأخر الصباحي',                   date: '2026/06/05', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '12', employeeName: 'فاطمة علي',   department: 'المحاسبة',        initial: 'ف', avatarColor: 'bg-pink-400',   type: 'غياب',               amount: 400,  reason: 'غياب بدون إذن مسبق',                     date: '2026/06/04', financialMonth: 'يونيو 2026', source: 'auto'   },
  { id: '13', employeeName: 'مريم سعيد',   department: 'خدمة العملاء',    initial: 'م', avatarColor: 'bg-purple-400', type: 'خصم يدوي',           amount: 800,  reason: 'خصم تأديبي بقرار الإدارة',               date: '2026/06/03', financialMonth: 'يونيو 2026', source: 'manual' },
  { id: '14', employeeName: 'رنا صبري',    department: 'المبيعات',        initial: 'ر', avatarColor: 'bg-orange-400', type: 'تجاوز حد الإجازات', amount: 500,  reason: 'تجاوز رصيد الإجازات المسموح',            date: '2026/06/02', financialMonth: 'يونيو 2026', source: 'auto'   },
];

const DEPARTMENTS = ['كل الأقسام', ...Array.from(new Set(DUMMY_DATA.map((d) => d.department)))];
const TYPES       = ['كل الأنواع', ...Array.from(new Set(DUMMY_DATA.map((d) => d.type)))];

/* ─── Component ─────────────────────────────────── */
export function DeductionsPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();

  const [isLoading,   setIsLoading]   = useState(true);
  const [sorting,     setSorting]     = useState<SortingState>([{ id: 'date', desc: true }]);
  const [search,      setSearch]      = useState('');
  const [deptFilter,  setDeptFilter]  = useState('كل الأقسام');
  const [typeFilter,  setTypeFilter]  = useState('كل الأنواع');

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => DUMMY_DATA.filter((r) => {
    const matchSearch = r.employeeName.includes(search);
    const matchDept   = deptFilter === 'كل الأقسام' || r.department === deptFilter;
    const matchType   = typeFilter === 'كل الأنواع'  || r.type === typeFilter;
    return matchSearch && matchDept && matchType;
  }), [search, deptFilter, typeFilter]);

  const total   = DUMMY_DATA.reduce((s, r) => s + r.amount, 0);
  const autoC   = DUMMY_DATA.filter((r) => r.source === 'auto').length;
  const manualC = DUMMY_DATA.filter((r) => r.source === 'manual').length;

  const columns = useMemo(() => getDeductionColumns(isAr), [isAr]);

  const table = useReactTable({
    data:                  filtered,
    columns,
    state:                 { sorting },
    onSortingChange:       setSorting,
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState:          { pagination: { pageSize: 8 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = filtered.length;
  const firstRow  = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow   = Math.min((pageIndex + 1) * pageSize, totalRows);

  if (isLoading) return <DeductionsSkeleton />;

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'الخصومات' : 'Deductions'}
        subtitle={isAr ? 'إدارة الخصومات التلقائية واليدوية' : 'Manage automatic and manual deductions'}
        actions={
          <button
            type="button"
            onClick={() => navigate(ROUTES.PAYROLL.DEDUCTIONS_NEW)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg shrink-0
                       bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            {isAr ? 'إضافة خصم' : 'Add Deduction'}
          </button>
        }
      />

      <DeductionStats total={total} autoC={autoC} manualC={manualC} isAr={isAr} />

      <Card overflow>
        <FilterBar
          search={{
            value: search,
            placeholder: isAr ? 'ابحث باسم الموظف...' : 'Search employee...',
            onChange: (v) => { setSearch(v); table.setPageIndex(0); },
          }}
          filters={[
            { key: 'dept', value: deptFilter, options: DEPARTMENTS, onChange: (v) => { setDeptFilter(v); table.setPageIndex(0); } },
            { key: 'type', value: typeFilter, options: TYPES,       onChange: (v) => { setTypeFilter(v); table.setPageIndex(0); } },
          ]}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-5 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {h.isPlaceholder ? null : (
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className={`inline-flex items-center gap-1.5 ${h.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-800 dark:hover:text-gray-200' : 'cursor-default'}`}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {h.column.getCanSort() && (
                            h.column.getIsSorted() === 'asc'  ? <ChevronUp   size={13} className="text-brand-500" /> :
                            h.column.getIsSorted() === 'desc' ? <ChevronDown size={13} className="text-brand-500" /> :
                            <ChevronsUpDown size={13} className="text-gray-300 dark:text-gray-600" />
                          )}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                    {isAr ? 'لا توجد نتائج' : 'No results found'}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3.5 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          pageIndex={pageIndex}
          pageCount={table.getPageCount()}
          totalRows={totalRows}
          firstRow={firstRow}
          lastRow={lastRow}
          canPrev={table.getCanPreviousPage()}
          canNext={table.getCanNextPage()}
          onPrev={() => table.previousPage()}
          onNext={() => table.nextPage()}
          onPage={(i) => table.setPageIndex(i)}
          isAr={isAr}
        />
      </Card>

    </div>
  );
}
