import { Mail, Phone, Building2, Briefcase, CalendarDays, Eye, Pencil, XCircle } from 'lucide-react';
import type { Employee } from '../data/employeeData';
import { STATUS_STYLES }  from '../data/employeeData';

interface EmployeeCardProps {
  emp:    Employee;
  isAr:   boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export function EmployeeCard({ emp, isAr, onView, onEdit }: EmployeeCardProps) {
  const name  = isAr ? emp.name       : emp.nameEn;
  const dept  = isAr ? emp.department : emp.deptEn;
  const title = isAr ? emp.jobTitle   : emp.jobTitleEn;
  const st    = STATUS_STYLES[emp.status];

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700
                    bg-white dark:bg-gray-800 shadow-sm flex flex-col
                    transition-all duration-200 ease-out
                    hover:border-[#A0CD39] hover:-translate-y-0.5 hover:shadow-md">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4">
        <span
          className="mt-0.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
          style={{ background: st.bg, color: st.text }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: st.dot }} />
          {isAr ? st.labelAr : st.labelEn}
        </span>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="text-end min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{name}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{dept}</p>
          </div>
          <div className={`w-9 h-9 rounded-full ${emp.avatarBg} flex items-center justify-center shrink-0`}>
            <span className="text-sm font-bold text-white">{emp.initial}</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-700 mx-4" />

      {/* Fields */}
      <div className="px-4 py-3 space-y-2 flex-1">
        {[
          { icon: <Mail size={13} />,         text: emp.email    },
          { icon: <Phone size={13} />,        text: emp.phone    },
          { icon: <Building2 size={13} />,    text: dept         },
          { icon: <Briefcase size={13} />,    text: title        },
          { icon: <CalendarDays size={13} />, text: emp.hireDate },
        ].map(({ icon, text }, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="text-gray-400 dark:text-gray-500 shrink-0">{icon}</span>
            <span className="truncate">{text}</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-700 mx-4" />

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 py-3">
        <button
          type="button"
          onClick={() => onView(emp.id)}
          className="flex items-center justify-center w-8 h-8 rounded-lg
                     text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE]
                     transition-colors"
        >
          <Eye size={15} />
        </button>
        <button
          type="button"
          onClick={() => onEdit(emp.id)}
          className="flex items-center justify-center w-8 h-8 rounded-lg
                     text-gray-400 hover:text-blue-600 hover:bg-blue-50
                     dark:hover:bg-blue-900/20 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-lg
                     text-gray-400 hover:text-[#861700] hover:bg-[#F0A696]
                     transition-colors"
        >
          <XCircle size={15} />
        </button>
      </div>
    </div>
  );
}
