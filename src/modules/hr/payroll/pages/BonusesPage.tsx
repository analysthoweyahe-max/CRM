import { useNavigate }    from 'react-router-dom';
import { Plus }           from 'lucide-react';
import { ROUTES }         from '@/app/router/routes';
import { PageHeader }     from '@/shared/components/ui/PageHeader';
import { Button }         from '@/shared/components/ui/Button';
import { usePermission }  from '@/shared/hooks/usePermission';
import { DataTable }      from '@/shared/components/tables/DataTable';
import { BonusStats }     from '../components/BonusStats';
import { BonusesSkeleton } from '../components/BonusesSkeleton';
import { OvertimeSettings } from '../components/OvertimeSettings';
import { useBonusesPage } from '../hooks/useBonusesPage';

export function BonusesPage() {
  const navigate = useNavigate();
  const canManage = usePermission('manage-payroll');
  const { isAr, isLoading, table, serverPagination, summary, search, filters } = useBonusesPage();

  if (isLoading) return <BonusesSkeleton />;

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'المكافآت والحوافز' : 'Bonuses & Incentives'}
        subtitle={isAr ? 'إدارة المكافآت وإعدادات الساعات الإضافية' : 'Manage bonuses and overtime settings'}
        actions={
          canManage ? (
            <Button onClick={() => navigate(ROUTES.PAYROLL.BONUSES_NEW)} startIcon={<Plus size={16} />}>
              {isAr ? 'إضافة مكافأة' : 'Add Bonus'}
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2">
          <BonusStats
            total={summary?.total_amount ?? 0}
            manualC={summary?.manual_count ?? 0}
            autoC={summary?.auto_count ?? 0}
            isAr={isAr}
          />
        </div>
        <div className="lg:col-span-3">
          <OvertimeSettings />
        </div>
      </div>

      <DataTable
        table={table}
        isAr={isAr}
        search={search}
        filters={filters}
        serverPagination={serverPagination}
      />

    </div>
  );
}
