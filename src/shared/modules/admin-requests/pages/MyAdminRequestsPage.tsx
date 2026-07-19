import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Combobox } from '@/shared/components/form/Combobox';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { usePermission } from '@/shared/hooks/usePermission';
import {
  useAdminRequestList,
  useCancelAdminRequest,
} from '../hooks/useAdminRequests';
import { NewAdminRequestModal } from '../components/NewAdminRequestModal';
import { AdminRequestsTable } from '../components/AdminRequestsTable';
import {
  ADMIN_REQUEST_TYPE_LABELS,
  type AdminRequestNamespace,
  type AdminRequestStatus,
  type AdminRequestType,
} from '../types/adminRequest.types';

const PAGE_SIZE = 15;

const STATUS_TABS: { key: AdminRequestStatus | 'all'; ar: string; en: string }[] = [
  { key: 'all',       ar: 'الكل',         en: 'All'          },
  { key: 'pending',   ar: 'قيد المراجعة', en: 'Under Review' },
  { key: 'approved',  ar: 'موافق عليه',   en: 'Approved'     },
  { key: 'rejected',  ar: 'مرفوض',        en: 'Rejected'     },
  { key: 'cancelled', ar: 'ملغى',         en: 'Cancelled'    },
];

interface Props {
  namespace: AdminRequestNamespace;
}

export function MyAdminRequestsPage({ namespace }: Props) {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const canCreate = usePermission('create-request');
  const canCancel = usePermission('cancel-request');

  const [statusFilter, setStatusFilter] = useState<AdminRequestStatus | 'all'>('all');
  const [typeFilter, setTypeFilter]     = useState<AdminRequestType | ''>('');
  const [page, setPage]                 = useState(1);
  const [showModal, setShowModal]       = useState(false);
  const [cancelling, setCancelling]     = useState<string | null>(null);

  const params = {
    status:       statusFilter === 'all' ? undefined : statusFilter,
    request_type: typeFilter || undefined,
    per_page:     PAGE_SIZE,
    page,
  };

  const { data, isLoading } = useAdminRequestList(namespace, params);
  const cancelMutation = useCancelAdminRequest(namespace, isAr);

  const rows     = data?.data ?? [];
  const total    = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;
  const firstRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRow  = Math.min(page * PAGE_SIZE, total);

  const typeItems = [
    { id: '', label: isAr ? 'كل الأنواع' : 'All Types' },
    ...(Object.keys(ADMIN_REQUEST_TYPE_LABELS) as AdminRequestType[]).map((t) => ({
      id: t,
      label: isAr ? ADMIN_REQUEST_TYPE_LABELS[t].ar : ADMIN_REQUEST_TYPE_LABELS[t].en,
    })),
  ];

  function handleCancel(id: string) {
    setCancelling(id);
    cancelMutation.mutate(id, { onSettled: () => setCancelling(null) });
  }

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {isAr ? 'طلباتى' : 'My Requests'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isAr
              ? 'طلبات إدارية لمديرك (إجازة / إذن / دعم / أخرى) — غير مرتبطة برصيد الإجازات'
              : 'Admin requests to your manager — separate from formal leave balance'}
          </p>
        </div>
        {canCreate && (
          <Button variant="primary" startIcon={<Plus size={15} />} onClick={() => setShowModal(true)}>
            {isAr ? 'طلب جديد' : 'New Request'}
          </Button>
        )}
      </div>

      <Card overflow>
        <div className="flex items-center gap-2 p-4 pb-0 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${statusFilter === tab.key
                  ? 'bg-[#A0CD39] text-gray-900'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
            >
              {isAr ? tab.ar : tab.en}
            </button>
          ))}
          <div className="ms-auto w-44">
            <Combobox
              items={typeItems}
              value={typeFilter}
              onChange={(v) => { setTypeFilter(v as AdminRequestType | ''); setPage(1); }}
              placeholder={isAr ? 'النوع' : 'Type'}
              searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
              noResultsText={isAr ? 'لا نتائج' : 'No results'}
            />
          </div>
        </div>

        <div className="p-4 pt-3">
          <AdminRequestsTable
            requests={rows}
            isLoading={isLoading}
            isAr={isAr}
            onCancel={canCancel ? handleCancel : undefined}
            cancelling={cancelling}
          />
          {total > 0 && (
            <TablePagination
              pageIndex={page - 1}
              pageCount={lastPage}
              totalRows={total}
              firstRow={firstRow}
              lastRow={lastRow}
              canPrev={page > 1}
              canNext={page < lastPage}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
              onPage={(i) => setPage(i + 1)}
              isAr={isAr}
            />
          )}
        </div>
      </Card>

      <NewAdminRequestModal
        open={showModal}
        onClose={() => setShowModal(false)}
        isAr={isAr}
        namespace={namespace}
      />
    </div>
  );
}
