import type { EmpTaskListResponse } from '../types/employeeTask.types';

function delay<T>(data: T, ms = 400): Promise<{ data: T }> {
  return new Promise(res => setTimeout(() => res({ data }), ms));
}

const mockTasks: EmpTaskListResponse['data']['data'] = [
  { id: '1', titleAr: 'تصميم واجهة لوحة التحكم',    titleEn: 'Design dashboard UI',         projectAr: 'نظام الموارد البشرية', projectEn: 'HR System',       deadline: '2026-07-10', priority: 'high',   status: 'inProgress' },
  { id: '2', titleAr: 'تطوير API المستخدمين',        titleEn: 'Develop users API',           projectAr: 'نظام الموارد البشرية', projectEn: 'HR System',       deadline: '2026-07-15', priority: 'high',   status: 'inProgress' },
  { id: '3', titleAr: 'مراجعة متطلبات المشروع',      titleEn: 'Review project requirements', projectAr: 'تطبيق الموبايل',       projectEn: 'Mobile App',      deadline: '2026-06-28', priority: 'medium', status: 'completed'  },
  { id: '4', titleAr: 'كتابة وثائق الـ API',         titleEn: 'Write API documentation',     projectAr: 'تطبيق الموبايل',       projectEn: 'Mobile App',      deadline: '2026-07-20', priority: 'low',    status: 'pending'    },
  { id: '5', titleAr: 'إعداد بيئة الاختبار',         titleEn: 'Setup test environment',      projectAr: 'بوابة العميل',         projectEn: 'Client Portal',   deadline: '2026-07-05', priority: 'medium', status: 'pending'    },
  { id: '6', titleAr: 'تحسين أداء قاعدة البيانات',   titleEn: 'Optimize database performance',projectAr: 'نظام الموارد البشرية', projectEn: 'HR System',       deadline: '2026-06-25', priority: 'high',   status: 'completed'  },
  { id: '7', titleAr: 'اختبار وحدات الدفع',          titleEn: 'Test payment modules',        projectAr: 'بوابة العميل',         projectEn: 'Client Portal',   deadline: '2026-07-18', priority: 'medium', status: 'pending'    },
];

export const employeeTaskApi = {
  list() {
    return delay<EmpTaskListResponse>({
      status: 'success',
      data:   { data: [...mockTasks] },
    });
  },
};
