import { Plus, Trash2, Clock } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Input }  from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useDailyReportForm } from './useDailyReportForm';

interface Props { isAr: boolean }

export function DailyReportForm({ isAr }: Props) {
  const {
    reportDate,  setReportDate,
    checkInAt,   setCheckInAt,
    checkOutAt,  setCheckOutAt,
    summaryNote, setSummaryNote,
    tasks, addTaskRow, removeTaskRow, updateTaskRow,
    isValid, isPending, handleSubmit,
  } = useDailyReportForm(isAr);

  return (
    <Card padding="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 text-start">
          {isAr ? 'تقرير اليوم' : "Today's Report"}
        </h2>

        {/* Date + times */}
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
            <Input type="time" value={checkInAt} onChange={e => setCheckInAt(e.target.value)} endIcon={<Clock size={15} />} />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-start">
              {isAr ? 'وقت الانصراف' : 'Check-out'}
            </p>
            <Input type="time" value={checkOutAt} onChange={e => setCheckOutAt(e.target.value)} endIcon={<Clock size={15} />} />
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-start">
              {isAr ? 'المهام' : 'Tasks'}
            </p>
            <Button type="button" variant="ghost" size="sm" startIcon={<Plus size={14} />} onClick={addTaskRow}>
              {isAr ? 'إضافة مهمة' : 'Add Task'}
            </Button>
          </div>

          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  placeholder={isAr ? 'اسم المهمة' : 'Task name'}
                  value={task.title}
                  onChange={e => updateTaskRow(task.id, { title: e.target.value })}
                />
                <Input
                  type="number" min={0} step={0.5}
                  className="w-24"
                  placeholder={isAr ? 'مخطط' : 'Planned'}
                  value={task.plannedHours}
                  onChange={e => updateTaskRow(task.id, { plannedHours: e.target.value })}
                />
                <Input
                  type="number" min={0} step={0.5}
                  className="w-24"
                  placeholder={isAr ? 'فعلي' : 'Actual'}
                  value={task.actualHours}
                  onChange={e => updateTaskRow(task.id, { actualHours: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeTaskRow(task.id)}
                  className="shrink-0 w-9 h-9 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary note */}
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
