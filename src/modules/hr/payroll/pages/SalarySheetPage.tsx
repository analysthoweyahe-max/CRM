import { useNavigate } from 'react-router-dom';
import { Gift, Plus, TrendingDown } from 'lucide-react';
import { ROUTES } from '@/app/router/routes';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { usePermission } from '@/shared/hooks/usePermission';
import { DataTable } from '@/shared/components/tables/DataTable';
import { SalarySheetStats } from '../components/SalarySheetStats';
import { useSalarySheetPage } from '../hooks/useSalarySheetPage';

export function SalarySheetPage() {
  const navigate = useNavigate();
  const canManage = usePermission('manage-payroll');
  const {
    isAr, isLoading, table, serverPagination, summary, search, filters,
  } = useSalarySheetPage();

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'كشف الرواتب' : 'Salary Sheet'}
        subtitle={isAr
          ? 'كشف رواتب الموظفين للشهر المالي مع الخصومات والمكافآت'
          : 'Employee salary sheet for the financial month with deductions and bonuses'}
        actions={
          canManage ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                startIcon={<TrendingDown size={15} />}
                onClick={() => navigate(ROUTES.PAYROLL.DEDUCTIONS_NEW)}
              >
                {isAr ? 'إضافة خصم' : 'Add Deduction'}
              </Button>
              <Button
                variant="ghost"
                startIcon={<Gift size={15} />}
                onClick={() => navigate(ROUTES.PAYROLL.BONUSES_NEW)}
              >
                {isAr ? 'إضافة مكافأة' : 'Add Bonus'}
              </Button>
              <Button
                startIcon={<Plus size={15} />}
                onClick={() => navigate(ROUTES.PAYROLL.BONUSES)}
              >
                {isAr ? 'المكافآت' : 'Bonuses'}
              </Button>
            </div>
          ) : undefined
        }
      />

      <SalarySheetStats summary={summary} isAr={isAr} />

      <DataTable
        table={table}
        isAr={isAr}
        isLoading={isLoading}
        search={search}
        filters={filters}
        serverPagination={serverPagination}
        emptyText={isAr ? 'لا توجد رواتب لهذا الشهر' : 'No salaries for this month'}
      />
    </div>
  );
}
