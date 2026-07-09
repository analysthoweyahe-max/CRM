import { useState } from 'react';
import { Briefcase, Clock, Wallet, CalendarDays, Building2, SquarePen } from 'lucide-react';
import type { ApiEmployee } from '../../types/employee.types';
import { mapEmploymentType } from '../../types/employee.types';
import { EditEmploymentTypeModal } from '../edit-modals/EditEmploymentTypeModal';
import { EditSalaryModal }         from '../edit-modals/EditSalaryModal';
import { EditWorkScheduleModal }   from '../edit-modals/EditWorkScheduleModal';
import { EditDepartmentModal }     from '../edit-modals/EditDepartmentModal';

type ModalKey = 'employmentType' | 'salary' | 'workSchedule' | 'department' | null;

interface Props { emp: ApiEmployee; isAr: boolean }

export function EmployeeDetailEmployment({ emp, isAr }: Props) {
  const [openModal, setOpenModal] = useState<ModalKey>(null);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section
          title={isAr ? 'نوع التوظيف' : 'Employment Type'}
          onEdit={() => setOpenModal('employmentType')}
        >
          <Field icon={<Briefcase size={15} />} label={isAr ? 'نوع التوظيف' : 'Type'}>
            {emp.employmentTypeLabel || mapEmploymentType(emp.employmentType, isAr)}
          </Field>
        </Section>

        <Section
          title={isAr ? 'الراتب' : 'Salary'}
          onEdit={() => setOpenModal('salary')}
        >
          <Field icon={<Wallet size={15} />} label={isAr ? 'الراتب الأساسي' : 'Basic Salary'}>
            {emp.salary != null
              ? `${emp.salary.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`
              : '–'}
          </Field>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section
          title={isAr ? 'جدول الدوام' : 'Work Schedule'}
          onEdit={() => setOpenModal('workSchedule')}
        >
          <Field icon={<Clock size={15} />} label={isAr ? 'عدد ساعات العمل اليومية' : 'Daily Working Hours'}>
            {emp.workingHours != null ? `${emp.workingHours} ${isAr ? 'ساعات' : 'hrs'}` : '–'}
          </Field>
        </Section>

        <Section
          title={isAr ? 'القسم' : 'Department'}
          onEdit={() => setOpenModal('department')}
        >
          <Field icon={<Building2 size={15} />} label={isAr ? 'القسم الحالي' : 'Current Department'}>
            {emp.department?.name ?? '–'}
          </Field>
        </Section>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-sm font-bold mb-5 text-gray-800 dark:text-gray-100">
          {isAr ? 'تاريخ الانضمام' : 'Hire Date'}
        </h3>
        <Field icon={<CalendarDays size={15} />} label={isAr ? 'تاريخ الانضمام' : 'Joining Date'}>
          {emp.joiningDate ?? '–'}
        </Field>
      </div>

      <EditEmploymentTypeModal
        open={openModal === 'employmentType'}
        onClose={() => setOpenModal(null)}
        employeeId={emp.id}
        current={emp.employmentType}
        isAr={isAr}
      />
      <EditSalaryModal
        open={openModal === 'salary'}
        onClose={() => setOpenModal(null)}
        employeeId={emp.id}
        current={emp.salary}
        isAr={isAr}
      />
      <EditWorkScheduleModal
        open={openModal === 'workSchedule'}
        onClose={() => setOpenModal(null)}
        employeeId={emp.id}
        currentHours={emp.workingHours}
        isAr={isAr}
      />
      <EditDepartmentModal
        open={openModal === 'department'}
        onClose={() => setOpenModal(null)}
        employeeId={emp.id}
        current={emp.department}
        isAr={isAr}
      />
    </>
  );
}

function Section({
  title, onEdit, children,
}: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 rounded-lg text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE] dark:hover:bg-[#D8EBAE]/10 transition-colors"
        >
          <SquarePen size={15} />
        </button>
      </div>
      {children}
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                      bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{children}</p>
      </div>
    </div>
  );
}
