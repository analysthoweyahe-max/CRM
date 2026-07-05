import { useState } from 'react';
import { toast } from 'sonner';
import { useCreateDailyReport } from '../hooks/useDailyReports';

interface TaskRow {
  id:            string;
  title:         string;
  plannedHours:  string;
  actualHours:   string;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

let rowId = 0;
function newRow(): TaskRow {
  return { id: String(rowId++), title: '', plannedHours: '', actualHours: '' };
}

export function useDailyReportForm(isAr: boolean) {
  const [reportDate,  setReportDate]  = useState(today());
  const [checkInAt,   setCheckInAt]   = useState(nowTime());
  const [checkOutAt,  setCheckOutAt]  = useState('');
  const [summaryNote, setSummaryNote] = useState('');
  const [tasks,       setTasks]       = useState<TaskRow[]>([newRow()]);

  const { mutate, isPending } = useCreateDailyReport();

  function addTaskRow() {
    setTasks(prev => [...prev, newRow()]);
  }

  function removeTaskRow(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function updateTaskRow(id: string, patch: Partial<Omit<TaskRow, 'id'>>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }

  const isValid = !!checkInAt && tasks.some(t => t.title.trim());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isPending) return;

    mutate(
      {
        report_date:  reportDate,
        check_in_at:  checkInAt,
        check_out_at: checkOutAt,
        summary_note: summaryNote,
        tasks: tasks
          .filter(t => t.title.trim())
          .map(t => ({
            task_title:    t.title.trim(),
            planned_hours: Number(t.plannedHours) || 0,
            actual_hours:  Number(t.actualHours) || 0,
          })),
      },
      {
        onSuccess: () => {
          toast.success(isAr ? 'تم إرسال التقرير بنجاح' : 'Report submitted successfully');
          setSummaryNote('');
          setCheckOutAt('');
          setTasks([newRow()]);
        },
        onError: () => toast.error(isAr ? 'تعذّر إرسال التقرير' : 'Failed to submit report'),
      },
    );
  }

  return {
    reportDate, setReportDate,
    checkInAt,  setCheckInAt,
    checkOutAt, setCheckOutAt,
    summaryNote, setSummaryNote,
    tasks, addTaskRow, removeTaskRow, updateTaskRow,
    isValid, isPending, handleSubmit,
  };
}
