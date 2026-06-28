import { Calendar, Briefcase, Building2 } from 'lucide-react';
import { useAuth }   from '@/modules/auth/context/AuthContext';
import { EMPLOYEES } from '@/modules/hr/employees/data/employeeData';

function yearsOfService(hireDate: string): number {
  const [d, m, y] = hireDate.split('/').map(Number);
  const hire = new Date(y, m - 1, d);
  const now  = new Date();
  return Math.floor((now.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export function useEmployeeProfileSummary(isAr: boolean) {
  const { user } = useAuth();
  const emp      = EMPLOYEES.find(e => e.id === user?.employeeId);

  const initial  = (user?.fullName ?? 'E').slice(0, 1).toUpperCase();
  const avatarBg = emp?.avatarBg ?? 'bg-[#A0CD39]';
  const fullName = user?.fullName ?? '';
  const jobTitle = isAr ? (emp?.jobTitle   ?? '') : (emp?.jobTitleEn ?? '');
  const dept     = isAr ? (emp?.department ?? '') : (emp?.deptEn     ?? '');
  const years    = emp?.hireDate ? yearsOfService(emp.hireDate) : 0;
  const hireDate = emp?.hireDate ?? '—';

  const stats = [
    { icon: Building2, label: isAr ? 'القسم'           : 'Department',       value: dept     },
    { icon: Calendar,  label: isAr ? 'تاريخ الالتحاق'  : 'Hire Date',        value: hireDate },
    { icon: Briefcase, label: isAr ? 'سنوات الخدمة'    : 'Years of Service', value: `${years}` },
  ];

  return { initial, avatarBg, fullName, jobTitle, stats };
}
