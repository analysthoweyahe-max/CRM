import { Mail, Phone, Building2, Briefcase, CalendarDays, Eye, SquarePen, XCircle } from 'lucide-react';
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

  /* In RTL flex: first child → RIGHT, second child → LEFT */
  const fields = [
    { icon: <Mail size={14} />,         text: emp.email    },
    { icon: <Phone size={14} />,        text: emp.phone    },
    { icon: <Building2 size={14} />,    text: dept         },
    { icon: <Briefcase size={14} />,    text: title        },
    { icon: <CalendarDays size={14} />, text: emp.hireDate },
  ];

  return (
    <div
      className="rounded-2xl bg-white dark:bg-gray-800 flex flex-col
                 border border-[#F1F5F9]
                 transition-all duration-200 ease-out
                 hover:border-[#A0CD39] hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 p-4">

        {/* Avatar + Name — first in DOM = RIGHT in RTL */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-full ${emp.avatarBg}
                        flex items-center justify-center shrink-0`}
          >
            <span className="text-sm font-bold text-white">{emp.initial}</span>
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-bold truncate"
              style={{ color: '#302F33' }}
            >
              {name}
            </p>
            <p
              className="text-[11px] truncate mt-0.5"
              style={{ color: '#595959' }}
            >
              {dept}
            </p>
          </div>
        </div>

        {/* Status badge — second in DOM = LEFT in RTL */}
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                     text-[11px] font-semibold shrink-0"
          style={{ background: st.bg, color: st.text }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: st.dot }}
          />
          {isAr ? st.labelAr : st.labelEn}
        </span>
      </div>

      {/* ── Separator ─────────────────────────────────── */}
      <div className="h-px mx-4" style={{ background: '#D8EBAE' }} />

      {/* ── Fields ────────────────────────────────────── */}
      <div className="px-4 py-3 space-y-2.5 flex-1">
        {fields.map(({ icon, text }, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 text-xs"
          >
            {/* text — first = RIGHT in RTL */}
            <span className="truncate" style={{ color: '#302F33' }}>{text}</span>
            {/* icon — second = LEFT in RTL */}
            <span className="shrink-0" style={{ color: '#595959' }}>{icon}</span>
          </div>
        ))}
      </div>

      {/* ── Separator ─────────────────────────────────── */}
      <div className="h-px mx-4" style={{ background: '#D8EBAE' }} />

      {/* ── Actions ───────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 py-3">
        <button
          type="button"
          onClick={() => onView(emp.id)}
          className="flex items-center justify-center w-8 h-8 rounded-lg
                     transition-colors hover:bg-[#D8EBAE]"
          style={{ color: '#595959' }}
        >
          <Eye size={15} />
        </button>
        <button
          type="button"
          onClick={() => onEdit(emp.id)}
          className="flex items-center justify-center w-8 h-8 rounded-lg
                     transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          style={{ color: '#595959' }}
        >
          <SquarePen size={14} />
        </button>
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-lg
                     transition-colors hover:bg-[#F0A696]"
          style={{ color: '#BE123C' }}
        >
          <XCircle size={15} />
        </button>
      </div>
    </div>
  );
}
