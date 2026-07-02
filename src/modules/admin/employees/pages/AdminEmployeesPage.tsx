import { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { getAvatarColor, getInitial } from '@/shared/utils';
import { AdminEmployeeFilters } from '../components/AdminEmployeeFilters';
import { AdminEmployeeTable }   from '../components/AdminEmployeeTable';
import { AddEmployeeModal }     from '../components/AddEmployeeModal';
import { useAdminEmployees }    from '../hooks/useAdminEmployees';
import type { NewAdminEmployeeInput } from '../types/adminEmployee.types';

export function AdminEmployeesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    employees, total, pageSize, page, setPage, pageCount,
    search, department, role, status,
    setSearch, setDepartment, setRole, setStatus,
    departmentOptions, roleOptions,
    addEmployee,
  } = useAdminEmployees();

  const [showAdd, setShowAdd] = useState(false);

  function handleAdd(input: NewAdminEmployeeInput) {
    addEmployee({
      id:            String(Date.now()),
      name:          input.fullName,
      email:         input.email,
      avatarInitial: getInitial(input.fullName),
      avatarColor:   getAvatarColor(input.fullName),
      department:    input.department || '—',
      jobTitle:      input.jobTitle,
      role:          input.role,
      status:        input.accountStatus === 'نشط' ? 'active' : 'disabled',
      statusLabelAr: input.accountStatus,
      statusLabelEn: input.accountStatus === 'نشط' ? 'Active' : 'Disabled',
      lastLoginAr:   isAr ? 'لم يسجل الدخول بعد' : 'Never logged in',
      lastLoginEn:   'Never logged in',
    });
    setShowAdd(false);
  }

  function handleExport() {
    const headers = isAr
      ? ['الاسم', 'البريد الإلكتروني', 'القسم', 'المسمى الوظيفي', 'الدور', 'الحالة']
      : ['Name', 'Email', 'Department', 'Job Title', 'Role', 'Status'];

    const rows = employees.map(e => [
      e.name, e.email, e.department, e.jobTitle, e.role, isAr ? e.statusLabelAr : e.statusLabelEn,
    ]);

    const cell = (v: string) => `<Cell><Data ss:Type="String">${v}</Data></Cell>`;
    const xml = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`,
      `  <Worksheet ss:Name="${isAr ? 'الموظفون' : 'Employees'}"><Table>`,
      `    <Row>${headers.map(cell).join('')}</Row>`,
      ...rows.map(r => `    <Row>${r.map(cell).join('')}</Row>`),
      `  </Table></Worksheet>`,
      `</Workbook>`,
    ].join('\n');

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'employees.xls' });
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'إدارة الموظفين' : 'Employee Management'}
        subtitle={isAr ? 'عرض وإدارة جميع موظفي المؤسسة وصلاحياتهم' : "View and manage the organization's employees and permissions"}
        actions={
          <>
            <Button variant="secondary" startIcon={<Download size={15} />} onClick={handleExport}>
              {isAr ? 'تصدير' : 'Export'}
            </Button>
            <Button variant="primary" startIcon={<Plus size={15} />} onClick={() => setShowAdd(true)}>
              {isAr ? 'إضافة موظف' : 'Add Employee'}
            </Button>
          </>
        }
      />

      <AdminEmployeeFilters
        isAr={isAr}
        search={search} department={department} role={role} status={status}
        departmentOptions={departmentOptions} roleOptions={roleOptions}
        onSearch={setSearch} onDepartment={setDepartment} onRole={setRole} onStatus={setStatus}
      />

      <AdminEmployeeTable
        employees={employees}
        isAr={isAr}
        page={page} pageCount={pageCount} total={total} pageSize={pageSize}
        onPage={setPage}
      />

      <AddEmployeeModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        departmentOptions={departmentOptions}
        onSubmit={handleAdd}
        isAr={isAr}
      />

    </div>
  );
}
