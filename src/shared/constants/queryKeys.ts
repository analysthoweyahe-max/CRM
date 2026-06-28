export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
  },

  employees: {
    all:    ['employees']                       as const,
    detail: (id: string) => ['employees', id]  as const,
  },

  attendance: {
    daily:           ['attendance', 'daily']                              as const,
    log:             ['attendance', 'log']                                as const,
    byEmployee:      (id: string) => ['attendance', id]                   as const,
    history:         (id: string) => ['attendance', 'history', id]        as const,
    selfHistory:     (month: string) => ['employee', 'reports', 'history', month] as const,
  },

  leaves: {
    all:        ['leaves']                          as const,
    detail:     (id: string) => ['leaves', id]      as const,
    byEmployee: (id: string) => ['leaves', id]      as const,
  },

  payroll: {
    deductions: ['payroll', 'deductions'] as const,
    bonuses:    ['payroll', 'bonuses']    as const,
  },

  messages: {
    conversations: ['messages', 'conversations']                              as const,
    thread:        (id: string) => ['messages', 'thread', id]                 as const,
  },

  employee: {
    leave: {
      list:    ['employee', 'leave', 'list']    as const,
      summary: ['employee', 'leave', 'summary'] as const,
      types:   ['employee', 'leave', 'types']   as const,
    },
    tasks:        ['employee', 'tasks']         as const,
    dailyReports: ['employee', 'daily-reports'] as const,
  },

  pm: {
    projects: ['pm', 'projects']                           as const,
    detail:   (id: string) => ['pm', 'projects', id]       as const,
    team:     ['pm', 'team']                               as const,
  },
} as const;
