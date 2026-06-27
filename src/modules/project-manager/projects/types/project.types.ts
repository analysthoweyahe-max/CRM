export type ProjectStatus = 'inProgress' | 'completed' | 'paused' | 'notStarted';

export interface TeamMember {
  initial:   string;
  color:     string;
  name:      string;
  role?:     string;
  email?:    string;
  isActive?: boolean;
}

export interface MemberProfile extends TeamMember {
  taskCount:    number;
  projectNames: string[];
  totalHours:   number;
}

export interface Project {
  id:             string;
  nameAr:         string;
  nameEn:         string;
  categoryAr:     string;
  categoryEn:     string;
  description?:   string;
  startDate?:     string;
  progress:       number;
  status:         ProjectStatus;
  tasksCompleted: number;
  tasksTotal:     number;
  team:           TeamMember[];
  isArchived?:    boolean;
}
