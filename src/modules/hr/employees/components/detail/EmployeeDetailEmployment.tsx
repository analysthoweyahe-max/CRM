import { Briefcase, Clock, Wallet, CalendarDays } from 'lucide-react';
import type { ApiEmployee } from '../../types/employee.types';
import { mapEmploymentType } from '../../types/employee.types';

interface Props { emp: ApiEmployee; isAr: boolean }

export function EmployeeDetailEmployment({ emp, isAr }: Props) {
  const requiredHours = emp.shiftStart && emp.shiftEnd
    ? calcHours(emp.shiftStart, emp.shiftEnd)
    : null;

  const fields = [
    {
      icon:  <Briefcase size={16} />,
      label: isAr ? 'نوع التوظيف'          : 'Employment Type',
      value: mapEmploymentType(emp.employmentType, isAr),
    },
    {
      icon:  <Clock size={16} />,
      label: isAr ? 'وقت بدء الدوام'        : 'Start Time',
      value: emp.shiftStart ?? '–',
    },
    {
      icon:  <Clock size={16} />,
      label: isAr ? 'وقت انتهاء الدوام'     : 'End Time',
      value: emp.shiftEnd ?? '–',
    },
    {
      icon:  <Clock size={16} />,
      label: isAr ? 'ساعات العمل المطلوبة' : 'Required Hours',
      value: requiredHours != null
        ? `${requiredHours} ${isAr ? 'ساعات' : 'hours'}`
        : '–',
    },
    {
      icon:  <Wallet size={16} />,
      label: isAr ? 'الراتب الأساسي'        : 'Base Salary',
      value: emp.salary != null
        ? `${emp.salary.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`
        : '–',
    },
    {
      icon:  <CalendarDays size={16} />,
      label: isAr ? 'تاريخ الانضمام'        : 'Hire Date',
      value: emp.joiningDate ?? '–',
    },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100
                    dark:border-gray-700 shadow-sm p-6">
      <h3 className="text-sm font-bold mb-5 text-gray-800 dark:text-gray-100">
        {isAr ? 'تفاصيل التوظيف' : 'Employment Details'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {fields.map((f, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                            bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
              {f.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{f.label}</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{f.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.round((eh * 60 + em - (sh * 60 + sm)) / 60);
}
