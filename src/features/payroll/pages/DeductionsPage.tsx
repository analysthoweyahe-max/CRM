import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import {
  Plus, Search, ChevronDown, ChevronUp,
  ChevronsUpDown, ChevronLeft, ChevronRight,
  BadgeDollarSign, Zap, PenLine,
} from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';

/* ─── Types ─────────────────────────────────────── */
interface Deduction {
  id:             string;
  employeeName:   string;
  department:     string;
  initial:        string;
  avatarColor:    string;
  type:           string;
  amount:         number;
  reason:         string;
  date:           string;
  financialMonth: string;
  source:         'auto' | 'manual';
}

/* ─── Dummy data (replace with API call) ───────── */
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

const col = createColumnHelper<Deduction>();

/* ─── Component ─────────────────────────────────── */
export function DeductionsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [sorting,     setSorting]     = useState<SortingState>([{ id: 'date', desc: true }]);
  const [search,      setSearch]      = useState('');
  const [deptFilter,  setDeptFilter]  = useState('كل الأقسام');
  const [typeFilter,  setTypeFilter]  = useState('كل الأنواع');

  const filtered = useMemo(() => DUMMY_DATA.filter((r) => {
    const matchSearch = r.employeeName.includes(search);
    const matchDept   = deptFilter === 'كل الأقسام' || r.department === deptFilter;
    const matchType   = typeFilter === 'كل الأنواع'  || r.type === typeFilter;
    return matchSearch && matchDept && matchType;
  }), [search, deptFilter, typeFilter]);

  /* stats from full dataset */
  const total   = DUMMY_DATA.reduce((s, r) => s + r.amount, 0);
  const autoC   = DUMMY_DATA.filter((r) => r.source === 'auto').length;
  const manualC = DUMMY_DATA.filter((r) => r.source === 'manual').length;

  const columns = useMemo(() => [
    col.accessor('employeeName', {
      header: isAr ? 'الموظف' : 'Employee',
      cell: ({ row: r }) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full ${r.original.avatarColor} flex items-center justify-center shrink-0`}>
            <span className="text-sm font-bold text-white">{r.original.initial}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{r.original.employeeName}</p>
            <p className="text-xs text-gray-400">{r.original.department}</p>
          </div>
        </div>
      ),
    }),
    col.accessor('type', {
      header: isAr ? 'نوع الخصم' : 'Type',
      cell: (i) => <span className="text-sm text-gray-700">{i.getValue()}</span>,
    }),
    col.accessor('amount', {
      header: isAr ? 'المبلغ' : 'Amount',
      cell: (i) => (
        <span className="text-sm font-semibold text-red-500">
          {i.getValue().toLocaleString('ar-EG')} {isAr ? 'ج.م' : 'EGP'}
        </span>
      ),
    }),
    col.accessor('reason', {
      header: isAr ? 'السبب' : 'Reason',
      enableSorting: false,
      cell: (i) => <span className="text-sm text-gray-500 max-w-50 block truncate" title={i.getValue()}>{i.getValue()}</span>,
    }),
    col.accessor('date', {
      header: isAr ? 'التاريخ' : 'Date',
      cell: (i) => <span className="text-sm text-gray-600">{i.getValue()}</span>,
    }),
    col.accessor('financialMonth', {
      header: isAr ? 'الشهر المالي' : 'Month',
      enableSorting: false,
      cell: (i) => <span className="text-sm text-gray-600">{i.getValue()}</span>,
    }),
    col.accessor('source', {
      header: isAr ? 'المصدر' : 'Source',
      enableSorting: false,
      cell: (i) => i.getValue() === 'auto'
        ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200">
            <Zap size={11} />{isAr ? 'تلقائي' : 'Auto'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <PenLine size={11} />{isAr ? 'يدوي' : 'Manual'}
          </span>
        ),
    }),
  ], [isAr]);

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

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg shrink-0
                     bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          {isAr ? 'إضافة خصم' : 'Add Deduction'}
        </button>
        <div className="text-end">
          <h1 className="text-2xl font-bold text-gray-900">{isAr ? 'الخصومات' : 'Deductions'}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {isAr ? 'إدارة الخصومات التلقائية واليدوية' : 'Manage automatic and manual deductions'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <StatCard
          label={isAr ? 'إجمالي الخصومات' : 'Total'}
          value={`${total.toLocaleString('ar-EG')} ${isAr ? 'ج.م' : 'EGP'}`}
          valueClass="text-red-500"
          icon={<BadgeDollarSign size={17} className="text-red-400" />}
        />
        <StatCard
          label={isAr ? 'خصومات تلقائية' : 'Automatic'}
          value={String(autoC)}
          icon={<Zap size={17} className="text-brand-500" />}
        />
        <StatCard
          label={isAr ? 'خصومات يدوية' : 'Manual'}
          value={String(manualC)}
          icon={<PenLine size={17} className="text-gray-400" />}
        />
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-45">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); table.setPageIndex(0); }}
              placeholder={isAr ? 'ابحث باسم الموظف...' : 'Search employee...'}
              className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 ps-4 pe-9
                         text-sm outline-none focus:border-brand-400 focus:ring-2
                         focus:ring-brand-400/20 transition placeholder:text-gray-400"
            />
            <Search size={14} className="absolute inset-y-0 my-auto inset-e-3 text-gray-400 pointer-events-none" />
          </div>

          <FilterSelect value={deptFilter} onChange={(v) => { setDeptFilter(v); table.setPageIndex(0); }} options={DEPARTMENTS} />
          <FilterSelect value={typeFilter} onChange={(v) => { setTypeFilter(v); table.setPageIndex(0); }} options={TYPES} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-5 py-3 text-start text-xs font-semibold text-gray-500 whitespace-nowrap">
                      {h.isPlaceholder ? null : (
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className={`inline-flex items-center gap-1.5 ${h.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-800' : 'cursor-default'}`}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {h.column.getCanSort() && (
                            h.column.getIsSorted() === 'asc'  ? <ChevronUp   size={13} className="text-brand-500" /> :
                            h.column.getIsSorted() === 'desc' ? <ChevronDown size={13} className="text-brand-500" /> :
                            <ChevronsUpDown size={13} className="text-gray-300" />
                          )}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-50">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400">
                    {isAr ? 'لا توجد نتائج' : 'No results found'}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>

            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => table.setPageIndex(i)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  pageIndex === i
                    ? 'bg-brand-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-400">
            {isAr
              ? `عرض ${firstRow}–${lastRow} من ${totalRows}`
              : `Showing ${firstRow}–${lastRow} of ${totalRows}`}
          </p>
        </div>

      </div>
    </div>
  );
}

/* ─── Sub-components ────────────────────────────── */
function StatCard({ label, value, valueClass = 'text-gray-900', icon }: {
  label:       string;
  value:       string;
  valueClass?: string;
  icon:        React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-5 px-4 text-center">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function FilterSelect({ value, onChange, options }: {
  value:    string;
  onChange: (v: string) => void;
  options:  string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-gray-200 bg-white ps-3 pe-8 text-sm
                   text-gray-700 outline-none focus:border-brand-400 focus:ring-2
                   focus:ring-brand-400/20 transition appearance-none cursor-pointer"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute inset-y-0 my-auto inset-e-2 text-gray-400 pointer-events-none" />
    </div>
  );
}
