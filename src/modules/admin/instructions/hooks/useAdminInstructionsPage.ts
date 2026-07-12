import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import { useEmployeeList } from '@/modules/hr/employees/hooks/useEmployeeList';
import { useQuery } from '@tanstack/react-query';
import { useInstructionsList, useSendInstruction } from './useAdminInstructions';
import type { InstructionAudienceType } from '../types/instruction.types';

export function useAdminInstructionsPage(isAr: boolean) {
  const { data: page, isLoading: loadingHistory } = useInstructionsList();
  const { mutate: send, isPending: sending } = useSendInstruction();

  const [title,        setTitle]        = useState('');
  const [body,         setBody]         = useState('');
  const [audienceType, setAudienceType] = useState<InstructionAudienceType>('all');
  const [departmentId, setDepartmentId] = useState('');
  const [employeeId,   setEmployeeId]   = useState('');

  const { data: departments = [] } = useQuery({
    queryKey: ['lookups', 'departments'],
    queryFn:  () => employeeApi.lookupDepartments().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
  const { data: employees = [] } = useEmployeeList();

  const departmentItems = departments.map((d) => ({ id: String(d.id), label: isAr ? (d.nameAr || d.name) : d.name }));
  const employeeItems   = (employees ?? []).map((e) => ({ id: e.id, label: e.name, detail: e.jobTitle?.name ?? undefined }));

  const isValid = !!(
    title.trim() && body.trim() &&
    (audienceType === 'all' || audienceType === 'managers' || (audienceType === 'department' && departmentId) || (audienceType === 'employee' && employeeId))
  );

  function reset() {
    setTitle('');
    setBody('');
    setAudienceType('all');
    setDepartmentId('');
    setEmployeeId('');
  }

  function submit() {
    if (!isValid || sending) return;
    send({
      title: title.trim(),
      body:  body.trim(),
      audience_type: audienceType,
      ...(audienceType === 'department' ? { department_id: Number(departmentId) } : {}),
      ...(audienceType === 'employee'   ? { employee_id: employeeId } : {}),
    }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إرسال التعليمات بنجاح' : 'Instruction sent successfully');
        reset();
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  return {
    title, setTitle,
    body, setBody,
    audienceType, setAudienceType: (v: InstructionAudienceType) => { setAudienceType(v); setDepartmentId(''); setEmployeeId(''); },
    departmentId, setDepartmentId,
    employeeId, setEmployeeId,
    departmentItems, employeeItems,
    isValid, sending, submit,
    history: page?.data ?? [],
    loadingHistory,
  };
}
