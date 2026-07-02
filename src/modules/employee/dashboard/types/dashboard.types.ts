export interface EmpTasksOverview {
  totalAssigned: number;
  inProgress:    number;
  completed:     number;
}

export interface EmpProjectSection {
  key:      string;
  label:    string;
  total?:   number;
  projects: unknown[];
}

export interface EmpDashboardData {
  tasksOverview: EmpTasksOverview;
  myProjects: {
    sections: EmpProjectSection[];
  };
}

export interface EmpDashboardApiResponse {
  status:  string;
  message: string;
  data:    EmpDashboardData;
}
