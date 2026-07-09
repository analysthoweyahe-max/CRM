export interface TasksOverview {
  totalAssigned: number;
  inProgress:    number;
  completed:     number;
}

export interface SeoProject {
  id:     number | string;
  name:   string;
  status: string;
}

export interface ProjectSection {
  key:             string;
  label:           string;
  defaultExpanded: boolean;
  total:           number;
  projects:        SeoProject[];
}

import type { AttendanceTimer } from '@/shared/modules/attendance/types/attendanceTimer.types';

export interface SeoMemberDashboardData {
  tasksOverview: TasksOverview;
  checkIn?:      Partial<AttendanceTimer>;
  myProjects: {
    sections: ProjectSection[];
  };
}
