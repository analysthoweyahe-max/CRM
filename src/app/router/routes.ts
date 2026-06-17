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
  },
  ATTENDANCE: {
    DAILY: '/attendance',
    LOG:   '/attendance/log',
  },
  LEAVES:  '/leaves',
  PAYROLL: {
    DEDUCTIONS:     '/payroll/deductions',
    DEDUCTIONS_NEW: '/payroll/deductions/new',
    BONUSES:        '/payroll/bonuses',
  },
  MESSAGES: '/messages',
  SETTINGS: '/settings',
} as const;
