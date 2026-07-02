import { useMemo, useState } from 'react';
import type { AdminEmployee } from '../types/adminEmployee.types';

const PAGE_SIZE  = 7;
const MOCK_TOTAL = 48;
const PAGE_COUNT = 4;

const STATUS_LABEL: Record<AdminEmployee['status'], { ar: string; en: string }> = {
  active:   { ar: 'نشط',  en: 'Active'   },
  disabled: { ar: 'معطل', en: 'Disabled' },
  pending:  { ar: 'معلق', en: 'Pending'  },
};

function emp(
  id: string, name: string, email: string, avatarInitial: string, avatarColor: string,
  department: string, jobTitle: string, role: string,
  status: AdminEmployee['status'], lastLoginAr: string, lastLoginEn: string,
): AdminEmployee {
  return {
    id, name, email, avatarInitial, avatarColor, department, jobTitle, role, status,
    statusLabelAr: STATUS_LABEL[status].ar,
    statusLabelEn: STATUS_LABEL[status].en,
    lastLoginAr, lastLoginEn,
  };
}

const MOCK_EMPLOYEES: AdminEmployee[] = [
  emp('1', 'محمد علي',    'mohamed@howeyah.com', 'مع',  'bg-emerald-500', 'التطوير',         'مطور واجهات',    'موظف',        'active',   'اليوم · 09:14', 'Today · 09:14'),
  emp('2', 'سارة خليل',   'sara@howeyah.com',    'سخ',  'bg-purple-500',  'التصميم',         'مصممة UI/UX',    'موظف',        'active',   'اليوم · 08:50', 'Today · 08:50'),
  emp('3', 'يوسف حسن',    'youssef@howeyah.com', 'يح',  'bg-cyan-500',    'التطوير',         'مطور خلفية',     'موظف',        'active',   'أمس · 17:22',   'Yesterday · 17:22'),
  emp('4', 'ليلى عمر',    'layla@howeyah.com',   'لع',  'bg-pink-500',    'التسويق',         'مختصة جودة',     'مدير مشاريع', 'active',   'اليوم · 10:05', 'Today · 10:05'),
  emp('5', 'خالد العمري', 'khaled@howeyah.com',  'خع',  'bg-orange-500',  'التطوير',         'مطور تطبيقات',   'موظف',        'disabled', 'قبل 3 أيام',    '3 days ago'),
  emp('6', 'منى الشريف',  'mona@howeyah.com',    'منش', 'bg-blue-500',    'الموارد البشرية', 'مديرة موارد بشرية', 'HR',       'active',   'اليوم · 08:30', 'Today · 08:30'),
  emp('7', 'عمر فهد',     'omar@howeyah.com',    'عف',  'bg-gray-500',    'الدعم الفني',     'أخصائي دعم',     'موظف',        'pending',  'منذ أسبوع',     'A week ago'),
];

export function useAdminEmployees() {
  const [employees,  setEmployees]  = useState<AdminEmployee[]>(MOCK_EMPLOYEES);
  const [search,     setSearchRaw]     = useState('');
  const [department, setDepartmentRaw] = useState('');
  const [role,       setRoleRaw]       = useState('');
  const [status,     setStatusRaw]     = useState('');
  const [page,       setPage]          = useState(1);

  const filtered = useMemo(() => employees.filter(e => {
    if (search && !`${e.name} ${e.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (department && e.department !== department) return false;
    if (role && e.role !== role) return false;
    if (status && e.status !== status) return false;
    return true;
  }), [employees, search, department, role, status]);

  const departmentOptions = useMemo(() => [...new Set(employees.map(e => e.department))], [employees]);
  const roleOptions       = useMemo(() => [...new Set(employees.map(e => e.role))], [employees]);

  function setSearch(v: string)     { setSearchRaw(v);     setPage(1); }
  function setDepartment(v: string) { setDepartmentRaw(v); setPage(1); }
  function setRole(v: string)       { setRoleRaw(v);       setPage(1); }
  function setStatus(v: string)     { setStatusRaw(v);     setPage(1); }

  function addEmployee(newEmp: AdminEmployee) {
    setEmployees(prev => [newEmp, ...prev]);
  }

  return {
    employees: filtered,
    total: MOCK_TOTAL,
    pageSize: PAGE_SIZE,
    page, setPage, pageCount: PAGE_COUNT,
    search, department, role, status,
    setSearch, setDepartment, setRole, setStatus,
    departmentOptions, roleOptions,
    addEmployee,
  };
}
