import { useState } from 'react';
import { toast }    from 'sonner';
import { useDailyReportCreate } from '../hooks/useDailyReports';

export function useNewDailyReportModal(onClose: () => void, isAr: boolean) {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [hours,       setHours]       = useState('');

  const { mutate: create, isPending } = useDailyReportCreate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const fd = new FormData();
    fd.append('title',        title);
    fd.append('description',  description);
    fd.append('hours_worked', hours || '0');

    create(fd, {
      onSuccess: () => {
        toast.success(isAr ? 'تم تقديم التقرير بنجاح' : 'Report submitted successfully');
        setTitle(''); setDescription(''); setHours('');
        onClose();
      },
      onError: () => toast.error(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong'),
    });
  }

  return { title, setTitle, description, setDescription, hours, setHours, isPending, handleSubmit };
}
