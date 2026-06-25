import { useEffect, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { toast }    from 'sonner';
import { useLang }  from '@/app/providers/LanguageProvider';
import { Card }     from '@/shared/components/ui/Card';
import {
  useOvertimeSettings,
  useUpdateOvertimeSettings,
} from '../hooks/useBonuses';

const MULTIPLIER_OPT = ['×1.0', '×1.25', '×1.5', '×2.0'];

const fieldCls = `w-full rounded-lg border border-gray-200 dark:border-gray-600
  bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100
  px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400
  focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition`;

export function OvertimeSettings() {
  const { lang, isRTL } = useLang();
  const isAr = lang === 'ar';

  const { data }                              = useOvertimeSettings();
  const { mutate: save,    isPending: saving } = useUpdateOvertimeSettings();

  const [enabled,    setEnabled]    = useState(true);
  const [dailyLimit, setDailyLimit] = useState(8);
  const [multiplier, setMultiplier] = useState('×1.5');

  useEffect(() => {
    if (!data) return;
    if (data.enabled !== undefined) setEnabled(data.enabled);
    if (data.daily_limit !== undefined) setDailyLimit(data.daily_limit);
    if (data.multiplier) setMultiplier(data.multiplier);
  }, [data]);

  function handleSave() {
    toast.success(isAr ? 'تم حفظ الإعدادات' : 'Settings saved');
    save({ enabled, daily_limit: dailyLimit, multiplier });
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
              {isAr ? 'المضاعف' : 'Multiplier'}
            </label>
            <div className="relative">
              <select value={multiplier} onChange={(e) => setMultiplier(e.target.value)}
                disabled={!enabled} className={`${fieldCls} appearance-none pe-8`}>
                {MULTIPLIER_OPT.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute inset-y-0 my-auto inset-e-2.5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {isAr ? 'حد الساعات اليومي' : 'Daily Hours Limit'}
            </label>
            <input type="number" min={1} max={16} value={dailyLimit} disabled={!enabled}
              onChange={(e) => setDailyLimit(Number(e.target.value))} className={fieldCls} />
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
              ? `يحتسب الإضافي عند تجاوز ${dailyLimit} ساعات يومياً بمعدل ${multiplier} من أجر الساعة.`
              : `Overtime calculated after ${dailyLimit} hrs/day at ${multiplier} of hourly rate.`}
          </p>
        )}

      </div>
    </Card>
  );
}
