import { useEffect, useState } from 'react';
import { Check, PlayCircle } from 'lucide-react';
import { toast }    from 'sonner';
import { useLang }  from '@/app/providers/LanguageProvider';
import { Card }     from '@/shared/components/ui/Card';
import {
  useOvertimeSettings,
  useUpdateOvertimeSettings,
  useProcessOvertime,
} from '../hooks/useBonuses';

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const fieldCls = `w-full rounded-lg border border-gray-200 dark:border-gray-600
  bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100
  px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400
  focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition`;

export function OvertimeSettings() {
  const { lang, isRTL } = useLang();
  const isAr = lang === 'ar';

  const { data }                                   = useOvertimeSettings();
  const { mutate: save,    isPending: saving }      = useUpdateOvertimeSettings();
  const { mutate: process, isPending: processing }  = useProcessOvertime();

  const [enabled,          setEnabled]          = useState(true);
  const [thresholdMinutes, setThresholdMinutes] = useState(30);
  const [rateMultiplier,   setRateMultiplier]   = useState(1.5);
  const [monthlyWorkHours, setMonthlyWorkHours] = useState(176);
  const [processMonth,     setProcessMonth]     = useState(currentMonth());

  useEffect(() => {
    if (!data) return;
    setEnabled(data.enabled);
    setThresholdMinutes(data.thresholdMinutes);
    setRateMultiplier(data.rateMultiplier);
    setMonthlyWorkHours(data.monthlyWorkHours);
  }, [data]);

  function handleSave() {
    save(
      {
        enabled,
        thresholdMinutes,
        rateMultiplier,
        monthlyWorkHours,
      },
      {
        onSuccess: () => toast.success(isAr ? 'تم حفظ الإعدادات' : 'Settings saved'),
        onError:   () => toast.error(isAr ? 'تعذّر حفظ الإعدادات' : 'Failed to save settings'),
      },
    );
  }

  function handleProcess() {
    process(processMonth, {
      onSuccess: (res) => {
        const count = res.data.data.count;
        toast.success(
          isAr
            ? `تم الاحتساب — ${count} ${count === 1 ? 'سجل' : 'سجلات'}`
            : `Processed — ${count} record${count === 1 ? '' : 's'}`,
        );
      },
      onError: () => toast.error(isAr ? 'تعذّر احتساب العمل الإضافي' : 'Failed to process overtime'),
    });
  }

  return (
    <Card>
      <div className="p-5 space-y-4">

        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'إعدادات الساعات الإضافية' : 'Overtime Settings'}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {isAr ? 'احتساب الإضافي تلقائياً من سجلات الحضور' : 'Auto-calculate overtime from attendance records'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {isAr ? 'مضاعف الأجر' : 'Rate Multiplier'}
            </label>
            <input type="number" min={1} step={0.25} value={rateMultiplier} disabled={!enabled}
              onChange={(e) => setRateMultiplier(Number(e.target.value))} className={fieldCls} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {isAr ? 'حد الدقائق قبل الاحتساب' : 'Threshold (minutes)'}
            </label>
            <input type="number" min={0} value={thresholdMinutes} disabled={!enabled}
              onChange={(e) => setThresholdMinutes(Number(e.target.value))} className={fieldCls} />
          </div>

          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {isAr ? 'ساعات العمل الشهرية الأساسية' : 'Base Monthly Work Hours'}
            </label>
            <input type="number" min={1} value={monthlyWorkHours} disabled={!enabled}
              onChange={(e) => setMonthlyWorkHours(Number(e.target.value))} className={fieldCls} />
          </div>
        </div>

        {/* Toggle + Save */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {isAr ? 'تفعيل الإضافي' : 'Enable Overtime'}
            </span>
            <button type="button" onClick={() => setEnabled((p) => !p)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                enabled ? 'bg-[#A0CD39]' : 'bg-gray-200 dark:bg-gray-600'
              }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                isRTL
                  ? (enabled ? '-translate-x-6' : '-translate-x-1')
                  : (enabled ? 'translate-x-6'  : 'translate-x-1')
              }`} />
            </button>
          </div>

          <button type="button" onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                       border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800
                       hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold
                       text-gray-800 dark:text-gray-200 transition-colors disabled:opacity-60">
            <Check size={15} className="text-gray-400" />
            {isAr ? (saving ? 'جاري...' : 'حفظ') : (saving ? 'Saving...' : 'Save')}
          </button>
        </div>

        {enabled && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isAr
              ? `يحتسب الإضافي بعد ${thresholdMinutes} دقيقة زيادة عن أجر الساعة بمعدل ×${rateMultiplier} (على أساس ${monthlyWorkHours} ساعة عمل شهرياً).`
              : `Overtime is calculated after a ${thresholdMinutes}-minute threshold at ×${rateMultiplier} the hourly rate (based on ${monthlyWorkHours} monthly work hours).`}
          </p>
        )}

        {/* Process overtime for a given month */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {isAr ? 'احتساب العمل الإضافي عن شهر' : 'Process overtime for a month'}
          </label>
          <div className="flex items-center gap-2">
            <input type="month" value={processMonth}
              onChange={(e) => setProcessMonth(e.target.value)} className={fieldCls} />
            <button type="button" onClick={handleProcess} disabled={processing}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                         bg-[#A0CD39] hover:bg-[#90BA33] text-gray-900 text-sm font-semibold
                         transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              <PlayCircle size={15} />
              {isAr ? (processing ? 'جاري...' : 'احتساب') : (processing ? 'Processing...' : 'Process')}
            </button>
          </div>
        </div>

      </div>
    </Card>
  );
}
