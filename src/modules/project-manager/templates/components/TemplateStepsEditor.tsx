import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import type { PmTemplateStep } from '../types/template.types';

const INPUT = [
  'w-full rounded-lg border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
].join(' ');

interface Props {
  steps:    PmTemplateStep[];
  onChange: (steps: PmTemplateStep[]) => void;
  isAr:     boolean;
}

export function TemplateStepsEditor({ steps, onChange, isAr }: Props) {
  function update(index: number, patch: Partial<PmTemplateStep>) {
    onChange(steps.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function add() {
    onChange([...steps, { title: '', description: '', sortOrder: steps.length }]);
  }

  function remove(index: number) {
    onChange(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, sortOrder: i })));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((s, i) => ({ ...s, sortOrder: i })));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button variant="secondary" startIcon={<Plus size={14} />} onClick={add}>
          {isAr ? 'إضافة مرحلة' : 'Add Step'}
        </Button>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {isAr ? 'مراحل القالب' : 'Template Steps'}
          <span className="text-red-500 ms-1">*</span>
        </label>
      </div>

      {steps.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          {isAr ? 'أضف مرحلة واحدة على الأقل' : 'Add at least one step'}
        </p>
      ) : (
        <ul className="space-y-3">
          {steps.map((step, index) => (
            <li
              key={index}
              className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400 dark:text-gray-500 shrink-0">
                  <GripVertical size={16} />
                </span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">
                  {index + 1}
                </span>
                <input
                  value={step.title}
                  onChange={(e) => update(index, { title: e.target.value })}
                  placeholder={isAr ? 'عنوان المرحلة' : 'Step title'}
                  className={INPUT}
                />
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="icon" aria-label={isAr ? 'أعلى' : 'Move up'} onClick={() => move(index, -1)} disabled={index === 0}>
                    <ArrowUp size={14} />
                  </Button>
                  <Button variant="icon" aria-label={isAr ? 'أسفل' : 'Move down'} onClick={() => move(index, 1)} disabled={index === steps.length - 1}>
                    <ArrowDown size={14} />
                  </Button>
                  <Button variant="icon-danger" aria-label={isAr ? 'حذف' : 'Remove'} onClick={() => remove(index)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <textarea
                rows={2}
                value={step.description ?? ''}
                onChange={(e) => update(index, { description: e.target.value })}
                placeholder={isAr ? 'وصف المرحلة (اختياري)' : 'Step description (optional)'}
                className={`${INPUT} resize-none`}
                dir={isAr ? 'rtl' : 'ltr'}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
