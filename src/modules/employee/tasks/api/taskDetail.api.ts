import type { TaskDetail, TaskComment, TaskSession } from '../types/taskDetail.types';

function delay<T>(data: T, ms = 500): Promise<{ data: T }> {
  return new Promise(res => setTimeout(() => res({ data }), ms));
}

const DETAIL_DEFAULTS: TaskDetail = {
  id: '1',
  titleAr: 'تطوير واجهة المستخدم',
  titleEn: 'Develop User Interface',
  descriptionAr: 'وصف تفصيلي للمهمة وما هو مطلوب إنجازه ضمن هذه المرحلة من المشروع.',
  descriptionEn: 'A detailed description of the task and what needs to be accomplished.',
  projectAr: 'موقع الشركة الإلكتروني',
  projectEn: 'Company Website',
  stage: 'التطوير',
  assigneeAr: 'محمد علي',
  assigneeEn: 'Mohammed Ali',
  assigneeInitials: 'م',
  createdByAr: 'أحمد المنصور',
  createdByEn: 'Ahmed Al-Mansour',
  startDate: '2026-06-10',
  deadline: '2026-06-25',
  priority: 'high',
  status: 'inProgress',
  allocatedHours: 10,
};

const MOCK_DETAIL: Record<string, TaskDetail> = {
  '1': { ...DETAIL_DEFAULTS, id: '1' },
  '2': { ...DETAIL_DEFAULTS, id: '2', titleAr: 'تطوير API المستخدمين', titleEn: 'Develop Users API', status: 'inProgress' },
  '3': { ...DETAIL_DEFAULTS, id: '3', titleAr: 'مراجعة متطلبات المشروع', titleEn: 'Review Project Requirements', status: 'completed', priority: 'medium' },
};

const MOCK_COMMENTS: TaskComment[] = [
  {
    id: '1',
    authorAr: 'أحمد المنصور',
    authorEn: 'Ahmed Al-Mansour',
    initials: 'أ',
    avatarBg: 'bg-brand-500',
    body: 'تأكد من مطابقة التصميم لنظام الألوان @محمد علي',
    createdAt: '18-06-26 10:20',
    isMine: false,
  },
  {
    id: '2',
    authorAr: 'محمد علي',
    authorEn: 'Mohammed Ali',
    initials: 'م',
    avatarBg: 'bg-purple-500',
    body: 'تم. سأرفع النسخة المحدثة قريباً.',
    createdAt: '18-06-26 11:05',
    isMine: true,
  },
];

const MOCK_SESSIONS: TaskSession[] = [
  { id: '1', date: '18 يونيو 2026', from: '09:00', to: '11:30', durationHours: 2.5  },
  { id: '2', date: '18 يونيو 2026', from: '13:00', to: '15:45', durationHours: 2.75 },
  { id: '3', date: '19 يونيو 2026', from: '09:00', to: '10:15', durationHours: 1.25 },
];

export const taskDetailApi = {
  get:         (id: string) => delay(MOCK_DETAIL[id] ?? { ...DETAIL_DEFAULTS, id }, 600),
  getComments: (_id: string) => delay([...MOCK_COMMENTS], 400),
  getSessions: (_id: string) => delay([...MOCK_SESSIONS], 450),
};
