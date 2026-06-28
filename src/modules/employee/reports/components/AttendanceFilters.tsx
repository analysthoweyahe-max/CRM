import { STATUS_CHIPS } from './useAttendanceFilters';
import type { AttendanceFiltersProps } from './AttendanceFilters.types';

export function AttendanceFilters({ activeStatus, onStatusChange, isAr }: AttendanceFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STATUS_CHIPS.map(chip => {
        const isActive = activeStatus === chip.key;
        return (
          <button
            key={chip.key}
            type="button"
            onClick={() => onStatusChange(isActive ? null : chip.key)}
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all',
              isActive
                ? `${chip.cls} ring-2 ring-offset-1 ring-current/30 shadow-sm`
                : `${chip.cls} opacity-70 hover:opacity-100`,
            ].join(' ')}
          >
            <span className="font-bold">{chip.badge}</span>
            {isAr ? chip.ar : chip.en}
          </button>
        );
      })}
    </div>
  );
}
