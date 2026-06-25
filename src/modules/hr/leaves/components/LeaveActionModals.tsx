import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

const textareaCls = 'w-full rounded-xl border px-4 py-3 text-sm resize-none bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors';

interface ApproveModalProps {
  open:         boolean;
  onClose:      () => void;
  name:         string;
  note:         string;
  onNoteChange: (v: string) => void;
  onConfirm:    () => void;
  isPending:    boolean;
  isAr:         boolean;
}

export function ApproveModal({ open, onClose, name, note, onNoteChange, onConfirm, isPending, isAr }: ApproveModalProps) {
  return (
    <Modal open={open} onClose={onClose}
      title={isAr ? 'الموافقة على الإجازة' : 'Approve Leave'}
      description={name} size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
          <button type="button" onClick={onConfirm} disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                       bg-[#A0CD39] hover:bg-[#709028] text-gray-900 transition-colors
                       disabled:opacity-60 disabled:cursor-not-allowed">
            {isPending ? (isAr ? 'جاري...' : 'Saving...') : (isAr ? 'تأكيد الموافقة' : 'Confirm Approval')}
          </button>
        </>
      }>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {isAr ? 'إضافة ملاحظة (اختياري)' : 'Add Note (Optional)'}
        </label>
        <textarea value={note} onChange={(e) => onNoteChange(e.target.value)} rows={4}
          placeholder={isAr ? 'ملاحظة للموظف...' : 'Note for the employee...'}
          className={`${textareaCls} border-gray-200 dark:border-gray-600 focus:ring-[#A0CD39]/40 focus:border-[#A0CD39]`} />
      </div>
    </Modal>
  );
}

interface RejectModalProps {
  open:           boolean;
  onClose:        () => void;
  name:           string;
  reason:         string;
  onReasonChange: (v: string) => void;
  hasError:       boolean;
  onConfirm:      () => void;
  isPending:      boolean;
  isAr:           boolean;
}

export function RejectModal({ open, onClose, name, reason, onReasonChange, hasError, onConfirm, isPending, isAr }: RejectModalProps) {
  return (
    <Modal open={open} onClose={onClose}
      title={isAr ? 'رفض الإجازة' : 'Reject Leave'}
      description={name} size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
          <button type="button" onClick={onConfirm} disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                       bg-red-500 hover:bg-red-600 text-white transition-colors
                       disabled:opacity-60 disabled:cursor-not-allowed">
            {isPending ? (isAr ? 'جاري...' : 'Saving...') : (isAr ? 'تأكيد الرفض' : 'Confirm Rejection')}
          </button>
        </>
      }>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {isAr ? 'سبب الرفض' : 'Rejection Reason'}
          <span className="text-red-500 ms-1">*</span>
        </label>
        <textarea value={reason} onChange={(e) => onReasonChange(e.target.value)} rows={4}
          placeholder={isAr ? 'وضّح سبب رفض الطلب...' : 'Explain the reason for rejection...'}
          className={`${textareaCls} ${hasError
            ? 'border-red-400 focus:ring-red-300'
            : 'border-gray-200 dark:border-gray-600 focus:ring-red-300 focus:border-red-400'}`} />
        {hasError && (
          <p className="mt-1.5 text-xs text-red-500">
            {isAr ? 'سبب الرفض مطلوب' : 'Rejection reason is required'}
          </p>
        )}
      </div>
    </Modal>
  );
}
