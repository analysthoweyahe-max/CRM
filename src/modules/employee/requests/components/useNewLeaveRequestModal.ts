import { useState, useRef, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { useEmpLeaveTypes, useEmpLeaveCreate } from '../hooks/useEmployeeLeave';
import type { EmpLeaveType } from '../types/employeeLeave.types';

function getTypeName(t: EmpLeaveType, isAr: boolean): string {
  return (isAr ? (t.name ?? t.nameAr) : t.nameEn) ?? t.name ?? t.label ?? '–';
}

export function useNewLeaveRequestModal(onClose: () => void, isAr: boolean) {
  const { data: types = [] }               = useEmpLeaveTypes();
  const { mutate: create, isPending: creating } = useEmpLeaveCreate();

  const [typeId,      setTypeId]      = useState('');
  const [description, setDescription] = useState('');
  const [date,        setDate]        = useState('');
  const [file,        setFile]        = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTypeId(''); setDescription(''); setDate(''); setFile(null);
  }

  function handleClose() { reset(); onClose(); }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    e.target.value = '';
  }

  function handleSubmit() {
    if (!typeId || creating) return;
    const fd = new FormData();
    fd.append('type_id', typeId);
    if (description) fd.append('description', description);
    if (date)        fd.append('date', date);
    if (file)        fd.append('attachment', file);
    create(fd, {
      onSuccess: () => {
        toast.success(isAr ? 'تم تقديم الطلب بنجاح' : 'Request submitted successfully');
        handleClose();
      },
      onError: () => toast.error(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred'),
    });
  }

  const comboItems = (types as EmpLeaveType[]).map(t => ({
    id:    t.id,
    label: getTypeName(t, isAr),
  }));

  return {
    typeId, setTypeId,
    description, setDescription,
    date, setDate,
    file, fileRef,
    handleFile, handleSubmit, handleClose,
    creating, comboItems,
  };
}
