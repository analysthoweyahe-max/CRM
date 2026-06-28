import { useState } from 'react';
import { Plus }     from 'lucide-react';
import { useLang }  from '@/app/providers/LanguageProvider';
import { Card }     from '@/shared/components/ui/Card';
import { Button }   from '@/shared/components/ui/Button';
import { useEmpLeaveSummary, useEmpLeaveList } from '../hooks/useEmployeeLeave';
import { LeaveRequestsTable }    from '../components/LeaveRequestsTable';
import { LeaveBalancePanel }     from '../components/LeaveBalancePanel';
import { NewLeaveRequestModal }  from '../components/NewLeaveRequestModal';
import type { EmpLeaveRequest, EmpLeaveSummaryItem } from '../types/employeeLeave.types';

type Tab = 'requests' | 'balance';

const TABS = [
  { id: 'requests' as Tab, ar: 'طلباتي',       en: 'My Requests'   },
  { id: 'balance'  as Tab, ar: 'رصيد إجازاتي', en: 'Leave Balance' },
];

export function EmployeeRequestsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [tab,       setTab]       = useState<Tab>('requests');
  const [showModal, setShowModal] = useState(false);

  const { data: summary  = [], isLoading: summaryLoading } = useEmpLeaveSummary();
  const { data: requests = [], isLoading: reqLoading }     = useEmpLeaveList();

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {isAr ? 'طلباتى' : 'My Requests'}
        </h1>
        <Button variant="primary" startIcon={<Plus size={15} />} onClick={() => setShowModal(true)}>
          {isAr ? 'طلب جديد' : 'New Request'}
        </Button>
      </div>

      {/* ── Card ── */}
      <Card overflow>

        {/* Segmented tabs */}
        <div className="px-5 pt-4">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/40 rounded-xl p-1 w-fit">
            {TABS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={[
                  'px-5 py-1.5 rounded-lg text-sm font-medium transition-all',
                  tab === t.id
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-800 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                ].join(' ')}
              >
                {isAr ? t.ar : t.en}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="p-4 pt-3">
          {tab === 'requests' && (
            <LeaveRequestsTable
              requests={requests as EmpLeaveRequest[]}
              isLoading={reqLoading}
              isAr={isAr}
            />
          )}
          {tab === 'balance' && (
            <LeaveBalancePanel
              summary={summary as EmpLeaveSummaryItem[]}
              isLoading={summaryLoading}
              isAr={isAr}
            />
          )}
        </div>
      </Card>

      {/* ── Modal ── */}
      <NewLeaveRequestModal
        open={showModal}
        onClose={() => setShowModal(false)}
        isAr={isAr}
      />
    </div>
  );
}
