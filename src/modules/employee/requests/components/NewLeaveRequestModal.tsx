import { Calendar } from 'lucide-react';
import { Button }              from '@/shared/components/ui/Button';
import { Modal }               from '@/shared/components/ui/Modal';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import { Combobox }            from '@/shared/components/form/Combobox';
import { useNewLeaveRequestModal } from './useNewLeaveRequestModal';
import type { NewLeaveRequestModalProps } from './NewLeaveRequestModal.types';

export function NewLeaveRequestModal({ open, onClose, isAr }: NewLeaveRequestModalProps) {
  const {
    leaveType, setLeaveType,
    startDate, setStartDate,
    endDate, setEndDate,
    reason, setReason,
    content, setContent,
    handleSubmit, handleClose,
    creating, comboItems, isValid,
  } = useNewLeaveRequestModal(onClose, isAr);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isAr ? 'طلب جديد' : 'New Request'}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid}
            isLoading={creating}
          >
            {isAr ? 'تقديم الطلب' : 'Submit Request'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-1">

        <FormField label={isAr ? 'نوع الإجازة' : 'Leave Type'} required>
          <Combobox
            items={comboItems}
            value={leaveType}
            onChange={setLeaveType}
            placeholder={isAr ? 'اختر نوع الإجازة' : 'Select leave type'}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label={isAr ? 'من تاريخ' : 'Start Date'} required>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className={`${inputCls(false)} pe-10`}
              />
              <Calendar size={15} className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </FormField>

          <FormField label={isAr ? 'إلى تاريخ' : 'End Date'} required>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className={`${inputCls(false)} pe-10`}
              />
              <Calendar size={15} className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </FormField>
        </div>

        <FormField label={isAr ? 'السبب' : 'Reason'} required>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            dir="rtl"
            placeholder={isAr ? 'أكتب سبب الطلب...' : 'Enter reason...'}
            className={`${inputCls(false)} h-auto! py-3 resize-none`}
          />
        </FormField>

        <FormField label={isAr ? 'تفاصيل إضافية' : 'Additional Details'}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            dir="rtl"
            placeholder={isAr ? 'أكتب تفاصيل إضافية...' : 'Enter additional details...'}
            className={`${inputCls(false)} h-auto! py-3 resize-none`}
          />
        </FormField>

      </div>
    </Modal>
  );
}
