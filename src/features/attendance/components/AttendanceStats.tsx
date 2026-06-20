import { UserCheck, Users, Clock, UserX } from 'lucide-react';
import { type ReactElement } from 'react';
import { Card } from '@/shared/components/ui/Card';
import type { AttendanceRecord } from '@/features/attendance/types/attendance.types';

interface StatItemProps {
  icon:       ReactElement;
  iconBg:     string;
  value:      number;
  label:      string;
}

function StatItem({ icon, iconBg, value, label }: StatItemProps) {
  return (
    <Card>
      <div className="flex items-center gap-5 px-2 py-2">
        <div className={`${iconBg} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-none">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">{label}</p>
        </div>
      </div>
    </Card>
  );
}

interface AttendanceStatsProps {
  records: AttendanceRecord[];
  isAr:    boolean;
}

export function AttendanceStats({ records, isAr }: AttendanceStatsProps) {
  const checkedIn    = records.filter((r) => r.checkIn !== null).length;
  const workingNow   = records.filter((r) => r.workStatus === 'working').length;
  const lateCount    = records.filter((r) => r.dayStatus === 'late').length;
  const absentCount  = records.filter((r) => r.dayStatus === 'absent').length;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatItem
        icon={<UserCheck size={24} className="text-emerald-600" />}
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        value={checkedIn}
        label={isAr ? 'المسجلون حضور' : 'Checked In'}
      />
      <StatItem
        icon={<Users size={24} className="text-blue-600" />}
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        value={workingNow}
        label={isAr ? 'المتواجدون حالتاً' : 'Currently In'}
      />
      <StatItem
        icon={<Clock size={24} className="text-amber-600" />}
        iconBg="bg-amber-100 dark:bg-amber-900/30"
        value={lateCount}
        label={isAr ? 'المتأخرون' : 'Late'}
      />
      <StatItem
        icon={<UserX size={24} className="text-red-600" />}
        iconBg="bg-red-100 dark:bg-red-900/30"
        value={absentCount}
        label={isAr ? 'الغياب اليوم' : 'Absent Today'}
      />
    </div>
  );
}
