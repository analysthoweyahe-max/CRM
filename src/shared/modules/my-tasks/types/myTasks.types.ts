import type { AuthUser } from '@/modules/auth/types/auth.types';

export type TasksApiRole =
  | 'pm-employee'
  | 'seo-employee'
  | 'project-manager'
  | 'seo-manager';

export interface TaskAssignee {
  id:            string;
  name:          string;
  email:         string;
  avatarUrl:     string | null;
  avatarInitial: string;
}

export interface TaskProject {
  id:   number | string;
  name: string;
}

export interface TaskPhase {
  /** PM phases are real numeric ids; SEO has no phase-id catalog, so its
   *  phase name doubles as the id — keep both to avoid distinct phases
   *  colliding under the same key when grouped. */
  id:   number | string;
  name: string;
}

export interface MyTask {
  id:               number;
  uuid:             string;
  taskNumber:       number;
  title:            string;
  description:      string | null;
  status:           string;
  statusLabel:      string;
  priority:         string;
  priorityLabel:    string;
  dueDate:          string | null;
  estimatedHours:   number | null;
  project?:         TaskProject;
  phase?:           TaskPhase;
  assignee?:        TaskAssignee;
  completedAt:      string | null;
  attachmentsCount?: number;
  commentsCount?:    number;
  createdAt:        string;
  updatedAt:        string;
  dueAt?:           string | null;
  isOverdue?:       boolean;
  isDelayed?:       boolean;
  overdueLabel?:    string | null;
  canExtend?:       boolean;
}

export interface MyTaskColumn {
  status:      string;
  statusLabel: string;
  tasks:       MyTask[];
}

export interface GroupedTasksData {
  columns: MyTaskColumn[];
  phases?: MyTaskPhaseGroup[];
  total:   number;
}

export interface MyTasksPageConfig {
  tasksRole:       TasksApiRole;
  canAddSelfTask:  boolean;
  canDragStatus:   boolean;
  showProjectName: boolean;
  taskDetailPath:  (projectId: number | string, taskId: number | string) => string;
  projectPath:     (projectId: number | string) => string;
}

export type ResolveTasksRoleInput = Pick<AuthUser, 'actor' | 'roles' | 'role' | 'section'>;

export interface MyTaskPhaseGroup {
  phase: string;
  tasks: MyTask[];
}
