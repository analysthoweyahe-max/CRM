export const ROUTES = {
  AUTH: {
    LOGIN:           '/auth/login',
    SET_PASSWORD:    '/auth/set-password',
    INVITE:          '/auth/invite',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  DASHBOARD: '/dashboard',
  EMPLOYEES: {
    LIST:   '/employees',
    NEW:    '/employees/new',
    DETAIL: (id = ':id') => `/employees/${id}`,
    EDIT:   (id = ':id') => `/employees/${id}/edit`,
  },
  ATTENDANCE: {
    DAILY: '/attendance',
    LOG:   '/attendance/log',
  },
  LEAVES: {
    LIST:   '/leaves',
    DETAIL: (id = ':id') => `/leaves/${id}`,
  },
  PAYROLL: {
    DEDUCTIONS:     '/payroll/deductions',
    DEDUCTIONS_NEW: '/payroll/deductions/new',
    BONUSES:        '/payroll/bonuses',
    BONUSES_NEW:    '/payroll/bonuses/new',
  },
  PROFILE:  '/profile',
  MESSAGES: '/messages',
  SETTINGS: '/settings',
  PROJECT_MANAGER: {
    DASHBOARD: '/project-manager',
    NEW:       '/project-manager/new',
    TEAM:      '/project-manager/team',
    REPORTS:   '/project-manager/reports',
    PROFILE:   '/project-manager/profile',
  },
} as const;
