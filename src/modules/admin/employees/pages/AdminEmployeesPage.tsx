import { useNavigate } from 'react-router-dom';
import { Download, Plus, Trash2 } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES }  from '@/app/router/routes';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { AdminEmployeeFilters }     from '../components/AdminEmployeeFilters';
import { AdminEmployeeTable }       from '../components/AdminEmployeeTable';
import { DeleteEmployeeModal }      from '../components/DeleteEmployeeModal';
import { BulkDeleteEmployeesModal } from '../components/BulkDeleteEmployeesModal';
import { useAdminEmployees }        from '../hooks/useAdminEmployees';

export function AdminEmployeesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();

  const {
    employees, total, pageSize, page, setPage, pageCount,
    search, department, role, status,
    setSearch, setDepartment, setRole, setStatus,
    departmentOptions, roleOptions,
    selected, toggleOne, toggleAllOnPage, selectedCount, clearSelection,
    pendingDelete, askDelete, cancelDelete, confirmDelete, deleting,
    showBulkDelete, askBulkDelete, cancelBulkDelete, confirmBulkDelete, bulkDeleting,
  } = useAdminEmployees(isAr);

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
            <Button variant="primary" startIcon={<Plus size={15} />} onClick={() => navigate(ROUTES.EMPLOYEES.NEW)}>
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

      {selectedCount > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                        bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40">
          <p className="text-sm text-red-700 dark:text-red-400">
            {isAr ? `${selectedCount} موظف محدد` : `${selectedCount} employee(s) selected`}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={clearSelection}>
              {isAr ? 'إلغاء التحديد' : 'Clear selection'}
            </Button>
            <Button variant="danger" startIcon={<Trash2 size={14} />} onClick={askBulkDelete}>
              {isAr ? 'حذف المحدد' : 'Delete Selected'}
            </Button>
          </div>
        </div>
      )}

      <AdminEmployeeTable
        employees={employees}
        isAr={isAr}
        page={page} pageCount={pageCount} total={total} pageSize={pageSize}
        onPage={setPage}
        onRowClick={id => navigate(ROUTES.ADMIN.EMPLOYEE_DETAIL(id))}
        selected={selected}
        onToggleOne={toggleOne}
        onToggleAll={toggleAllOnPage}
        onDelete={askDelete}
      />

      <DeleteEmployeeModal
        employee={pendingDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={deleting}
        isAr={isAr}
      />

      <BulkDeleteEmployeesModal
        open={showBulkDelete}
        count={selectedCount}
        onClose={cancelBulkDelete}
        onConfirm={confirmBulkDelete}
        isLoading={bulkDeleting}
        isAr={isAr}
      />

    </div>
  );
}
