import { useState } from 'react';
import { useLang } from '@/app/providers/LanguageProvider';
import { Card } from '@/shared/components/ui/Card';
import { SearchInput } from '@/shared/components/form/SearchInput';
import { Combobox } from '@/shared/components/form/Combobox';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { ApproveModal, RejectModal } from '../components/AttendanceExceptionActionModals';
import {
  useHrAttendanceExceptions,
  useApproveAttendanceException,
  useRejectAttendanceException,
} from '../hooks/useHrAttendanceExceptions';
import {
  EXCEPTION_STATUS_CFG,
  EXCEPTION_TYPE_LABELS,
  type AttendanceException,
  type ExceptionRequestType,
  type ExceptionStatus,
} from '@/shared/modules/attendance/types/attendanceException.types';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';

const PAGE_SIZE = 15;

const STATUS_TABS: { key: ExceptionStatus | 'all'; ar: string; en: string }[] = [
  { key: 'all',      ar: 'الكل',    en: 'All'      },
  { key: 'pending',  ar: 'معلقة',   en: 'Pending'  },
  { key: 'approved', ar: 'موافق',   en: 'Approved' },
  { key: 'rejected', ar: 'مرفوض',   en: 'Rejected' },
];

export function AttendanceExceptionsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [statusFilter, setStatusFilter] = useState<ExceptionStatus | 'all'>('pending');
  const [typeFilter, setTypeFilter]     = useState<ExceptionRequestType | ''>('');
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);

  const [approveTarget, setApproveTarget] = useState<AttendanceException | null>(null);
  const [rejectTarget, setRejectTarget]   = useState<AttendanceException | null>(null);
  const [rejectReason, setRejectReason]   = useState('');
  const [rejectError, setRejectError]     = useState(false);

  const params = {
    status:       statusFilter === 'all' ? undefined : statusFilter,
    request_type: typeFilter || undefined,
    search:       search || undefined,
    per_page:     PAGE_SIZE,
    page,
  };

  const { data, isLoading } = useHrAttendanceExceptions(params);
  const approveMutation = useApproveAttendanceException();
  const rejectMutation  = useRejectAttendanceException();

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

  function handleApprove() {
    if (!approveTarget) return;
    approveMutation.mutate(approveTarget.id, {
      onSuccess: () => { toast.success(isAr ? 'تمت الموافقة' : 'Approved'); setApproveTarget(null); },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function handleReject() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { setRejectError(true); return; }
    rejectMutation.mutate(
      { uuid: rejectTarget.id, payload: { rejection_reason: rejectReason.trim() } },
      {
        onSuccess: () => {
          toast.success(isAr ? 'تم الرفض' : 'Rejected');
          setRejectTarget(null);
          setRejectReason('');
          setRejectError(false);
        },
        onError: (err) => toast.error(extractApiError(err)),
      },
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {isAr ? 'طلبات استثناء الحضور' : 'Attendance Exception Requests'}
        </h1>
        <p className="text-sm mt-0.5 text-gray-500">
          {isAr ? 'مراجعة طلبات البدء المبكر والتأخر والعمل الإضافي' : 'Review early start, late start, and overtime requests'}
        </p>
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

        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder={isAr ? 'ابحث باسم الموظف أو الرقم...' : 'Search by name or number...'}
              isAr={isAr}
            />
          </div>
          <div className="w-full sm:w-48">
            <Combobox
              items={typeItems}
              value={typeFilter}
              onChange={(v) => { setTypeFilter(v as ExceptionRequestType | ''); setPage(1); }}
              placeholder={isAr ? 'نوع الطلب' : 'Type'}
              searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
              noResultsText={isAr ? 'لا نتائج' : 'No results'}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                {(isAr
                  ? ['الموظف', 'التاريخ', 'النوع', 'السبب', 'الحالة', 'إجراءات']
                  : ['Employee', 'Date', 'Type', 'Reason', 'Status', 'Actions']
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
              ) : rows.map((row: AttendanceException) => {
                const statusCfg = EXCEPTION_STATUS_CFG[row.status];
                return (
                  <tr key={row.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{row.employee?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{row.employee?.employeeNumber} · {row.employee?.department}</p>
                    </td>
                    <td className="px-4 py-3">{row.workDate}</td>
                    <td className="px-4 py-3">{row.requestTypeLabel}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-gray-600">{row.reason}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold">{row.statusLabel ?? (isAr ? statusCfg.ar : statusCfg.en)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {row.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setApproveTarget(row)}
                            className="text-xs font-semibold text-[#709028] hover:underline">
                            {isAr ? 'موافقة' : 'Approve'}
                          </button>
                          <button type="button" onClick={() => { setRejectTarget(row); setRejectReason(''); setRejectError(false); }}
                            className="text-xs font-semibold text-red-500 hover:underline">
                            {isAr ? 'رفض' : 'Reject'}
                          </button>
                        </div>
                      )}
                      {row.status === 'rejected' && row.rejectionReason && (
                        <p className="text-xs text-red-500 max-w-[160px] truncate" title={row.rejectionReason}>{row.rejectionReason}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
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

      <ApproveModal
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        name={approveTarget?.employee?.name ?? ''}
        requestLabel={approveTarget?.requestTypeLabel ?? ''}
        onConfirm={handleApprove}
        isPending={approveMutation.isPending}
        isAr={isAr}
      />

      <RejectModal
        open={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setRejectReason(''); setRejectError(false); }}
        name={rejectTarget?.employee?.name ?? ''}
        reason={rejectReason}
        onReasonChange={(v) => { setRejectReason(v); setRejectError(false); }}
        hasError={rejectError}
        onConfirm={handleReject}
        isPending={rejectMutation.isPending}
        isAr={isAr}
      />
    </div>
  );
}
