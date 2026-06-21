import { ChevronLeft, ChevronRight, Check, User, Briefcase } from 'lucide-react';

/* ─── Step config (local — only needed for rendering) */
const STEPS = [
  { labelAr: 'البيانات',     labelEn: 'Data',   Icon: User      },
  { labelAr: 'مراجعة البيانات', labelEn: 'Data Review', Icon: Briefcase },
];

/* ─── StepIndicator ──────────────────────────────── */
interface StepIndicatorProps { current: number; isAr: boolean }

export function StepIndicator({ current, isAr }: StepIndicatorProps) {
  return (
    <div className="flex items-start py-1">
      {STEPS.map(({ labelAr, labelEn, Icon }, idx) => {
        const n        = idx + 1;
        const isActive = n === current;
        const isDone   = n < current;

        return (
          <div key={idx} className="flex items-start flex-1 last:flex-[0_0_auto]">
            {/* Circle + label */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={[
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  isActive
                    ? 'bg-[#A0CD39] text-white shadow-sm'
                    : isDone
                    ? 'bg-[#D8EBAE] text-[#709028]'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500',
                ].join(' ')}
              >
                {isDone ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <span
                className={[
                  'text-xs text-center leading-tight max-w-[72px]',
                  isActive
                    ? 'text-gray-900 dark:text-gray-100 font-semibold'
                    : isDone
                    ? 'text-[#709028] font-medium'
                    : 'text-gray-400 dark:text-gray-500',
                ].join(' ')}
              >
                {isAr ? labelAr : labelEn}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={[
                  'flex-1 h-px mt-5 mx-3',
                  isDone ? 'bg-[#A0CD39]' : 'bg-gray-200 dark:bg-gray-600',
                ].join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── NavButtons ─────────────────────────────────── */
export interface NavButtonsProps {
  isAr:          boolean;
  isRTL:         boolean;
  onBack:        () => void;
  isFirst?:      boolean;
  isLast?:       boolean;
  isSubmitting?: boolean;
}

export function NavButtons({ isAr, isRTL, onBack, isFirst, isLast, isSubmitting }: NavButtonsProps) {
  const PrevChevron = isRTL ? ChevronRight : ChevronLeft;
  const NextChevron = isRTL ? ChevronLeft  : ChevronRight;

  const nextLabel = isSubmitting
    ? (isAr ? 'جاري الإرسال...' : 'Sending...')
    : isLast
    ? (isAr ? 'إنشاء الحساب وإرسال الدعوة' : 'Create Account & Send Invite')
    : (isAr ? 'التالي' : 'Next');

  return (
    <div className="flex items-center justify-between pt-2">
      {/* السابق */}
      <button
        type="button"
        onClick={onBack}
        disabled={isFirst}
        className={[
          'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isFirst
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50',
        ].join(' ')}
      >
        {isRTL
          ? <>{isAr ? 'السابق' : 'Previous'} <PrevChevron size={16} /></>
          : <><PrevChevron size={16} /> {isAr ? 'السابق' : 'Previous'}</>}
      </button>

      {/* التالي / إرسال */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                   bg-[#A0CD39] hover:bg-[#90BA33] active:bg-[#83AA2F] text-gray-900
                   text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLast ? (
          isRTL
            ? <><Check size={16} /> {nextLabel}</>
            : <>{nextLabel} <Check size={16} /></>
        ) : (
          isRTL
            ? <><NextChevron size={16} /> {nextLabel}</>
            : <>{nextLabel} <NextChevron size={16} /></>
        )}
      </button>
    </div>
  );
}
