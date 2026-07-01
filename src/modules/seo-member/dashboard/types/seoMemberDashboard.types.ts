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

export interface SeoMemberDashboardData {
  tasksOverview: TasksOverview;
  myProjects: {
    sections: ProjectSection[];
  };
}
