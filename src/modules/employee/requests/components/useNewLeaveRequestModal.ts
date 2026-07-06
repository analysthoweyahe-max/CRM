import { useState } from 'react';
import { toast } from 'sonner';
import { useEmpLeaveTypes, useEmpLeaveCreate } from '../hooks/useEmployeeLeave';

export function useNewLeaveRequestModal(onClose: () => void, isAr: boolean) {
  const { data: types = [] }                   = useEmpLeaveTypes();
  const { mutate: create, isPending: creating } = useEmpLeaveCreate();

  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [reason,    setReason]    = useState('');
  const [content,   setContent]   = useState('');

  function reset() {
    setLeaveType(''); setStartDate(''); setEndDate(''); setReason(''); setContent('');
  }

  function handleClose() { reset(); onClose(); }

  const isValid = !!leaveType && !!startDate && !!endDate && !!reason.trim();

  function handleSubmit() {
    if (!isValid || creating) return;
    create(
      {
        leave_type: leaveType,
        start_date: startDate,
        end_date:   endDate,
        reason:     reason.trim(),
        content:    content.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(isAr ? 'تم تقديم الطلب بنجاح' : 'Request submitted successfully');
          handleClose();
        },
        onError: () => toast.error(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred'),
      },
    );
  }

  const comboItems = types.map(t => ({ id: t.value, label: t.label }));

  return {
    leaveType, setLeaveType,
    startDate, setStartDate,
    endDate, setEndDate,
    reason, setReason,
    content, setContent,
    handleSubmit, handleClose,
    creating, comboItems, isValid,
  };
}
