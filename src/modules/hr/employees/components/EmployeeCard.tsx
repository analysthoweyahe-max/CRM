import { useState } from 'react';
import { Mail, Phone, Building2, Briefcase, CalendarDays, Eye, SquarePen, XCircle } from 'lucide-react';
import type { ApiEmployee } from '../types/employee.types';
import {
  getAvatarColor,
  getInitial,
  formatEmployeeDepartments,
  employeeDepartmentsList,
  resolveDisplayText,
} from '../types/employee.types';
import { STATUS_STYLES } from '../data/employeeData';
import { Button }  from '@/shared/components/ui/Button';
import { Input }   from '@/shared/components/ui/Input';
import { Modal }   from '@/shared/components/ui/Modal';
import { Badge }   from '@/shared/components/ui/Badge';

const DELETE_CONFIRM_WORD = { ar: 'حذف', en: 'delete' } as const;

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
  const [confirmText, setConfirmText] = useState('');

  const confirmWord = isAr ? DELETE_CONFIRM_WORD.ar : DELETE_CONFIRM_WORD.en;
  const canDelete   = confirmText.trim() === confirmWord
    || (!isAr && confirmText.trim().toLowerCase() === confirmWord);

  const depts = employeeDepartmentsList(emp);
  const deptSummary = formatEmployeeDepartments(emp, isAr);

  function closeDeleteModal() {
    setShowDelete(false);
    setConfirmText('');
  }

  const fields = [
    { icon: <Mail size={18} />,         text: emp.email                },
    { icon: <Phone size={18} />,        text: emp.phone ?? '–'         },
    { icon: <Building2 size={18} />,    text: deptSummary              },
    { icon: <Briefcase size={18} />,    text: emp.jobTitle?.name ?? '–'   },
    { icon: <CalendarDays size={18} />, text: emp.joiningDate ?? '–'   },
  ];

  return (
    <>
      <div
        className={`rounded-2xl bg-white dark:bg-gray-800 flex flex-col
                   border transition-all duration-200 ease-out
                   hover:border-[#A0CD39] hover:-translate-y-0.5 hover:shadow-lg
                   ${selected ? 'border-[#A0CD39] ring-2 ring-[#A0CD39]/20' : 'border-[#F1F5F9] dark:border-gray-700'}`}
      >
        {onToggleSelect && (
          <div className="flex items-center px-4 pt-4">
            <input
              type="checkbox"
              checked={!!selected}
              onChange={() => onToggleSelect(emp.id)}
              aria-label={isAr ? 'تحديد الموظف' : 'Select employee'}
              className="w-5 h-5 shrink-0 rounded border-gray-300 dark:border-gray-600 text-[#A0CD39] focus:ring-[#A0CD39]/40"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => onView(emp.id)}
          className="flex flex-col text-start flex-1 cursor-pointer"
        >
          <div className={`flex items-center justify-between gap-3 p-4 ${onToggleSelect ? 'pt-2' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-12 h-12 rounded-full ${getAvatarColor(emp.name)}
                            flex items-center justify-center shrink-0`}
              >
                <span className="text-base font-bold text-white">{getInitial(emp.name)}</span>
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold truncate text-gray-800 dark:text-gray-100">
                  {emp.name}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {depts.length > 0 ? depts.map((d, i) => (
                    <Badge
                      key={String(d.id)}
                      label={resolveDisplayText(d, isAr) || String(d.id)}
                      variant={i === 0 ? 'brand' : 'gray'}
                      className="!text-[10px]"
                    />
                  )) : (
                    <p className="text-sm truncate text-gray-500 dark:text-gray-400">–</p>
                  )}
                </div>
              </div>
            </div>

            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                         text-xs font-semibold shrink-0"
              style={{ background: st.bg, color: st.text }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: st.dot }} />
              {isAr ? st.labelAr : st.labelEn}
            </span>
          </div>

          <div className="h-px mx-4 bg-[#D8EBAE] dark:bg-gray-700" />

          <div className="px-4 py-3.5 space-y-3 flex-1">
            {fields.map(({ icon, text }, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-gray-700 dark:text-gray-300">{text}</span>
                <span className="shrink-0 text-gray-500 dark:text-gray-400">{icon}</span>
              </div>
            ))}
          </div>
        </button>

        <div className="h-px mx-4 bg-[#D8EBAE] dark:bg-gray-700" />

        <div className="flex items-center gap-1.5 px-4 py-3.5">
          <Button
            variant="icon-brand"
            type="button"
            className="!w-10 !h-10"
            onClick={() => onView(emp.id)}
            aria-label={isAr ? 'عرض' : 'View'}
          >
            <Eye size={20} strokeWidth={2} />
          </Button>

          <Button
            variant="icon"
            type="button"
            className="!w-10 !h-10"
            onClick={() => onEdit(emp.id)}
            aria-label={isAr ? 'تعديل' : 'Edit'}
          >
            <SquarePen size={19} strokeWidth={2} />
          </Button>

          {onDelete && (
            <Button
              variant="icon-danger"
              type="button"
              className="!w-10 !h-10"
              onClick={() => setShowDelete(true)}
              aria-label={isAr ? 'حذف' : 'Delete'}
            >
              <XCircle size={20} strokeWidth={2} />
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={showDelete}
        onClose={closeDeleteModal}
        title={isAr ? 'حذف الموظف' : 'Delete Employee'}
        description={
          isAr
            ? `هل أنت متأكد من حذف "${emp.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete "${emp.name}"? This action cannot be undone.`
        }
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={closeDeleteModal}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="danger"
              disabled={!canDelete}
              onClick={() => { onDelete?.(emp.id); closeDeleteModal(); }}
            >
              {isAr ? 'حذف' : 'Delete'}
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <label htmlFor={`delete-confirm-${emp.id}`} className="block text-sm text-gray-600 dark:text-gray-300">
            {isAr
              ? <>اكتب <span className="font-semibold text-gray-900 dark:text-gray-100">حذف</span> للتأكيد</>
              : <>Type <span className="font-semibold text-gray-900 dark:text-gray-100">delete</span> to confirm</>
            }
          </label>
          <Input
            id={`delete-confirm-${emp.id}`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={confirmWord}
            autoComplete="off"
          />
        </div>
      </Modal>
    </>
  );
}
