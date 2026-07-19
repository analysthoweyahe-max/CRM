import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, XCircle } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Combobox } from '@/shared/components/form/Combobox';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { AttendanceExceptionRequestModal } from '@/shared/modules/attendance/components/AttendanceExceptionRequestModal';
import {
  useEmployeeAttendanceExceptions,
  useCancelAttendanceException,
} from '@/shared/modules/attendance/hooks/useEmployeeAttendanceExceptions';
import {
  EXCEPTION_STATUS_CFG,
  EXCEPTION_TYPE_LABELS,
  type ExceptionRequestType,
  type ExceptionStatus,
  type AttendanceException,
} from '@/shared/modules/attendance/types/attendanceException.types';
import { formatDateFull } from '@/shared/utils/date.utils';

const PAGE_SIZE = 15;

const STATUS_TABS: { key: ExceptionStatus | 'all'; ar: string; en: string }[] = [
  { key: 'all',       ar: 'الكل',    en: 'All'       },
  { key: 'pending',   ar: 'معلقة',   en: 'Pending'   },
  { key: 'approved',  ar: 'موافق',   en: 'Approved'  },
  { key: 'rejected',  ar: 'مرفوض',   en: 'Rejected'  },
  { key: 'cancelled', ar: 'ملغاة',   en: 'Cancelled' },
];

interface Props {
  /** Portal-specific attendance page for the back link */
  attendancePath?: string;
}

export function EmployeeAttendanceExceptionsPage({
  attendancePath = ROUTES.EMPLOYEE.ATTENDANCE,
}: Props) {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [statusFilter, setStatusFilter] = useState<ExceptionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter]     = useState<ExceptionRequestType | ''>('');
  const [page, setPage]                 = useState(1);
  const [showModal, setShowModal]       = useState(false);

  const params = {
    status:       statusFilter === 'all' ? undefined : statusFilter,
    request_type: typeFilter || undefined,
    per_page:     PAGE_SIZE,
    page,
  };

  const { data, isLoading } = useEmployeeAttendanceExceptions(params);
  const cancelMutation = useCancelAttendanceException();

  const rows     = data?.data ?? [];
  const total    = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;
  const firstRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRow  = Math.min(page * PAGE_SIZE, total);

  const typeItems = [
    { id: '', label: isAr ? 'كل الأنواع' : 'All Types' },
    ...(Object.keys(EXCEPTION_TYPE_LABELS) as ExceptionRequestType[]).map((t) => ({
      id: t,
      label: isAr ? EXCEPTION_TYPE_LABELS[t].ar : EXCEPTION_TYPE_LABELS[t].en,
    })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link to={attendancePath} className="text-xs text-gray-400 hover:text-[#709028] mb-1 inline-block">
            {isAr ? '← العودة للحضور' : '← Back to attendance'}
          </Link>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {isAr ? 'طلبات استثناء الحضور' : 'My Attendance Exceptions'}
          </h1>
        </div>
        <Button variant="primary" startIcon={<Plus size={15} />} onClick={() => setShowModal(true)}>
          {isAr ? 'طلب جديد' : 'New Request'}
        </Button>
      </div>

      <Card>
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
        </div>

        <div className="p-4 max-w-xs">
          <Combobox
            items={typeItems}
            value={typeFilter}
            onChange={(v) => { setTypeFilter(v as ExceptionRequestType | ''); setPage(1); }}
            placeholder={isAr ? 'نوع الطلب' : 'Request type'}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                {(isAr
                  ? ['التاريخ', 'النوع', 'السبب', 'الحالة', 'تاريخ التقديم', '']
                  : ['Date', 'Type', 'Reason', 'Status', 'Submitted', '']
                ).map((h, i) => (
                  <th key={i} className="px-4 py-3 text-start text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">{isAr ? 'جاري التحميل...' : 'Loading...'}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">{isAr ? 'لا توجد طلبات' : 'No requests'}</td></tr>
              ) : rows.map((row: AttendanceException) => (
                <ExceptionRow
                  key={row.id}
                  row={row}
                  isAr={isAr}
                  onCancel={(id) => cancelMutation.mutate(id)}
                  isCancelling={cancelMutation.isPending}
                />
              ))}
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
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
          onPage={(i) => setPage(i + 1)}
          isAr={isAr}
        />
      </Card>

      <AttendanceExceptionRequestModal open={showModal} onClose={() => setShowModal(false)} isAr={isAr} />
    </div>
  );
}

function ExceptionRow({
  row, isAr, onCancel, isCancelling,
}: {
  row: AttendanceException;
  isAr: boolean;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}) {
  const statusCfg = EXCEPTION_STATUS_CFG[row.status];
  const statusVariant: Record<string, string> = {
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    success: 'bg-[#D8EBAE] text-[#709028] dark:bg-[#D8EBAE]/10 dark:text-[#A0CD39]',
    error:   'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    neutral: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <tr className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
      <td className="px-4 py-3 font-medium">{row.workDate}</td>
      <td className="px-4 py-3">{row.requestTypeLabel ?? (isAr ? EXCEPTION_TYPE_LABELS[row.requestType].ar : EXCEPTION_TYPE_LABELS[row.requestType].en)}</td>
      <td className="px-4 py-3 max-w-xs truncate text-gray-600 dark:text-gray-400">{row.reason}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusVariant[statusCfg.variant]}`}>
          {row.statusLabel ?? (isAr ? statusCfg.ar : statusCfg.en)}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-500 text-xs">{formatDateFull(row.createdAt, isAr)}</td>
      <td className="px-4 py-3">
        {row.status === 'pending' && (
          <button
            type="button"
            onClick={() => onCancel(row.id)}
            disabled={isCancelling}
            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
          >
            <XCircle size={13} />
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        )}
      </td>
    </tr>
  );
}
