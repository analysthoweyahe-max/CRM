import { useState } from 'react';
import { toast } from 'sonner';
import {
  CUSTOM_TASK_VALUE,
  type ReportTaskRowValue,
} from '../components/ReportTaskRows';
import type {
  CreateDailyReportPayload,
  DailyReportTaskOption,
} from '../types/dailyReport.types';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

let rowId = 0;
export function newTaskRow(): ReportTaskRowValue {
  return {
    id:           String(++rowId),
    source:       CUSTOM_TASK_VALUE,
    taskId:       null,
    title:        '',
    plannedHours: '',
    actualHours:  '',
  };
}

interface Options {
  isAr:               boolean;
  taskOptions:        DailyReportTaskOption[];
  tasksLoading?:      boolean;
  isPending:          boolean;
  create:             (
    payload: CreateDailyReportPayload,
    handlers: { onSuccess: () => void; onError: () => void },
  ) => void;
}

export function useDailyReportCreateForm({
  isAr,
  taskOptions,
  tasksLoading = false,
  isPending,
  create,
}: Options) {
  const [reportDate,  setReportDate]  = useState(today());
  const [checkInAt,   setCheckInAt]   = useState(nowTime());
  const [checkOutAt,  setCheckOutAt]  = useState('');
  const [summaryNote, setSummaryNote] = useState('');
  const [tasks,       setTasks]       = useState<ReportTaskRowValue[]>([newTaskRow()]);

  function addTaskRow() {
    setTasks(prev => [...prev, newTaskRow()]);
  }

  function removeTaskRow(id: string) {
    setTasks(prev => (prev.length <= 1 ? prev : prev.filter(t => t.id !== id)));
  }

  function updateTaskRow(id: string, patch: Partial<Omit<ReportTaskRowValue, 'id'>>) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  }

  const isValid = !!checkInAt && tasks.some(t => t.title.trim());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isPending) return;

    const payload: CreateDailyReportPayload = {
      report_date:  reportDate,
      check_in_at:  checkInAt,
      check_out_at: checkOutAt,
      summary_note: summaryNote,
      tasks: tasks
        .filter(t => t.title.trim())
        .map(t => {
          const base = {
            task_title:    t.title.trim(),
            planned_hours: Number(t.plannedHours) || 0,
            actual_hours:  Number(t.actualHours) || 0,
          };
          if (t.taskId != null && t.source !== CUSTOM_TASK_VALUE) {
            return { ...base, task_id: t.taskId };
          }
          return base;
        }),
    };

    create(payload, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إرسال التقرير بنجاح' : 'Report submitted successfully');
        setSummaryNote('');
        setCheckOutAt('');
        setTasks([newTaskRow()]);
      },
      onError: () => toast.error(isAr ? 'تعذّر إرسال التقرير' : 'Failed to submit report'),
    });
  }

  return {
    reportDate, setReportDate,
    checkInAt, setCheckInAt,
    checkOutAt, setCheckOutAt,
    summaryNote, setSummaryNote,
    tasks, addTaskRow, removeTaskRow, updateTaskRow,
    taskOptions, tasksLoading,
    isValid, isPending, handleSubmit,
  };
}
