import { useState, useRef, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { useSeoLeaveTypes, useSeoLeaveCreate } from '../hooks/useSeoLeave';

export function useSeoLeaveRequestModal(onClose: () => void, isAr: boolean) {
  const { data: types = [] }                  = useSeoLeaveTypes();
  const { mutate: create, isPending: creating } = useSeoLeaveCreate();

  const [leaveType,  setLeaveType]  = useState('');
  const [reason,     setReason]     = useState('');
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');
  const [file,       setFile]       = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setLeaveType(''); setReason(''); setStartDate(''); setEndDate(''); setFile(null);
  }

  function handleClose() { reset(); onClose(); }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    e.target.value = '';
  }

  function handleSubmit() {
    const trimmedReason = reason.trim();
    if (!leaveType || !startDate || !endDate || !trimmedReason || creating) return;

    const onSuccess = () => {
      toast.success(isAr ? 'تم تقديم طلب الإجازة بنجاح' : 'Leave request submitted');
      handleClose();
    };
    const onError = () => toast.error(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred');

    if (file) {
      const fd = new FormData();
      fd.append('leave_type', leaveType);
      fd.append('start_date', startDate);
      fd.append('end_date',   endDate);
      fd.append('reason', trimmedReason);
      fd.append('attachment', file);
      create(fd, { onSuccess, onError });
    } else {
      const body: Record<string, string> = {
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: trimmedReason,
      };
      create(body, { onSuccess, onError });
    }
  }

  const comboItems = types.map(t => ({ id: t.value, label: t.label }));

  const isValid = !!leaveType && !!startDate && !!endDate && !!reason.trim();

  return {
    leaveType, setLeaveType,
    reason, setReason,
    startDate, setStartDate,
    endDate, setEndDate,
    file, fileRef,
    handleFile, handleSubmit, handleClose,
    creating, comboItems, isValid,
  };
}
