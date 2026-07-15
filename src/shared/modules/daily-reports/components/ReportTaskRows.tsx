import { Plus, Trash2, PencilLine } from 'lucide-react';
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
      id:     CUSTOM_TASK_VALUE,
      label:  isAr ? 'مهمة مخصصة' : 'Custom task',
      // Keep helper in the dropdown list only — not mashed into the closed trigger.
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
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-start">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {isAr ? 'المهام' : 'Tasks'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {isAr
              ? 'اختر من مهامك أو أضف مهمة مخصصة بالاسم'
              : 'Pick from your tasks or add a custom one by name'}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" startIcon={<Plus size={14} />} onClick={onAdd}>
          {isAr ? 'إضافة مهمة' : 'Add Task'}
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-600 px-4 py-8 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {isAr ? 'لم تُضف أي مهام بعد' : 'No tasks added yet'}
          </p>
          <Button type="button" variant="secondary" size="sm" className="mt-3" startIcon={<Plus size={14} />} onClick={onAdd}>
            {isAr ? 'إضافة أول مهمة' : 'Add first task'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, index) => {
            const isCustom = row.source === CUSTOM_TASK_VALUE || !row.source;
            return (
              <div
                key={row.id}
                className="rounded-xl border border-gray-100 dark:border-gray-700/80 bg-white dark:bg-gray-800/60 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                    {isAr ? `مهمة ${index + 1}` : `Task ${index + 1}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => onRemove(row.id)}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label={isAr ? 'حذف' : 'Remove'}
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">{isAr ? 'حذف' : 'Remove'}</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                    {isAr ? 'المصدر' : 'Source'}
                  </p>
                  <Combobox
                    items={items}
                    value={row.source || CUSTOM_TASK_VALUE}
                    onChange={v => handleSourceChange(row, v)}
                    disabled={tasksLoading}
                    placeholder={isAr ? 'اختر من مهامي أو مخصص' : 'From my tasks or custom'}
                    searchPlaceholder={isAr ? 'بحث…' : 'Search…'}
                    noResultsText={isAr ? 'لا نتائج' : 'No results'}
                    triggerShowsDetail={false}
                  />
                </div>

                {isCustom ? (
                  <div className="space-y-1.5 rounded-lg border border-dashed border-brand-300/60 dark:border-[#A0CD39]/30 bg-brand-50/40 dark:bg-[#A0CD39]/5 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-brand-700 dark:text-[#A0CD39]">
                      <PencilLine size={13} />
                      {isAr ? 'اسم المهمة المخصصة' : 'Custom task name'}
                    </div>
                    <Input
                      placeholder={isAr ? 'مثال: مراجعة محتوى الصفحة الرئيسية' : 'e.g. Homepage content review'}
                      value={row.title}
                      onChange={e => onChange(row.id, { title: e.target.value, taskId: null })}
                      autoFocus
                    />
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 text-start">
                      {isAr
                        ? 'استخدم هذا عندما تكون المهمة غير موجودة في قائمتك'
                        : 'Use this when the task is not in your list'}
                    </p>
                  </div>
                ) : row.title ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-start rounded-lg bg-gray-50 dark:bg-gray-700/40 px-3 py-2">
                    <span className="text-xs text-gray-400 me-2">{isAr ? 'العنوان:' : 'Title:'}</span>
                    {row.title}
                  </p>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                      {isAr ? 'الساعات المخططة' : 'Planned hours'}
                    </p>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="0"
                      value={row.plannedHours}
                      onChange={e => onChange(row.id, { plannedHours: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                      {isAr ? 'الساعات الفعلية' : 'Actual hours'}
                    </p>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="0"
                      value={row.actualHours}
                      onChange={e => onChange(row.id, { actualHours: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
