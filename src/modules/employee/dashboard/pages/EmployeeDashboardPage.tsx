import { CheckCircle, Eye, RefreshCw, Clock } from 'lucide-react';
import { useLang }        from '@/app/providers/LanguageProvider';
import { EmpStatCard }    from '../components/EmpStatCard';
import { TodayTasksList } from '../components/TodayTasksList';
import type { EmployeeTask } from '@/modules/employee/tasks/types/employeeTask.types';

const MOCK_TASKS: EmployeeTask[] = [
  {
    id: '1',
    titleAr: 'تطوير واجهة المستخدم',
    titleEn: 'Develop User Interface',
    projectAr: 'موقع الشركة الإلكتروني',
    projectEn: 'Company Website',
    status: 'inProgress',
    priority: 'high',
    deadline: '2026-06-25',
  },
  {
    id: '2',
    titleAr: 'تطوير شاشة الطلبات',
    titleEn: 'Develop Requests Screen',
    projectAr: 'تطبيق نماء للتوصيل',
    projectEn: 'Namaa Delivery App',
    status: 'inProgress',
    priority: 'high',
    deadline: '2026-06-25',
  },
];

export function EmployeeDashboardPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {isAr ? 'مرحباً، محمد علي 👋' : 'Welcome, Mohammed Ali 👋'}
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EmpStatCard
          icon={<CheckCircle size={20} className="text-[#709028]" />}
          iconBg="bg-[#D8EBAE] dark:bg-[#A0CD39]/20"
          value={12}
          labelAr="مكتمل"
          labelEn="Completed"
          isAr={isAr}
        />
        <EmpStatCard
          icon={<Eye size={20} className="text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          value={12}
          labelAr="بحاجة للمراجعة"
          labelEn="Needs Review"
          isAr={isAr}
        />
        <EmpStatCard
          icon={<RefreshCw size={20} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          value={12}
          labelAr="قيد التنفيذ"
          labelEn="In Progress"
          isAr={isAr}
        />
        <EmpStatCard
          icon={<Clock size={20} className="text-gray-500" />}
          iconBg="bg-gray-100 dark:bg-gray-700"
          value={0}
          labelAr="قيد الانتظار"
          labelEn="Pending"
          isAr={isAr}
        />
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {isAr ? 'مهام اليوم' : "Today's Tasks"}
        </h2>
        <TodayTasksList tasks={MOCK_TASKS} isAr={isAr} />
      </div>

    </div>
  );
}
