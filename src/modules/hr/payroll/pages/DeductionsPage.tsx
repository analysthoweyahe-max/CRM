import { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, type SortingState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang }          from '@/app/providers/LanguageProvider';
import { ROUTES }           from '@/app/router/routes';
import { PageHeader }       from '@/shared/components/ui/PageHeader';
import { Button }           from '@/shared/components/ui/Button';
import { DataTable }        from '@/shared/components/tables/DataTable';
import { DeductionStats }   from '@/modules/hr/payroll/components/DeductionStats';
import { DeductionsSkeleton } from '@/modules/hr/payroll/components/DeductionsSkeleton';
import { getDeductionColumns } from '@/modules/hr/payroll/components/deductionColumns';
import { useDeductionList, useDeductionTypes, useDeductionSources } from '../hooks/useDeductions';
import type { ComboboxItem } from '@/shared/components/form/Combobox';

const PER_PAGE = 15;

function buildMonthItems(isAr: boolean): ComboboxItem[] {
  const items: ComboboxItem[] = [{ id: '', label: isAr ? 'كل الشهور' : 'All months' }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    items.push({ id: val, label: d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' }) });
  }
  return items;
}

export function DeductionsPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();

  const [sorting,      setSorting]      = useState<SortingState>([]);
  const [search,       setSearch]       = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [monthFilter,  setMonthFilter]  = useState('');
  const [page,         setPage]         = useState(1);

  const { data: typesRaw   } = useDeductionTypes();
  const { data: sourcesRaw } = useDeductionSources();

  const typeItems   = useMemo<ComboboxItem[]>(() => [
    { id: '', label: isAr ? 'كل الأنواع'  : 'All types'   },
    ...(typesRaw   ?? []).map((t) => ({ id: t.value, label: t.label })),
  ], [typesRaw, isAr]);

  const sourceItems = useMemo<ComboboxItem[]>(() => [
    { id: '', label: isAr ? 'كل المصادر' : 'All sources' },
    ...(sourcesRaw ?? []).map((s) => ({ id: s.value, label: s.label })),
  ], [sourcesRaw, isAr]);

  const monthItems = useMemo(() => buildMonthItems(isAr), [isAr]);

  const { data: pageData, isLoading } = useDeductionList({
    search:          search       || undefined,
    source:          sourceFilter || undefined,
    deduction_type:  typeFilter   || undefined,
    financial_month: monthFilter  || undefined,
    per_page: PER_PAGE, page,
  });

  const rows     = pageData?.data      ?? [];
  const lastPage = pageData?.last_page ?? 1;
  const total    = pageData?.total     ?? 0;
  const firstRow = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const lastRow  = Math.min(page * PER_PAGE, total);

  const summary     = pageData?.summary;
  const statsTotal  = summary?.total_amount ?? rows.reduce((s, r) => s + r.amount, 0);
  const statsAuto   = summary?.auto_count   ?? rows.filter((r) => r.source === 'auto').length;
  const statsManual = summary?.manual_count ?? rows.filter((r) => r.source === 'manual').length;

  const columns = useMemo(() => getDeductionColumns(isAr), [isAr]);
  const table = useReactTable({
    data: rows, columns, state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    manualPagination: true, pageCount: lastPage,
  });

  function resetPage() { setPage(1); }

  if (isLoading && !pageData) return <DeductionsSkeleton />;

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'الخصومات' : 'Deductions'}
        subtitle={isAr ? 'إدارة الخصومات التلقائية واليدوية' : 'Manage automatic and manual deductions'}
        actions={
          <Button onClick={() => navigate(ROUTES.PAYROLL.DEDUCTIONS_NEW)} startIcon={<Plus size={16} />}>
            {isAr ? 'إضافة خصم' : 'Add Deduction'}
          </Button>
        }
      />

      <DeductionStats total={statsTotal} autoC={statsAuto} manualC={statsManual} isAr={isAr} />

      <DataTable
        table={table}
        isAr={isAr}
        isLoading={isLoading}
        emptyText={isAr ? 'لا توجد خصومات' : 'No deductions found'}
        search={{
          value:       search,
          placeholder: isAr ? 'ابحث باسم الموظف...' : 'Search employee...',
          onChange:    (v) => { setSearch(v); resetPage(); },
        }}
        filters={[
          { key: 'type',   value: typeFilter,   items: typeItems,
            onChange: (v) => { setTypeFilter(v); resetPage(); },
            searchPlaceholder: isAr ? 'ابحث...' : 'Search...', noResultsText: isAr ? 'لا نتائج' : 'No results', width: 'w-44' },
          { key: 'source', value: sourceFilter, items: sourceItems,
            onChange: (v) => { setSourceFilter(v); resetPage(); },
            searchPlaceholder: isAr ? 'ابحث...' : 'Search...', noResultsText: isAr ? 'لا نتائج' : 'No results', width: 'w-36' },
          { key: 'month',  value: monthFilter,  items: monthItems,
            onChange: (v) => { setMonthFilter(v); resetPage(); },
            searchPlaceholder: isAr ? 'ابحث...' : 'Search...', noResultsText: isAr ? 'لا نتائج' : 'No results', width: 'w-44' },
        ]}
        serverPagination={{
          page, lastPage, total, firstRow, lastRow,
          onPrev: () => setPage((p) => p - 1),
          onNext: () => setPage((p) => p + 1),
          onPage: (i) => setPage(i + 1),
        }}
      />
    </div>
  );
}
