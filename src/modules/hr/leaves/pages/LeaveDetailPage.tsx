import { useNavigate }  from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Download, FileText } from 'lucide-react';
import { ROUTES }        from '@/app/router/routes';
import { Modal }         from '@/shared/components/ui/Modal';
import { Button }        from '@/shared/components/ui/Button';
import { LeaveStatusBadge } from '../components/LeaveStatusBadge';
import { useLeaveDetailPage } from './useLeaveDetailPage';
import type { FieldProps } from '../types/leaves.types';

function Field({ label, value }: FieldProps) {
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  );
}

export function LeaveDetailPage() {
  const navigate = useNavigate();

  const {
    isAr, req, isLoading, isError,
    name, initial, avatarBg, daysLabel,
    approveOpen, setApproveOpen,
    rejectOpen,  setRejectOpen,
    approveNote, setApproveNote,
    rejectReason, setRejectReason,
    rejectError,  setRejectError,
    isActionPending,
    handleApprove, handleReject,
  } = useLeaveDetailPage();

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  if (isError || !req) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        {isAr ? 'الطلب غير موجود' : 'Request not found'}
      </div>
    );
  }

  const status = req.status;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.LEAVES.LIST)}
            className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <BackIcon size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {isAr ? 'تفاصيل طلب الإجازة' : 'Leave Request Details'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {isAr ? `رقم الطلب: ${req.id}` : `Request #${req.id}`}
            </p>
          </div>
        </div>

        {status === 'pending' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setApproveOpen(true)}
              disabled={isActionPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                         bg-[#A0CD39] hover:bg-[#709028] text-gray-900 transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <CheckCircle size={15} />
              {isAr ? 'موافقة' : 'Approve'}
            </button>
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              disabled={isActionPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                         bg-red-500 hover:bg-red-600 text-white transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <XCircle size={15} />
              {isAr ? 'رفض' : 'Reject'}
            </button>
          </div>
        )}
      </div>

      {/* ── Content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left card — applicant */}
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100
                        dark:border-gray-700 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex flex-col items-center text-center gap-2">
            <div className={`w-14 h-14 rounded-full ${avatarBg} flex items-center justify-center`}>
              <span className="text-xl font-bold text-white">{initial}</span>
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-100">{name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {req.employee?.job_title ?? '–'} · {req.employee?.department ?? '–'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.EMPLOYEES.DETAIL(req.employee?.id ?? ''))}
              className="mt-1 px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600
                         text-xs font-medium text-gray-600 dark:text-gray-400
                         hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {isAr ? 'عرض الملف الوظيفي' : 'View Profile'}
            </button>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />

          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
              {isAr ? 'نوع الإجازة' : 'Leave Type'}
            </p>
            <span className="inline-block px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700
                             text-sm font-medium text-gray-700 dark:text-gray-300">
              {req.leave_type_label ?? req.leave_type}
            </span>
          </div>
        </div>

        {/* Right card — request details */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100
                        dark:border-gray-700 shadow-sm p-6 space-y-5">

          <LeaveStatusBadge status={status} isAr={isAr} />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            <Field label={isAr ? 'تاريخ تقديم الطلب' : 'Request Date'} value={req.request_date} />
            <Field label={isAr ? 'تاريخ البداية'      : 'Start Date'}   value={req.start_date}   />
            <Field label={isAr ? 'تاريخ النهاية'      : 'End Date'}     value={req.end_date}     />
            <Field label={isAr ? 'المدة'              : 'Duration'}     value={daysLabel}         />
            <Field
              label={isAr ? 'تاريخ الموافقة' : 'Approval Date'}
              value={req.approved_at ?? (isAr ? 'بانتظار المراجعة' : 'Pending Review')}
            />
          </div>

          {/* Reason */}
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">
              {isAr ? 'سبب الإجازة' : 'Leave Reason'}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed
                          bg-gray-50 dark:bg-gray-700/30 rounded-xl px-4 py-3">
              {req.reason ?? '–'}
            </p>
          </div>

          {/* Rejection reason */}
          {status === 'rejected' && req.rejection_reason && (
            <div>
              <p className="text-xs text-red-400 mb-1.5">{isAr ? 'سبب الرفض' : 'Rejection Reason'}</p>
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
                {req.rejection_reason}
              </p>
            </div>
          )}

          {/* Approval note */}
          {status === 'approved' && req.notes && (
            <div>
              <p className="text-xs text-[#709028] mb-1.5">{isAr ? 'ملاحظة' : 'Note'}</p>
              <p className="text-sm text-[#709028] bg-[#D8EBAE]/40 dark:bg-[#D8EBAE]/10 rounded-xl px-4 py-3">
                {req.notes}
              </p>
            </div>
          )}

          {/* Attachment */}
          {req.attachment && (
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                {isAr ? 'المرفقات' : 'Attachments'}
              </p>
              <div className="flex items-center justify-between rounded-xl border border-gray-200
                              dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 border border-gray-200
                                  dark:border-gray-600 flex items-center justify-center">
                    <FileText size={15} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{req.attachment.name}</p>
                    <p className="text-xs text-gray-400">{Math.round(req.attachment.size / 1024)} KB</p>
                  </div>
                </div>
                <a
                  href={req.attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400
                             hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Approve modal ── */}
      <Modal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title={isAr ? 'الموافقة على الإجازة' : 'Approve Leave'}
        description={name}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproveOpen(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isActionPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                         bg-[#A0CD39] hover:bg-[#709028] text-gray-900 transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isActionPending
                ? (isAr ? 'جاري...' : 'Saving...')
                : (isAr ? 'تأكيد الموافقة' : 'Confirm Approval')}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {isAr ? 'إضافة ملاحظة (اختياري)' : 'Add Note (Optional)'}
          </label>
          <textarea
            value={approveNote}
            onChange={(e) => setApproveNote(e.target.value)}
            rows={4}
            placeholder={isAr ? 'ملاحظة للموظف...' : 'Note for the employee...'}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-600
                       bg-gray-50 dark:bg-gray-700/50 px-4 py-3 text-sm resize-none
                       text-gray-800 dark:text-gray-200 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/40 focus:border-[#A0CD39]"
          />
        </div>
      </Modal>

      {/* ── Reject modal ── */}
      <Modal
        open={rejectOpen}
        onClose={() => { setRejectOpen(false); setRejectError(false); }}
        title={isAr ? 'رفض الإجازة' : 'Reject Leave'}
        description={name}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setRejectOpen(false); setRejectError(false); }}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <button
              type="button"
              onClick={handleReject}
              disabled={isActionPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                         bg-red-500 hover:bg-red-600 text-white transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isActionPending
                ? (isAr ? 'جاري...' : 'Saving...')
                : (isAr ? 'تأكيد الرفض' : 'Confirm Rejection')}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {isAr ? 'سبب الرفض' : 'Rejection Reason'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => { setRejectReason(e.target.value); if (rejectError) setRejectError(false); }}
            rows={4}
            placeholder={isAr ? 'وضّح سبب رفض الطلب...' : 'Explain the reason for rejection...'}
            className={`w-full rounded-xl border px-4 py-3 text-sm resize-none
                       bg-gray-50 dark:bg-gray-700/50
                       text-gray-800 dark:text-gray-200 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 transition-colors
                       ${rejectError
                         ? 'border-red-400 focus:ring-red-300'
                         : 'border-gray-200 dark:border-gray-600 focus:ring-red-300 focus:border-red-400'}`}
          />
          {rejectError && (
            <p className="mt-1.5 text-xs text-red-500">
              {isAr ? 'سبب الرفض مطلوب' : 'Rejection reason is required'}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
