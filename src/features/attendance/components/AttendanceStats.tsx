import { UserCheck, Users, Clock, UserX } from 'lucide-react';
import { type ReactElement } from 'react';
import { Card } from '@/shared/components/ui/Card';
import type { AttendanceRecord } from '@/features/attendance/types/attendance.types';

interface StatItemProps {
  icon:       ReactElement;
  iconBg:     string;
  value:      number;
  label:      string;
  filterKey:  string;
  isActive:   boolean;
  onClick:    () => void;
}

function StatItem({ icon, iconBg, value, label, isActive, onClick }: StatItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      className={`rounded-2xl cursor-pointer select-none transition-all duration-200
                  ${isActive
                    ? 'ring-2 ring-[#A0CD39] shadow-lg -translate-y-0.5'
                    : 'hover:shadow-md hover:-translate-y-0.5'}`}
    >
      <Card>
        <div className="flex items-center gap-5 px-2 py-2">
          <div className={`${iconBg} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0
                           transition-transform duration-200 ${isActive ? 'scale-105' : ''}`}>
            {icon}
          </div>
          <div>
            <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-none">{value}</p>
            <p className={`text-sm mt-1.5 transition-colors
                           ${isActive ? 'text-[#709028] dark:text-[#A0CD39] font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
              {label}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface AttendanceStatsProps {
  records:    AttendanceRecord[];
  isAr:       boolean;
  activeCard: string | null;
  onFilter:   (key: string | null) => void;
}

export function AttendanceStats({ records, isAr, activeCard, onFilter }: AttendanceStatsProps) {
  const checkedIn   = records.filter((r) => r.checkIn !== null).length;
  const workingNow  = records.filter((r) => r.workStatus === 'working').length;
  const lateCount   = records.filter((r) => r.dayStatus === 'late').length;
  const absentCount = records.filter((r) => r.dayStatus === 'absent').length;

  const toggle = (key: string) => onFilter(activeCard === key ? null : key);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatItem
        filterKey="checkedIn"
        icon={<UserCheck size={24} className="text-emerald-600" />}
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        value={checkedIn}
        label={isAr ? 'المسجلون حضور' : 'Checked In'}
        isActive={activeCard === 'checkedIn'}
        onClick={() => toggle('checkedIn')}
      />
      <StatItem
        filterKey="working"
        icon={<Users size={24} className="text-blue-600" />}
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        value={workingNow}
        label={isAr ? 'المتواجدون حالتاً' : 'Currently In'}
        isActive={activeCard === 'working'}
        onClick={() => toggle('working')}
      />
      <StatItem
        filterKey="late"
        icon={<Clock size={24} className="text-amber-600" />}
        iconBg="bg-amber-100 dark:bg-amber-900/30"
        value={lateCount}
        label={isAr ? 'المتأخرون' : 'Late'}
        isActive={activeCard === 'late'}
        onClick={() => toggle('late')}
      />
      <StatItem
        filterKey="absent"
        icon={<UserX size={24} className="text-red-600" />}
        iconBg="bg-red-100 dark:bg-red-900/30"
        value={absentCount}
        label={isAr ? 'الغياب اليوم' : 'Absent Today'}
        isActive={activeCard === 'absent'}
        onClick={() => toggle('absent')}
      />
    </div>
  );
}
