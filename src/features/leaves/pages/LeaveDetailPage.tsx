import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Download, FileText } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';
import { LEAVE_REQUESTS } from '../data/leavesData';
import type { LeaveStatus } from '../types/leaves.types';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

const STATUS_CFG = {
  pending:  { bgCls: 'bg-yellow-100 dark:bg-yellow-900/30', textCls: 'text-yellow-700 dark:text-yellow-400', dotCls: 'bg-yellow-500', labelAr: 'معلقة',      labelEn: 'Pending'  },
  approved: { bgCls: 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10',  textCls: 'text-[#709028] dark:text-[#A0CD39]',   dotCls: 'bg-[#709028]', labelAr: 'موافق عليها', labelEn: 'Approved' },
  rejected: { bgCls: 'bg-red-100 dark:bg-red-900/20',       textCls: 'text-red-600 dark:text-red-400',        dotCls: 'bg-red-500',   labelAr: 'مرفوضة',     labelEn: 'Rejected' },
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  );
}

export function LeaveDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();

  const initialReq = LEAVE_REQUESTS.find(r => r.id === id);

  const [status,          setStatus]          = useState<LeaveStatus>(initialReq?.status ?? 'pending');
  const [approveOpen,     setApproveOpen]     = useState(false);
  const [rejectOpen,      setRejectOpen]      = useState(false);
  const [approveNote,     setApproveNote]     = useState('');
  const [rejectReason,    setRejectReason]    = useState('');
  const [rejectError,     setRejectError]     = useState(false);

  if (!initialReq) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        {isAr ? 'الطلب غير موجود' : 'Request not found'}
      </div>
    );
  }

  const req = { ...initialReq, status };
  const cfg = STATUS_CFG[status];
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  function handleApprove() {
    setStatus('approved');
    setApproveOpen(false);
    setApproveNote('');
  }

  function handleReject() {
    if (!rejectReason.trim()) { setRejectError(true); return; }
    setStatus('rejected');
    setRejectOpen(false);
    setRejectReason('');
    setRejectError(false);
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.LEAVES.LIST)}
            className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <BackIcon size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#302F33' }}>
              {isAr ? 'تفاصيل طلب الإجازة' : 'Leave Request Details'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {isAr ? `رقم الطلب: ${req.id}` : `Request #${req.id}`}
            </p>
          </div>
        </div>

        {/* Action buttons — only for pending */}
        {status === 'pending' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setApproveOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                         bg-[#A0CD39] hover:bg-[#709028] text-gray-900 transition-colors"
            >
              <CheckCircle size={15} />
              {isAr ? 'موافقة' : 'Approve'}
            </button>
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                         bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              <XCircle size={15} />
              {isAr ? 'رفض' : 'Reject'}
            </button>
          </div>
        )}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left card — applicant */}
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100
                        dark:border-gray-700 shadow-sm p-6 flex flex-col gap-5">

          {/* Avatar + name */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className={`w-14 h-14 rounded-full ${req.empAvatarBg} flex items-center justify-center`}>
              <span className="text-xl font-bold text-white">{req.empInitial}</span>
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-100">
                {isAr ? req.empNameAr : req.empNameEn}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {isAr ? req.empJobTitleAr : req.empJobTitleEn} · {isAr ? req.empDeptAr : req.empDeptEn}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.EMPLOYEES.DETAIL(req.empId))}
              className="mt-1 px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600
                         text-xs font-medium text-gray-600 dark:text-gray-400
                         hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {isAr ? 'عرض الملف الوظيفي' : 'View Profile'}
            </button>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* Leave balance */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {isAr ? 'رصيد الإجازات' : 'Leave Balance'}
            </h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{isAr ? 'رصيد الإجازات' : 'Total'}</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">21 {isAr ? 'يوم' : 'days'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{isAr ? 'المستخدم' : 'Used'}</span>
              <span className="font-semibold text-red-500">4 {isAr ? 'يوم' : 'days'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{isAr ? 'المتبقي' : 'Remaining'}</span>
              <span className="font-semibold text-[#709028] dark:text-[#A0CD39]">17 {isAr ? 'يوم' : 'days'}</span>
            </div>
          </div>
        </div>

        {/* Right card — request details */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100
                        dark:border-gray-700 shadow-sm p-6 space-y-5">

          {/* Status badge */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bgCls} ${cfg.textCls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotCls}`} />
            {isAr ? cfg.labelAr : cfg.labelEn}
          </span>

          {/* Fields grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            <Field
              label={isAr ? 'تاريخ تقديم الطلب' : 'Request Date'}
              value={req.requestDate}
            />
            <Field
              label={isAr ? 'تاريخ البداية' : 'Start Date'}
              value={req.from}
            />
            <Field
              label={isAr ? 'نوع الإجازة' : 'Leave Type'}
              value={isAr ? req.leaveTypeAr : req.leaveTypeEn}
            />
            <Field
              label={isAr ? 'تاريخ النهاية' : 'End Date'}
              value={req.to}
            />
            <Field
              label={isAr ? 'تاريخ الموافقة' : 'Approval Date'}
              value={req.approvalDate ?? (isAr ? 'بانتظار المراجعة' : 'Pending Review')}
            />
            <Field
              label={isAr ? 'المدة' : 'Duration'}
              value={isAr ? req.durationAr : req.durationEn}
            />
          </div>

          {/* Reason */}
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">
              {isAr ? 'سبب الإجازة' : 'Leave Reason'}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/30 rounded-xl px-4 py-3">
              {req.reason}
            </p>
          </div>

          {/* Rejection reason (if rejected) */}
          {status === 'rejected' && req.rejectionReason && (
            <div>
              <p className="text-xs text-red-400 mb-1.5">
                {isAr ? 'سبب الرفض' : 'Rejection Reason'}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
                {req.rejectionReason}
              </p>
            </div>
          )}

          {/* Approval note (if approved) */}
          {status === 'approved' && req.notes && (
            <div>
              <p className="text-xs text-[#709028] mb-1.5">
                {isAr ? 'ملاحظة' : 'Note'}
              </p>
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
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                                  flex items-center justify-center">
                    <FileText size={15} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isAr ? req.attachment.nameAr : req.attachment.nameEn}
                    </p>
                    <p className="text-xs text-gray-400">{req.attachment.sizeKB} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400
                             hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Approve modal ─────────────────────────────────── */}
      <Modal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title={isAr ? 'الموافقة على الإجازة' : 'Approve Leave'}
        description={isAr ? req.empNameAr : req.empNameEn}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproveOpen(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <button
              type="button"
              onClick={handleApprove}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                         bg-[#A0CD39] hover:bg-[#709028] text-gray-900 transition-colors"
            >
              {isAr ? 'تأكيد الموافقة' : 'Confirm Approval'}
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
            onChange={e => setApproveNote(e.target.value)}
            rows={4}
            placeholder={isAr ? 'ملاحظة للموظف...' : 'Note for the employee...'}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-600
                       bg-gray-50 dark:bg-gray-700/50 px-4 py-3 text-sm resize-none
                       text-gray-800 dark:text-gray-200 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/40 focus:border-[#A0CD39]"
          />
        </div>
      </Modal>

      {/* ── Reject modal ──────────────────────────────────── */}
      <Modal
        open={rejectOpen}
        onClose={() => { setRejectOpen(false); setRejectError(false); }}
        title={isAr ? 'رفض الإجازة' : 'Reject Leave'}
        description={isAr ? req.empNameAr : req.empNameEn}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setRejectOpen(false); setRejectError(false); }}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <button
              type="button"
              onClick={handleReject}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                         bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              {isAr ? 'تأكيد الرفض' : 'Confirm Rejection'}
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
            onChange={e => { setRejectReason(e.target.value); if (rejectError) setRejectError(false); }}
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
