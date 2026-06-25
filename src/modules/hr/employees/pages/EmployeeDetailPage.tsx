import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight,
  Mail, Phone, Building2, Briefcase, CalendarDays,
  Hash, User, SquarePen, MessageSquare,
} from 'lucide-react';

import { useLang }    from '@/app/providers/LanguageProvider';
import { ROUTES }     from '@/app/router/routes';
import { Button }     from '@/shared/components/ui/Button';
import { STATUS_STYLES } from '../data/employeeData';
import { getAvatarColor, getInitial, mapEmploymentType } from '../types/employee.types';
import { useEmployee } from '../hooks/useEmployee';
import { EmployeeDetailEmployment } from '../components/detail/EmployeeDetailEmployment';
import { EmployeeDetailPayroll }    from '../components/detail/EmployeeDetailPayroll';
import { EmployeeDetailAttendance } from '../components/detail/EmployeeDetailAttendance';
import { EmployeeDetailLeaves }     from '../components/detail/EmployeeDetailLeaves';
import { EditEmployeeModal }        from '../components/edit-modals/EditEmployeeModal';

type Tab = 'summary' | 'employment' | 'payroll' | 'attendance' | 'leaves';

const TABS_AR = ['الملخص العام', 'تفاصيل التوظيف', 'سجل الرواتب', 'سجل الحضور', 'سجل الإجازات'];
const TABS_EN = ['Overview', 'Employment', 'Payroll', 'Attendance', 'Leaves'];
const TAB_KEYS: Tab[] = ['summary', 'employment', 'payroll', 'attendance', 'leaves'];

export function EmployeeDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const { lang }  = useLang();
  const navigate  = useNavigate();
  const isAr      = lang === 'ar';

  const [activeTab, setActiveTab]   = useState<Tab>('summary');
  const [editOpen,  setEditOpen]    = useState(false);

  const { data: emp, isLoading, isError } = useEmployee(id);

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  if (isError || !emp) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        {isAr ? 'الموظف غير موجود' : 'Employee not found'}
      </div>
    );
  }

  const st = STATUS_STYLES[emp.status] ?? STATUS_STYLES.pending;

  const infoFields = [
    { label: isAr ? 'الاسم الكامل'      : 'Full Name',       icon: <User size={15} />,         value: emp.name                          },
    { label: isAr ? 'رقم الهاتف'        : 'Phone',           icon: <Phone size={15} />,        value: emp.phone ?? '–'                  },
    { label: isAr ? 'البريد الإلكتروني' : 'Email',           icon: <Mail size={15} />,         value: emp.email                         },
    { label: isAr ? 'القسم'             : 'Department',      icon: <Building2 size={15} />,    value: emp.department?.name ?? '–'       },
    { label: isAr ? 'المسمى الوظيفي'   : 'Job Title',       icon: <Briefcase size={15} />,    value: emp.jobTitle?.name ?? '–'         },
    { label: isAr ? 'المدير المباشر'   : 'Direct Manager',  icon: <User size={15} />,         value: emp.manager?.name ?? (isAr ? 'غير محدد' : 'N/A') },
    { label: isAr ? 'معرف الموظف'      : 'Employee ID',     icon: <Hash size={15} />,         value: emp.employeeNumber ?? emp.id       },
    { label: isAr ? 'تاريخ الانضمام'   : 'Hire Date',       icon: <CalendarDays size={15} />, value: emp.joiningDate ?? '–'            },
  ];

  const leaveAnnual    = 21;
  const leaveUsed      = 4;
  const leaveRemaining = leaveAnnual - leaveUsed;
  const usedPct        = Math.round((leaveUsed / leaveAnnual) * 100);

  return (
    <div className="space-y-5">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.EMPLOYEES.LIST)}
            className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isAr ? 'رجوع' : 'Back'}
          >
            <BackIcon size={18} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {isAr ? 'الملف الوظيفي' : 'Employee Profile'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" startIcon={<MessageSquare size={15} />}>
            {isAr ? 'مراسلة' : 'Message'}
          </Button>
          <Button
            startIcon={<SquarePen size={15} />}
            onClick={() => setEditOpen(true)}
          >
            {isAr ? 'تعديل البيانات' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* ── Banner card ─────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700
                      bg-white dark:bg-gray-800 shadow-sm">
        {/* Green gradient banner */}
        <div className="h-28" style={{ background: 'linear-gradient(135deg, #A0CD39 0%, #709028 100%)' }} />

        {/* Avatar + info */}
        <div className="px-6 pb-0">
          <div className="-mt-8 mb-4">
            <div
              className={`w-16 h-16 rounded-full ${getAvatarColor(emp.name)}
                          border-4 border-white dark:border-gray-800
                          flex items-center justify-center`}
            >
              <span className="text-xl font-bold text-white">{getInitial(emp.name)}</span>
            </div>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4 pb-5">
            {/* Name + status */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{emp.name}</h2>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ background: st.bg, color: st.text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                  {isAr ? st.labelAr : st.labelEn}
                </span>
              </div>
              <p className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">
                {emp.jobTitle?.name ?? '–'} · {emp.department?.name ?? '–'}
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-5 text-sm">
              <div className="text-center">
                <p className="font-bold text-gray-800 dark:text-gray-100">
                  {mapEmploymentType(emp.employmentType, isAr)}
                </p>
                <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
                  {isAr ? 'نوع التوظيف' : 'Employment Type'}
                </p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-600" />
              <div className="text-center">
                <p className="font-bold text-gray-800 dark:text-gray-100">
                  {leaveRemaining} {isAr ? 'يوم' : 'days'}
                </p>
                <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
                  {isAr ? 'رصيد الإجازات' : 'Leave Balance'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-100 dark:border-gray-700 px-6">
          <div className="flex overflow-x-auto">
            {TAB_KEYS.map((key, i) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === key
                    ? 'border-[#A0CD39] text-[#709028] dark:text-[#A0CD39]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {isAr ? TABS_AR[i] : TABS_EN[i]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────── */}

      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* General info */}
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-800
                          border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {isAr ? 'المعلومات العامة' : 'General Information'}
              </h3>
              <button
                type="button"
                onClick={() => navigate(ROUTES.EMPLOYEES.EDIT(id!))}
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE] dark:hover:bg-[#D8EBAE]/10 transition-colors"
              >
                <SquarePen size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {infoFields.map((field, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                  bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]">
                    {field.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs mb-0.5 text-gray-400 dark:text-gray-500">{field.label}</p>
                    <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-100">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave balance */}
          <div className="rounded-2xl bg-white dark:bg-gray-800
                          border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-sm font-bold mb-5 text-gray-800 dark:text-gray-100">
              {isAr ? 'رصيد الإجازات' : 'Leave Balance'}
            </h3>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">{leaveAnnual}</p>
              <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
                {isAr ? 'إجمالي الرصيد السنوي' : 'Total Annual Balance'}
              </p>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl p-4 text-center bg-red-50 dark:bg-red-900/20">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{leaveUsed}</p>
                <p className="text-xs mt-0.5 text-red-400">{isAr ? 'المستخدم' : 'Used'}</p>
              </div>
              <div className="rounded-xl p-4 text-center bg-[#D8EBAE] dark:bg-[#D8EBAE]/10">
                <p className="text-2xl font-bold text-[#709028] dark:text-[#A0CD39]">{leaveRemaining}</p>
                <p className="text-xs mt-0.5 text-[#709028]/70">{isAr ? 'المتبقي' : 'Remaining'}</p>
              </div>
            </div>
            <p className="text-xs text-center mt-4 text-gray-400 dark:text-gray-500">
              {isAr ? `تم استخدام ${usedPct}% من الرصيد السنوي` : `${usedPct}% of annual balance used`}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'employment' && <EmployeeDetailEmployment emp={emp} isAr={isAr} />}
      {activeTab === 'payroll'    && <EmployeeDetailPayroll    isAr={isAr} />}
      {activeTab === 'attendance' && <EmployeeDetailAttendance employeeId={emp.id} isAr={isAr} />}
      {activeTab === 'leaves'     && <EmployeeDetailLeaves     isAr={isAr} />}

      <EditEmployeeModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        emp={emp}
        isAr={isAr}
      />

    </div>
  );
}
