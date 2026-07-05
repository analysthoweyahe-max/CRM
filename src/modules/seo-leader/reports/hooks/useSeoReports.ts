import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAvatarColor } from '@/shared/utils/avatar.utils';
import { seoDailyReportsApi } from '../api/dailyReports.api';
import type { RawSeoDailyReport } from '../api/dailyReports.api';
import type { DailyReport } from '@/shared/modules/team-reports/types/teamReport.types';

const today = new Date().toISOString().slice(0, 10);

function toDailyReport(r: RawSeoDailyReport): DailyReport {
  return {
    id:            r.id,
    date:          r.reportDate,
    memberName:    r.employee.name,
    memberInitial: r.employee.avatarInitial,
    memberColor:   getAvatarColor(r.employee.name),
    checkIn:       r.checkInAt  ?? '',
    checkOut:      r.checkOutAt ?? '',
    entry: {
      tasks:        r.tasks.map(t => t.taskTitle),
      plannedHours: r.tasks.reduce((s, t) => s + t.plannedHours, 0),
      actualHours:  r.tasks.reduce((s, t) => s + t.actualHours, 0),
    },
    notes: r.summaryNote ?? '',
  };
}

export function useSeoReports() {
  const [date, setDate] = useState(today);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['seo-daily-reports', date],
    queryFn:  () => seoDailyReportsApi.list(date).then(r => r.data.data.data.map(toDailyReport)),
  });

  return { reports, date, setDate, isEmpty: !isLoading && reports.length === 0, isLoading };
}
