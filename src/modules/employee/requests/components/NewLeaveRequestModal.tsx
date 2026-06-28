import { Calendar, Paperclip } from 'lucide-react';
import { Button }              from '@/shared/components/ui/Button';
import { Modal }               from '@/shared/components/ui/Modal';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import { Combobox }            from '@/shared/components/form/Combobox';
import { useNewLeaveRequestModal } from './useNewLeaveRequestModal';
import type { NewLeaveRequestModalProps } from './NewLeaveRequestModal.types';

export function NewLeaveRequestModal({ open, onClose, isAr }: NewLeaveRequestModalProps) {
  const {
    typeId, setTypeId,
    description, setDescription,
    date, setDate,
    file, fileRef,
    handleFile, handleSubmit, handleClose,
    creating, comboItems,
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
            disabled={!typeId}
            isLoading={creating}
          >
            {isAr ? 'تقديم الطلب' : 'Submit Request'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-1">

        <FormField label={isAr ? 'نوع الطلب' : 'Request Type'} required>
          <Combobox
            items={comboItems}
            value={typeId}
            onChange={setTypeId}
            placeholder={isAr ? 'اختر نوع الطلب' : 'Select type'}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </FormField>

        <FormField label={isAr ? 'الوصف' : 'Description'}>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            dir="rtl"
            placeholder={isAr ? 'أكتب وصف الطلب...' : 'Enter description...'}
            className={`${inputCls(false)} h-auto! py-3 resize-none`}
          />
        </FormField>

        <FormField label={isAr ? 'التاريخ المرتبط' : 'Related Date'}>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={`${inputCls(false)} pe-10`}
            />
            <Calendar size={15} className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </FormField>

        <FormField label={isAr ? 'مرفقات' : 'Attachments'}>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`${inputCls(false)} flex items-center justify-between cursor-pointer`}
          >
            <Paperclip size={15} className="text-gray-400 shrink-0" />
            <span className="text-gray-400 truncate flex-1 text-end ms-2">
              {file ? file.name : (isAr ? 'ارفاق ملف ....' : 'Attach file...')}
            </span>
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        </FormField>

      </div>
    </Modal>
  );
}
