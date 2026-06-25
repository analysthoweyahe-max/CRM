import type { ApiEmployee } from '@/modules/hr/employees/types/employee.types';

interface Props {
  emp:   ApiEmployee;
  total: number;
  isAr:  boolean;
}

export function EmployeeBanner({ emp, total, isAr }: Props) {
  return (
    <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl
                    bg-[#D8EBAE]/50 dark:bg-[#D8EBAE]/10
                    border border-[#A0CD39]/30
                    flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#A0CD39] flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-white">{emp.name.trim()[0]}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#709028] dark:text-[#A0CD39] truncate">{emp.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {[emp.department?.name, emp.jobTitle?.name].filter(Boolean).join(' · ') || (isAr ? 'غير محدد' : 'N/A')}
        </p>
      </div>
      {total > 0 && (
        <span className="ms-auto shrink-0 text-xs text-[#709028] dark:text-[#A0CD39] font-medium">
          {total} {isAr ? 'سجل' : 'records'}
        </span>
      )}
    </div>
  );
}
