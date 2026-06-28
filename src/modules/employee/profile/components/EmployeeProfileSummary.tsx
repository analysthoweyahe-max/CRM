import { Card } from '@/shared/components/ui/Card';
import { useEmployeeProfileSummary } from './useEmployeeProfileSummary';
import type { EmployeeProfileSummaryProps } from './EmployeeProfileSummary.types';

export function EmployeeProfileSummary({ isAr }: EmployeeProfileSummaryProps) {
  const { initial, avatarBg, fullName, jobTitle, stats } = useEmployeeProfileSummary(isAr);

  return (
    <Card padding="lg" className="flex flex-col items-center text-center gap-5">

      {/* Avatar */}
      <div className={`w-24 h-24 rounded-full ${avatarBg} flex items-center justify-center mt-2 shrink-0`}>
        <span className="text-3xl font-bold text-white">{initial}</span>
      </div>

      {/* Name + role */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-snug">
          {fullName}
        </h2>
        <p className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">
          {jobTitle}
        </p>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#D8EBAE] dark:bg-[#A0CD39]/20" />

      {/* Stats */}
      <div className="w-full space-y-3 px-1">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                {stat.value}
              </span>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 shrink-0">
                <span className="text-sm whitespace-nowrap">{stat.label}</span>
                <span className="text-[#709028] dark:text-[#A0CD39]">
                  <Icon size={16} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </Card>
  );
}
