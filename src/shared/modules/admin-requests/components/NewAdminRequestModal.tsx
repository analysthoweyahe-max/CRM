import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import { Combobox } from '@/shared/components/form/Combobox';
import {
  useAdminRequestTypes,
  useCreateAdminRequest,
} from '../hooks/useAdminRequests';
import {
  ADMIN_REQUEST_TYPE_LABELS,
  type AdminRequestNamespace,
  type AdminRequestType,
} from '../types/adminRequest.types';

interface Props {
  open:      boolean;
  onClose:   () => void;
  isAr:      boolean;
  namespace: AdminRequestNamespace;
}

const FALLBACK_TYPES: AdminRequestType[] = ['leave', 'permission', 'support', 'other'];

export function NewAdminRequestModal({ open, onClose, isAr, namespace }: Props) {
  const { data: types = [] } = useAdminRequestTypes(namespace);
  const createMutation = useCreateAdminRequest(namespace, isAr);

  const [requestType, setRequestType] = useState('');
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');

  const comboItems = (types.length
    ? types.map((t) => ({ id: t.value, label: t.label }))
    : FALLBACK_TYPES.map((t) => ({
        id: t,
        label: isAr ? ADMIN_REQUEST_TYPE_LABELS[t].ar : ADMIN_REQUEST_TYPE_LABELS[t].en,
      }))
  );

  const isValid =
    !!requestType &&
    title.trim().length > 0 &&
    (!startDate || !endDate || endDate >= startDate);

  function reset() {
    setRequestType('');
    setTitle('');
    setDescription('');
    setRequestDate('');
    setStartDate('');
    setEndDate('');
  }

  function handleClose() {
    if (createMutation.isPending) return;
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!isValid || createMutation.isPending) return;
    createMutation.mutate(
      {
        request_type: requestType,
        title:        title.trim(),
        description:  description.trim() || undefined,
        request_date: requestDate || undefined,
        start_date:   startDate || undefined,
        end_date:     endDate || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isAr ? 'طلب إداري جديد' : 'New Admin Request'}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={createMutation.isPending}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid}
            isLoading={createMutation.isPending}
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
            value={requestType}
            onChange={setRequestType}
            placeholder={isAr ? 'اختر نوع الطلب' : 'Select request type'}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </FormField>

        <FormField label={isAr ? 'العنوان' : 'Title'} required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls(false)}
            placeholder={isAr ? 'مثال: إذن خروج ساعة' : 'e.g. One-hour permission'}
          />
        </FormField>

        <FormField label={isAr ? 'الوصف' : 'Description'}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputCls(false)} h-auto! py-3 resize-none`}
            placeholder={isAr ? 'تفاصيل إضافية (اختياري)' : 'Optional details'}
          />
        </FormField>

        <FormField label={isAr ? 'تاريخ الطلب' : 'Request Date'}>
          <div className="relative">
            <input
              type="date"
              value={requestDate}
              onChange={(e) => setRequestDate(e.target.value)}
              className={`${inputCls(false)} pe-10`}
            />
            <Calendar size={15} className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label={isAr ? 'من تاريخ' : 'Start Date'}>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`${inputCls(false)} pe-10`}
              />
              <Calendar size={15} className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </FormField>
          <FormField label={isAr ? 'إلى تاريخ' : 'End Date'}>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`${inputCls(false)} pe-10`}
              />
              <Calendar size={15} className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </FormField>
        </div>
      </div>
    </Modal>
  );
}
