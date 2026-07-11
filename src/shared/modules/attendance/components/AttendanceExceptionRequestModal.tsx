import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import { Combobox } from '@/shared/components/form/Combobox';
import { extractApiError } from '@/shared/utils/error.utils';
import { queryKeys } from '@/shared/constants/queryKeys';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import { attendanceExceptionApi } from '../api/attendanceException.api';
import {
  EXCEPTION_TYPE_LABELS,
  type ExceptionRequestType,
} from '../types/attendanceException.types';

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Props {
  open:         boolean;
  onClose:      () => void;
  isAr:         boolean;
  defaultType?: ExceptionRequestType;
  defaultDate?: string;
  /** When true, admin picks an employee and uses the HR create endpoint */
  forEmployee?: boolean;
}

export function AttendanceExceptionRequestModal({
  open, onClose, isAr, defaultType, defaultDate, forEmployee = false,
}: Props) {
  const qc = useQueryClient();
  const [employeeId, setEmployeeId] = useState('');
  const [workDate, setWorkDate]             = useState(defaultDate ?? todayISO());
  const [requestType, setRequestType]       = useState<ExceptionRequestType>(defaultType ?? 'early_start');
  const [reason, setReason]                 = useState('');

  useEffect(() => {
    if (!open) return;
    setEmployeeId('');
    setWorkDate(defaultDate ?? todayISO());
    setRequestType(defaultType ?? 'early_start');
    setReason('');
  }, [open, defaultDate, defaultType]);

  const { data: empList } = useQuery({
    queryKey: ['employees', 'list-all'],
    queryFn:  () => employeeApi.list({ per_page: 100 }).then((r) => r.data.data.data),
    enabled:  forEmployee && open,
  });

  const empItems = (empList ?? []).map((e) => ({
    id:    e.id,
    label: e.employeeNumber ? `${e.name} (${e.employeeNumber})` : e.name,
  }));

  const typeItems = (Object.keys(EXCEPTION_TYPE_LABELS) as ExceptionRequestType[]).map((t) => ({
    id:    t,
    label: isAr ? EXCEPTION_TYPE_LABELS[t].ar : EXCEPTION_TYPE_LABELS[t].en,
  }));

  const mutation = useMutation({
    mutationFn: () => {
      const base = {
        work_date:    workDate,
        request_type: requestType,
        reason:       reason.trim(),
      };
      if (forEmployee) {
        return attendanceExceptionApi.hrCreate({ ...base, employee_id: employeeId });
      }
      return attendanceExceptionApi.create(base);
    },
    onSuccess: () => {
      if (forEmployee) {
        qc.invalidateQueries({ queryKey: ['attendance', 'exceptions', 'hr'] });
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.attendance.exceptions.employee() });
      }
      toast.success(isAr ? 'تم تقديم الطلب بنجاح' : 'Request submitted');
      handleClose();
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  function handleClose() {
    setReason('');
    setEmployeeId('');
    onClose();
  }

  const isValid =
    workDate &&
    requestType &&
    reason.trim().length >= 3 &&
    (!forEmployee || !!employeeId);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isAr ? 'طلب استثناء حضور' : 'Attendance Exception Request'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
          <Button
            variant="primary"
            onClick={() => mutation.mutate()}
            disabled={!isValid}
            isLoading={mutation.isPending}
          >
            {isAr ? 'تقديم الطلب' : 'Submit Request'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-1">
        {forEmployee && (
          <FormField label={isAr ? 'الموظف' : 'Employee'} required>
            <Combobox
              items={empItems}
              value={employeeId}
              onChange={setEmployeeId}
              placeholder={isAr ? 'اختر الموظف' : 'Select employee'}
              searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
              noResultsText={isAr ? 'لا نتائج' : 'No results'}
            />
          </FormField>
        )}

        <FormField label={isAr ? 'تاريخ العمل' : 'Work Date'} required>
          <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} className={inputCls(false)} />
        </FormField>

        <FormField label={isAr ? 'نوع الطلب' : 'Request Type'} required>
          <Combobox
            items={typeItems}
            value={requestType}
            onChange={(v) => setRequestType(v as ExceptionRequestType)}
            placeholder={isAr ? 'اختر النوع' : 'Select type'}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </FormField>

        <FormField label={isAr ? 'السبب' : 'Reason'} required>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder={isAr ? 'اشرح سبب الطلب...' : 'Explain the reason...'}
            className={`${inputCls(false)} resize-none`}
          />
        </FormField>
      </div>
    </Modal>
  );
}
