import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { Card }    from '@/shared/components/ui/Card';

const MULTIPLIER_OPT = ['×1.0', '×1.25', '×1.5', '×2.0'];

export function OvertimeSettings() {
  const { lang, isRTL } = useLang();
  const isAr = lang === 'ar';

  const [enabled,    setEnabled]    = useState(true);
  const [dailyLimit, setDailyLimit] = useState(8);
  const [multiplier, setMultiplier] = useState('×1.5');
  const [saved,      setSaved]      = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <div className="p-5 space-y-4">

        {/* Title */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'إعدادات الساعات الإضافية' : 'Overtime Settings'}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {isAr ? 'احتساب الإضافي تلقائياً من سجلات الحضور' : 'Auto-calculate overtime from attendance records'}
          </p>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {isAr ? 'المضاعف' : 'Multiplier'}
            </label>
            <div className="relative">
              <select
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                disabled={!enabled}
                className="w-full appearance-none rounded-lg border border-gray-200 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100
                           px-3 py-2.5 pe-8 focus:outline-none focus:ring-2 focus:ring-brand-400
                           focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {MULTIPLIER_OPT.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute inset-y-0 my-auto inset-e-2.5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {isAr ? 'حد الساعات اليومي' : 'Daily Hours Limit'}
            </label>
            <input
              type="number"
              min={1}
              max={16}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              disabled={!enabled}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600
                         bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100
                         px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400
                         focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
            />
          </div>
        </div>

        {/* Toggle row + Save button */}
        <div className="flex items-center justify-between gap-3">
          {/* Toggle group — first child = RIGHT in RTL */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {isAr ? 'تفعيل الإضافي' : 'Enable Overtime'}
            </span>
            <button
              type="button"
              onClick={() => setEnabled((p) => !p)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                enabled ? 'bg-[#A0CD39]' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  isRTL
                    ? enabled ? '-translate-x-6' : '-translate-x-1'
                    : enabled ? 'translate-x-6'  : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Save button — second child = LEFT in RTL */}
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                       border border-gray-200 dark:border-gray-600
                       bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
                       text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors"
          >
            <Check size={15} className={saved ? 'text-[#A0CD39]' : 'text-gray-400'} />
            {isAr ? (saved ? 'تم الحفظ' : 'حفظ') : (saved ? 'Saved' : 'Save')}
          </button>
        </div>

        {/* Info text */}
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
