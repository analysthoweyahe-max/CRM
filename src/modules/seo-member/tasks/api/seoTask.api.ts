function delay<T>(data: T, ms = 400): Promise<{ data: T }> {
  return new Promise(res => setTimeout(() => res({ data }), ms));
}

// TODO: replace DUMMY_PROJECT_UUID with real value from user profile/endpoint
const DUMMY_PROJECT_UUID = 'dummy-project-uuid';

const mockData = {
  status: 'true',
  message: 'تم جلب مهام المشروع بنجاح.',
  data: {
    phases: [
      {
        phase: 'بحث الكلمات المفتاحية',
        tasks: [
          {
            id: 1, taskNumber: 1, phase: 'بحث الكلمات المفتاحية',
            title: 'بحث الكلمات المفتاحية الرئيسية',
            description: 'Analyze competitor keywords and identify opportunities.',
            taskType: 'keyword_research', taskTypeLabel: 'بحث كلمات مفتاحية',
            status: 'blocked', statusLabel: 'محظورة',
            priority: 'high', priorityLabel: 'عالية',
            dueDate: '2026-07-15',
          },
          {
            id: 2, taskNumber: 2, phase: 'بحث الكلمات المفتاحية',
            title: 'توزيع الكلمات الرئيسية على الصفحات',
            description: 'Map primary and secondary keywords to target pages.',
            taskType: 'keyword_research', taskTypeLabel: 'بحث كلمات مفتاحية',
            status: 'inProgress', statusLabel: 'قيد التنفيذ',
            priority: 'high', priorityLabel: 'عالية',
            dueDate: '2026-07-20',
          },
        ],
      },
      {
        phase: 'تحسين داخل الصفحة',
        tasks: [
          {
            id: 3, taskNumber: 3, phase: 'تحسين داخل الصفحة',
            title: 'عناوين ووصف الميتا',
            description: 'Optimize meta titles and descriptions for target pages.',
            taskType: 'on_page', taskTypeLabel: 'داخل الصفحة',
            status: 'pending', statusLabel: 'لم تبدأ بعد',
            priority: 'normal', priorityLabel: 'عادية',
            dueDate: null,
          },
          {
            id: 4, taskNumber: 4, phase: 'تحسين داخل الصفحة',
            title: 'تحسين هيكل العناوين H1–H6',
            description: 'Review and optimize H1-H6 structure.',
            taskType: 'on_page', taskTypeLabel: 'داخل الصفحة',
            status: 'completed', statusLabel: 'مكتملة',
            priority: 'normal', priorityLabel: 'عادية',
            dueDate: '2026-06-25',
          },
        ],
      },
      {
        phase: 'SEO تقني',
        tasks: [
          {
            id: 6, taskNumber: 6, phase: 'SEO تقني',
            title: 'فحص سرعة الموقع وتحسينها',
            description: 'Run performance audit and document issues.',
            taskType: 'technical', taskTypeLabel: 'تقنية',
            status: 'inProgress', statusLabel: 'قيد التنفيذ',
            priority: 'high', priorityLabel: 'عالية',
            dueDate: '2026-07-10',
          },
          {
            id: 7, taskNumber: 7, phase: 'SEO تقني',
            title: 'مراجعة أخطاء الزحف في Search Console',
            description: 'Review crawl errors and fix critical issues.',
            taskType: 'technical', taskTypeLabel: 'تقنية',
            status: 'pending', statusLabel: 'لم تبدأ بعد',
            priority: 'high', priorityLabel: 'عالية',
            dueDate: '2026-07-18',
          },
        ],
      },
      {
        phase: 'تحسين المحتوى',
        tasks: [
          {
            id: 9, taskNumber: 9, phase: 'تحسين المحتوى',
            title: 'تحسين محتوى الصفحات المستهدفة',
            description: 'Optimize page content for target keywords and user intent.',
            taskType: 'content', taskTypeLabel: 'محتوى',
            status: 'pending', statusLabel: 'لم تبدأ بعد',
            priority: 'normal', priorityLabel: 'عادية',
            dueDate: '2026-07-30',
          },
        ],
      },
      {
        phase: 'التقارير',
        tasks: [
          {
            id: 12, taskNumber: 12, phase: 'التقارير',
            title: 'تقرير الأداء الشهري لمحركات البحث',
            description: 'Prepare monthly SEO performance report with KPIs.',
            taskType: 'reporting', taskTypeLabel: 'تقارير',
            status: 'pending', statusLabel: 'لم تبدأ بعد',
            priority: 'low', priorityLabel: 'منخفضة',
            dueDate: null,
          },
        ],
      },
    ],
    total: 7,
  },
};

export const seoTaskApi = {
  list(_projectUuid = DUMMY_PROJECT_UUID, _params?: { status?: string; search?: string }) {
    return delay(mockData);
  },
};
