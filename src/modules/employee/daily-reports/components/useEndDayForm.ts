import { useState } from 'react';
import { toast }    from 'sonner';
import { useWorkedTasks, useSubmitEndDay } from '../hooks/useDailyReports';

export function useEndDayForm(isAr: boolean) {
  const { data: tasks = [], isLoading } = useWorkedTasks();
  const [reflection, setReflection]    = useState('');
  const { mutate, isPending }          = useSubmitEndDay();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(
      { tasks: tasks.map(t => ({ id: t.id, hours: t.actualHours })), reflection },
      {
        onSuccess: () => toast.success(isAr ? 'تم الإرسال للمدير' : 'Sent to manager'),
        onError:   () => toast.error(isAr ? 'حدث خطأ' : 'Something went wrong'),
      },
    );
  }

  return { tasks, isLoading, reflection, setReflection, isPending, handleSubmit };
}
