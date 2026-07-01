import type { SeoTaskDetail } from '../types/seoTaskDetail.types';
import type { TaskComment, TaskSession } from '@/modules/employee/tasks/types/taskDetail.types';

function delay<T>(data: T, ms = 400): Promise<{ data: T }> {
  return new Promise(res => setTimeout(() => res({ data }), ms));
}

const DUMMY_PROJECT_UUID = 'dummy-project-uuid';

const mockDetails: Record<string, SeoTaskDetail> = {
  '1': {
    id: 1, taskNumber: 1,
    title: 'بحث الكلمات المفتاحية الرئيسية',
    description: 'تحليل كلمات المنافسين وتحديد الفرص المتاحة لتحسين ترتيب الموقع.',
    phase: 'بحث الكلمات المفتاحية',
    taskType: 'keyword_research', taskTypeLabel: 'بحث كلمات مفتاحية',
    status: 'blocked', statusLabel: 'محظورة',
    priority: 'high', priorityLabel: 'عالية',
    dueDate: '2026-07-15',
    assignees: [{ id: 1, name: 'محمد علي', initials: 'م', avatarBg: 'bg-brand-500' }],
    createdBy: 'أحمد المنصور',
    startDate: '2026-07-01',
    siteLinks: ['/about-us', '/contact', '/services'],
    referenceLinks: ['https://ahrefs.com/keywords'],
    notes: 'التركيز على الكلمات ذات الحجم العالي والمنافسة المنخفضة.',
    targetUrl: 'https://gulf-tech.com/services',
    targetKeyword: 'خدمات تصميم مواقع',
    searchIntent: 'تجارية',
    searchVolume: 2400,
    keywordDifficulty: 45,
    metaTitle: 'خدمات تصميم وتطوير المواقع | الخليج التقني',
    metaDescription: 'وصف موجز يظهر في نتائج البحث.',
    allocatedHours: 10,
  },
  '2': {
    id: 2, taskNumber: 2,
    title: 'توزيع الكلمات الرئيسية على الصفحات',
    description: 'ربط الكلمات المفتاحية الأساسية والثانوية بالصفحات المستهدفة.',
    phase: 'بحث الكلمات المفتاحية',
    taskType: 'keyword_research', taskTypeLabel: 'بحث كلمات مفتاحية',
    status: 'inProgress', statusLabel: 'قيد التنفيذ',
    priority: 'high', priorityLabel: 'عالية',
    dueDate: '2026-07-20',
    assignees: [{ id: 1, name: 'محمد علي', initials: 'م', avatarBg: 'bg-brand-500' }],
    createdBy: 'أحمد المنصور',
    startDate: '2026-07-05',
    siteLinks: ['/about-us', '/contact'],
    referenceLinks: [],
    notes: null,
    targetUrl: null,
    targetKeyword: 'تطوير المواقع',
    searchIntent: 'معلوماتية',
    searchVolume: 1800,
    keywordDifficulty: 32,
    metaTitle: '',
    metaDescription: '',
    allocatedHours: 8,
  },
};

const fallbackDetail: SeoTaskDetail = {
  id: 0, taskNumber: 0,
  title: 'مهمة غير موجودة',
  description: null,
  phase: null,
  taskType: 'general', taskTypeLabel: 'عامة',
  status: 'pending', statusLabel: 'لم تبدأ بعد',
  priority: 'normal', priorityLabel: 'عادية',
  dueDate: null,
  assignees: [],
  createdBy: '—',
  startDate: null,
  siteLinks: [],
  referenceLinks: [],
  notes: null,
  targetUrl: null,
  targetKeyword: null,
  searchIntent: null,
  searchVolume: null,
  keywordDifficulty: null,
  metaTitle: null,
  metaDescription: null,
  allocatedHours: 10,
};

const mockSessions: TaskSession[] = [
  { id: '1', date: '١٨ يونيو ٢٠٢٦', from: '09:00', to: '11:30', durationHours: 2.5  },
  { id: '2', date: '١٨ يونيو ٢٠٢٦', from: '13:00', to: '15:45', durationHours: 2.75 },
  { id: '3', date: '١٩ يونيو ٢٠٢٦', from: '09:00', to: '10:15', durationHours: 1.25 },
];

const mockComments: TaskComment[] = [
  {
    id: '1',
    authorAr: 'أحمد المنصور', authorEn: 'Ahmed Al-Mansour',
    initials: 'أ', avatarBg: 'bg-purple-500',
    body: 'تأكد من مطابقة التصميم لنظام الألوان @محمد علي',
    createdAt: '18-1-26 10:20', isMine: false,
  },
  {
    id: '2',
    authorAr: 'محمد علي', authorEn: 'Mohamed Ali',
    initials: 'م', avatarBg: 'bg-brand-500',
    body: 'تم، سأرفع النسخة المحدثة قريباً.',
    createdAt: '18-1-26 11:05', isMine: true,
  },
];

export const seoTaskDetailApi = {
  getById(_projectUuid = DUMMY_PROJECT_UUID, taskId: string) {
    const detail = mockDetails[taskId] ?? fallbackDetail;
    return delay({ detail, sessions: mockSessions, comments: mockComments });
  },
};
