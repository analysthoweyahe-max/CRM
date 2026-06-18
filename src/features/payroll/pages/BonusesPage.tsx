import { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useNavigate }       from 'react-router-dom';
import { useLang }           from '@/app/providers/LanguageProvider';
import { ROUTES }            from '@/app/router/routes';
import { PageHeader }        from '@/shared/components/ui/PageHeader';
import { DataTable }         from '@/shared/components/tables/DataTable';
import { BonusStats }        from '@/features/payroll/components/BonusStats';
import { BonusesSkeleton }   from '@/features/payroll/components/BonusesSkeleton';
import { OvertimeSettings }  from '@/features/payroll/components/OvertimeSettings';
import { getBonusColumns }   from '@/features/payroll/components/bonusColumns';
import { BONUS_DATA, BONUS_DEPARTMENTS, BONUS_TYPES } from '@/features/payroll/data/bonusData';

export function BonusesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();

  const [isLoading,  setIsLoading]  = useState(true);
  const [sorting,    setSorting]    = useState<SortingState>([{ id: 'date', desc: true }]);
  const [search,     setSearch]     = useState('');
  const [deptFilter, setDeptFilter] = useState('كل الأقسام');
  const [typeFilter, setTypeFilter] = useState('كل الأنواع');

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => BONUS_DATA.filter((r) => {
    const matchSearch = r.employeeName.includes(search);
    const matchDept   = deptFilter === 'كل الأقسام' || r.department === deptFilter;
    const matchType   = typeFilter === 'كل الأنواع'  || r.type === typeFilter;
    return matchSearch && matchDept && matchType;
  }), [search, deptFilter, typeFilter]);

  const total   = BONUS_DATA.reduce((s, r) => s + r.amount, 0);
  const manualC = BONUS_DATA.filter((r) => r.source === 'manual').length;
  const autoC   = BONUS_DATA.filter((r) => r.source === 'auto').length;

  const columns = useMemo(() => getBonusColumns(isAr), [isAr]);

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

  if (isLoading) return <BonusesSkeleton />;

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'المكافآت والحوافز' : 'Bonuses & Incentives'}
        subtitle={isAr ? 'إدارة المكافآت وإعدادات الساعات الإضافية' : 'Manage bonuses and overtime settings'}
        actions={
          <button
            type="button"
            onClick={() => navigate(ROUTES.PAYROLL.BONUSES_NEW)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg shrink-0
                       bg-[#A0CD39] hover:bg-[#90BA33] text-gray-900 text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            {isAr ? 'إضافة مكافأة' : 'Add Bonus'}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2">
          <BonusStats total={total} manualC={manualC} autoC={autoC} isAr={isAr} />
        </div>
        <div className="lg:col-span-3">
          <OvertimeSettings />
        </div>
      </div>

      <DataTable
        table={table}
        isAr={isAr}
        search={{
          value:       search,
          placeholder: isAr ? 'ابحث باسم الموظف...' : 'Search employee...',
          onChange:    (v) => { setSearch(v); table.setPageIndex(0); },
        }}
        filters={[
          { key: 'dept', value: deptFilter, options: BONUS_DEPARTMENTS, onChange: (v) => { setDeptFilter(v); table.setPageIndex(0); } },
          { key: 'type', value: typeFilter, options: BONUS_TYPES,       onChange: (v) => { setTypeFilter(v); table.setPageIndex(0); } },
        ]}
      />

    </div>
  );
}
