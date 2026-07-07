import { useState } from 'react';
import { Mail, Phone, Building2, Briefcase, CalendarDays, Eye, SquarePen, XCircle } from 'lucide-react';
import type { ApiEmployee } from '../types/employee.types';
import { getAvatarColor, getInitial } from '../types/employee.types';
import { STATUS_STYLES } from '../data/employeeData';
import { Button }  from '@/shared/components/ui/Button';
import { Modal }   from '@/shared/components/ui/Modal';

interface EmployeeCardProps {
  emp:            ApiEmployee;
  isAr:           boolean;
  onView:         (id: string) => void;
  onEdit:         (id: string) => void;
  onDelete?:      (id: string) => void;
  selected?:      boolean;
  onToggleSelect?: (id: string) => void;
}

export function EmployeeCard({ emp, isAr, onView, onEdit, onDelete, selected, onToggleSelect }: EmployeeCardProps) {
  const st   = STATUS_STYLES[emp.status] ?? STATUS_STYLES.pending;
  const [showDelete, setShowDelete] = useState(false);

  const fields = [
    { icon: <Mail size={14} />,         text: emp.email                },
    { icon: <Phone size={14} />,        text: emp.phone ?? '–'         },
    { icon: <Building2 size={14} />,    text: emp.department?.name ?? '–' },
    { icon: <Briefcase size={14} />,    text: emp.jobTitle?.name ?? '–'   },
    { icon: <CalendarDays size={14} />, text: emp.joiningDate ?? '–'   },
  ];

  return (
    <>
      <div
        className={`rounded-2xl bg-white dark:bg-gray-800 flex flex-col
                   border transition-all duration-200 ease-out
                   hover:border-[#A0CD39] hover:-translate-y-0.5 hover:shadow-lg
                   ${selected ? 'border-[#A0CD39] ring-2 ring-[#A0CD39]/20' : 'border-[#F1F5F9] dark:border-gray-700'}`}
      >
        {/* ── Selection checkbox (kept outside the clickable body — an
             <input> nested inside a <button> is invalid HTML) ────────── */}
        {onToggleSelect && (
          <div className="flex items-center px-4 pt-4">
            <input
              type="checkbox"
              checked={!!selected}
              onChange={() => onToggleSelect(emp.id)}
              aria-label={isAr ? 'تحديد الموظف' : 'Select employee'}
              className="w-4 h-4 shrink-0 rounded border-gray-300 dark:border-gray-600 text-[#A0CD39] focus:ring-[#A0CD39]/40"
            />
          </div>
        )}

        {/* ── Clickable body ────────────────────────────── */}
        <button
          type="button"
          onClick={() => onView(emp.id)}
          className="flex flex-col text-start flex-1 cursor-pointer"
        >
          {/* Header */}
          <div className={`flex items-center justify-between gap-3 p-4 ${onToggleSelect ? 'pt-2' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-full ${getAvatarColor(emp.name)}
                            flex items-center justify-center shrink-0`}
              >
                <span className="text-sm font-bold text-white">{getInitial(emp.name)}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate text-gray-800 dark:text-gray-100">
                  {emp.name}
                </p>
                <p className="text-[11px] truncate mt-0.5 text-gray-500 dark:text-gray-400">
                  {emp.department?.name ?? '–'}
                </p>
              </div>
            </div>

            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                         text-[11px] font-semibold shrink-0"
              style={{ background: st.bg, color: st.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: st.dot }} />
              {isAr ? st.labelAr : st.labelEn}
            </span>
          </div>

          {/* Separator */}
          <div className="h-px mx-4 bg-[#D8EBAE] dark:bg-gray-700" />

          {/* Fields */}
          <div className="px-4 py-3 space-y-2.5 flex-1">
            {fields.map(({ icon, text }, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-gray-700 dark:text-gray-300">{text}</span>
                <span className="shrink-0 text-gray-400 dark:text-gray-500">{icon}</span>
              </div>
            ))}
          </div>
        </button>

        {/* ── Separator ─────────────────────────────────── */}
        <div className="h-px mx-4 bg-[#D8EBAE] dark:bg-gray-700" />

        {/* ── Actions ───────────────────────────────────── */}
        <div className="flex items-center gap-1 px-4 py-3">
          <Button
            variant="icon-brand"
            type="button"
            onClick={() => onView(emp.id)}
            aria-label={isAr ? 'عرض' : 'View'}
          >
            <Eye size={15} />
          </Button>

          <Button
            variant="icon"
            type="button"
            onClick={() => onEdit(emp.id)}
            aria-label={isAr ? 'تعديل' : 'Edit'}
          >
            <SquarePen size={14} />
          </Button>

          {onDelete && (
            <Button
              variant="icon-danger"
              type="button"
              onClick={() => setShowDelete(true)}
              aria-label={isAr ? 'حذف' : 'Delete'}
            >
              <XCircle size={15} />
            </Button>
          )}
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title={isAr ? 'حذف الموظف' : 'Delete Employee'}
        description={
          isAr
            ? `هل أنت متأكد من حذف "${emp.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete "${emp.name}"? This action cannot be undone.`
        }
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDelete(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="danger"
              onClick={() => { onDelete?.(emp.id); setShowDelete(false); }}
            >
              {isAr ? 'حذف' : 'Delete'}
            </Button>
          </>
        }
      />
    </>
  );
}
