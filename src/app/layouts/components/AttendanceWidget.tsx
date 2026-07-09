import type { AttendanceScope } from '@/shared/modules/attendance/types/attendanceTimer.types';
import { WorkTimerCard } from '@/shared/modules/attendance/components/WorkTimerCard';
import type { AttendanceTimer } from '@/shared/modules/attendance/types/attendanceTimer.types';

interface AttendanceWidgetProps {
  layoutScope?: AttendanceScope;
}

/** Sidebar compact work timer — delegates to shared WorkTimerCard. */
export function AttendanceWidget({ layoutScope }: AttendanceWidgetProps) {
  return <WorkTimerCard variant="compact" layoutScope={layoutScope} />;
}

/** @deprecated Use WorkTimerCard or useWorkTimer directly */
export type { AttendanceTimer };
