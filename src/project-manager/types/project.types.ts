export type ProjectStatus = 'inProgress' | 'completed' | 'paused' | 'notStarted';

export interface TeamMember {
  initial: string;
  color:   string;
  name:    string;
}

export interface Project {
  id:             string;
  nameAr:         string;
  nameEn:         string;
  categoryAr:     string;
  categoryEn:     string;
  progress:       number;
  status:         ProjectStatus;
  tasksCompleted: number;
  tasksTotal:     number;
  team:           TeamMember[];
}
