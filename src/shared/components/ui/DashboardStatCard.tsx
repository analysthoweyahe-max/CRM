import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';

export interface DashboardStatCardProps {
  icon:      ReactNode;
  iconBg:    string;
  value:     number;
  labelAr?:  string;
  labelEn?:  string;
  label?:    string;
  isAr:      boolean;
  onClick?:  () => void;
  isActive?: boolean;
  square?:   boolean;
}

export function DashboardStatCard({
  icon,
  iconBg,
  value,
  labelAr,
  labelEn,
  label,
  isAr,
  onClick,
  isActive,
  square = false,
}: DashboardStatCardProps) {
  const displayLabel = label ?? (isAr ? labelAr : labelEn) ?? '';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border hover:shadow-md transition-all w-full ${
        square
          ? 'aspect-square flex flex-col items-center justify-center text-center p-4 gap-3'
          : 'p-4 text-start'
      } ${
        isActive
          ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 shadow-md'
          : 'border-gray-100 dark:border-gray-700/60 transition-shadow'
      }`}
    >
      <ExternalLink size={13} className="absolute top-3 start-3 text-gray-300 dark:text-gray-600" />
      {square ? (
        <>
          <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{displayLabel}</p>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between gap-2 mt-3">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{displayLabel}</p>
          </div>
          <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
        </div>
      )}
    </button>
  );
}
