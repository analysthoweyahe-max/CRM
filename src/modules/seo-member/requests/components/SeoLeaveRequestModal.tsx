import { Calendar, Paperclip }    from 'lucide-react';
import { Button }                  from '@/shared/components/ui/Button';
import { Modal }                   from '@/shared/components/ui/Modal';
import { FormField, inputCls }     from '@/shared/components/form/FormField';
import { Combobox }                from '@/shared/components/form/Combobox';
import { useSeoLeaveRequestModal } from './useSeoLeaveRequestModal';
import type { SeoLeaveRequestModalProps } from './SeoLeaveRequestModal.types';

export function SeoLeaveRequestModal({ open, onClose, isAr }: SeoLeaveRequestModalProps) {
  const {
    leaveType, setLeaveType,
    reason, setReason,
    startDate, setStartDate,
    endDate, setEndDate,
    file, fileRef,
    handleFile, handleSubmit, handleClose,
    creating, comboItems, isValid,
  } = useSeoLeaveRequestModal(onClose, isAr);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isAr ? 'طلب إجازة جديد' : 'New Leave Request'}
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

        {/* Leave type */}
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

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label={isAr ? 'من تاريخ' : 'From'} required>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                max={endDate || undefined}
                className={`${inputCls(false)} pe-10`}
              />
              <Calendar size={15} className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </FormField>
          <FormField label={isAr ? 'إلى تاريخ' : 'To'} required>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate || undefined}
                className={`${inputCls(false)} pe-10`}
              />
              <Calendar size={15} className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </FormField>
        </div>

        {/* Reason */}
        <FormField label={isAr ? 'السبب' : 'Reason'} required>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            dir="rtl"
            placeholder={isAr ? 'اكتب سبب الإجازة...' : 'Enter reason...'}
            className={`${inputCls(false)} h-auto! py-3 resize-none`}
          />
        </FormField>

        {/* Attachment */}
        <FormField label={isAr ? 'مرفقات' : 'Attachments'}>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`${inputCls(false)} flex items-center justify-between cursor-pointer`}
          >
            <Paperclip size={15} className="text-gray-400 shrink-0" />
            <span className="text-gray-400 truncate flex-1 text-end ms-2">
              {file ? file.name : (isAr ? 'ارفاق ملف...' : 'Attach file...')}
            </span>
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        </FormField>

      </div>
    </Modal>
  );
}
