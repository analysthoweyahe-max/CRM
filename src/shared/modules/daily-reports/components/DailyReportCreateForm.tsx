import { Clock } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Input }  from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import {
  ReportTaskRows,
  type ReportTaskRowValue,
} from './ReportTaskRows';
import type { DailyReportTaskOption } from '../types/dailyReport.types';

interface Props {
  isAr:             boolean;
  reportDate:       string;
  setReportDate:    (v: string) => void;
  checkInAt:        string;
  setCheckInAt:     (v: string) => void;
  checkOutAt:       string;
  setCheckOutAt:    (v: string) => void;
  summaryNote:      string;
  setSummaryNote:   (v: string) => void;
  tasks:            ReportTaskRowValue[];
  taskOptions:      DailyReportTaskOption[];
  tasksLoading?:    boolean;
  addTaskRow:       () => void;
  removeTaskRow:    (id: string) => void;
  updateTaskRow:    (id: string, patch: Partial<Omit<ReportTaskRowValue, 'id'>>) => void;
  isValid:          boolean;
  isPending:        boolean;
  handleSubmit:     (e: React.FormEvent) => void;
}

export function DailyReportCreateForm({
  isAr,
  reportDate, setReportDate,
  checkInAt, setCheckInAt,
  checkOutAt, setCheckOutAt,
  summaryNote, setSummaryNote,
  tasks,
  taskOptions,
  tasksLoading,
  addTaskRow,
  removeTaskRow,
  updateTaskRow,
  isValid,
  isPending,
  handleSubmit,
}: Props) {
  return (
    <Card padding="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 text-start">
          {isAr ? 'تقرير اليوم' : "Today's Report"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-start">
              {isAr ? 'التاريخ' : 'Date'}
            </p>
            <Input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-start">
              {isAr ? 'وقت الحضور' : 'Check-in'}
            </p>
            <Input
              type="time"
              value={checkInAt}
              onChange={e => setCheckInAt(e.target.value)}
              endIcon={<Clock size={15} />}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-start">
              {isAr ? 'وقت الانصراف' : 'Check-out'}
            </p>
            <Input
              type="time"
              value={checkOutAt}
              onChange={e => setCheckOutAt(e.target.value)}
              endIcon={<Clock size={15} />}
            />
          </div>
        </div>

        <ReportTaskRows
          rows={tasks}
          taskOptions={taskOptions}
          tasksLoading={tasksLoading}
          isAr={isAr}
          onAdd={addTaskRow}
          onRemove={removeTaskRow}
          onChange={updateTaskRow}
        />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-start">
            {isAr ? 'ملخص اليوم' : 'Summary Note'}
          </p>
          <textarea
            value={summaryNote}
            onChange={e => setSummaryNote(e.target.value)}
            rows={4}
            placeholder={isAr ? 'وصف مختصر لما تم إنجازه اليوم...' : 'Brief summary of today...'}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 p-3 text-start outline-none resize-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
          />
        </div>

        <Button type="submit" isLoading={isPending} disabled={!isValid} className="px-6">
          {isAr ? 'إرسال التقرير' : 'Submit Report'}
        </Button>
      </form>
    </Card>
  );
}
