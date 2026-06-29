import { useState } from 'react';
import { toast }    from 'sonner';
import { usePlannedTasks, useSubmitStartDay } from '../hooks/useDailyReports';

export function useStartDayForm(isAr: boolean) {
  const { data: tasks = [], isLoading } = usePlannedTasks();
  const [hours,     setHoursMap] = useState<Record<string, number>>({});
  const [notes,     setNotes]    = useState('');
  const { mutate, isPending }    = useSubmitStartDay();

  function setTaskHours(id: string, val: number) {
    setHoursMap(prev => ({ ...prev, [id]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(
      { tasks: tasks.map(t => ({ id: t.id, hours: hours[t.id] ?? 0 })), notes },
      {
        onSuccess: () => toast.success(isAr ? 'تم حفظ التقرير' : 'Report saved'),
        onError:   () => toast.error(isAr ? 'حدث خطأ' : 'Something went wrong'),
      },
    );
  }

  return { tasks, isLoading, hours, setTaskHours, notes, setNotes, isPending, handleSubmit };
}
