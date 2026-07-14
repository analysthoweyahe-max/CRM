import { Plus, Trash2 } from 'lucide-react';
import { Combobox } from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { Input }  from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { DailyReportTaskOption } from '../types/dailyReport.types';

export const CUSTOM_TASK_VALUE = '__custom__';

export interface ReportTaskRowValue {
  /** Local row key (not backend id). */
  id:           string;
  /** Selected my-task id, or CUSTOM_TASK_VALUE for free text. */
  source:       string;
  taskId:       number | null;
  title:        string;
  plannedHours: string;
  actualHours:  string;
}

interface Props {
  rows:             ReportTaskRowValue[];
  taskOptions:      DailyReportTaskOption[];
  tasksLoading?:    boolean;
  isAr:             boolean;
  onAdd:            () => void;
  onRemove:         (id: string) => void;
  onChange:         (id: string, patch: Partial<Omit<ReportTaskRowValue, 'id'>>) => void;
}

export function ReportTaskRows({
  rows,
  taskOptions,
  tasksLoading = false,
  isAr,
  onAdd,
  onRemove,
  onChange,
}: Props) {
  const items: ComboboxItem[] = [
    {
      id:    CUSTOM_TASK_VALUE,
      label: isAr ? 'مهمة مخصصة' : 'Custom task',
      detail: isAr ? 'اكتب الاسم يدوياً' : 'Type a title',
    },
    ...taskOptions.map(t => ({
      id:     String(t.id),
      label:  t.title,
      detail: t.meta,
    })),
  ];

  function handleSourceChange(row: ReportTaskRowValue, source: string) {
    if (source === CUSTOM_TASK_VALUE) {
      onChange(row.id, { source, taskId: null, title: '' });
      return;
    }
    const opt = taskOptions.find(t => String(t.id) === source);
    onChange(row.id, {
      source,
      taskId: opt?.id ?? null,
      title:  opt?.title ?? '',
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-start">
          {isAr ? 'المهام' : 'Tasks'}
        </p>
        <Button type="button" variant="ghost" size="sm" startIcon={<Plus size={14} />} onClick={onAdd}>
          {isAr ? 'إضافة مهمة' : 'Add Task'}
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map(row => {
          const isCustom = row.source === CUSTOM_TASK_VALUE || !row.source;
          return (
            <div
              key={row.id}
              className="rounded-xl border border-gray-100 dark:border-gray-700/80 bg-gray-50/60 dark:bg-gray-800/40 p-3 space-y-2"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <Combobox
                    items={items}
                    value={row.source || CUSTOM_TASK_VALUE}
                    onChange={v => handleSourceChange(row, v)}
                    disabled={tasksLoading}
                    placeholder={isAr ? 'اختر من مهامي أو مخصص' : 'From my tasks or custom'}
                    searchPlaceholder={isAr ? 'بحث…' : 'Search…'}
                    noResultsText={isAr ? 'لا نتائج' : 'No results'}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(row.id)}
                  className="shrink-0 w-9 h-9 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors"
                  aria-label={isAr ? 'حذف' : 'Remove'}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {isCustom && (
                <Input
                  placeholder={isAr ? 'اسم المهمة' : 'Task name'}
                  value={row.title}
                  onChange={e => onChange(row.id, { title: e.target.value, taskId: null })}
                />
              )}

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  className="flex-1"
                  placeholder={isAr ? 'مخطط (س)' : 'Planned (h)'}
                  value={row.plannedHours}
                  onChange={e => onChange(row.id, { plannedHours: e.target.value })}
                />
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  className="flex-1"
                  placeholder={isAr ? 'فعلي (س)' : 'Actual (h)'}
                  value={row.actualHours}
                  onChange={e => onChange(row.id, { actualHours: e.target.value })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
