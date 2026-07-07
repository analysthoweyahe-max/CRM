import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLang }     from '@/app/providers/LanguageProvider';
import { useAuth }     from '@/modules/auth/context/AuthContext';
import { ROUTES }      from '@/app/router/routes';
import { PageHeader }  from '@/shared/components/ui/PageHeader';
import { Button }      from '@/shared/components/ui/Button';
import { SearchInput } from '@/shared/components/form/SearchInput';
import { matchesSearch } from '@/shared/utils/search.utils';
import { extractApiError } from '@/shared/utils/error.utils';
import { BulkDeleteEmployeesModal } from '@/modules/admin/employees/components/BulkDeleteEmployeesModal';
import { TablePagination }      from '@/shared/components/tables/TablePagination';
import { EmployeeCard }         from '../components/EmployeeCard';
import { EmployeeListSkeleton } from '../components/EmployeeListSkeleton';
import { useEmployeeList }      from '../hooks/useEmployeeList';
import { employeeApi } from '../api/employee.api';

const PAGE_SIZE = 8;
const EMPLOYEES_KEY = ['employees', 'all'];

export function EmployeeListPage() {
  const { lang } = useLang();
  const isAr      = lang === 'ar';
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const { user }  = useAuth();
  const isAdmin   = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);       // 1-indexed

  const [selected,       setSelected]       = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const { data: allEmployees = [], isLoading } = useEmployeeList();

  const filtered = useMemo(() => {
    const list = search.trim()
      ? allEmployees.filter(e => matchesSearch([e.name, e.email, e.phone, e.employeeNumber], search))
      : allEmployees;
    return [...list].sort((a, b) => {
      if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return Number(b.id) - Number(a.id);
    });
  }, [allEmployees, search]);

  const total     = filtered.length;
  const lastPage  = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstRow  = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRow   = Math.min(page * PAGE_SIZE, total);
  const employees = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // EmployeeCard shows its own confirm dialog before calling onDelete, so this
  // fires the real request straight away — no second confirmation needed.
  const { mutate: removeOne } = useMutation({
    mutationFn: (id: string) => employeeApi.remove(id),
    onSuccess: (_r, id) => {
      toast.success(isAr ? 'تم حذف الموظف' : 'Employee deleted');
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const { mutate: removeMany, isPending: bulkDeleting } = useMutation({
    mutationFn: (ids: string[]) => employeeApi.bulkRemove(ids),
    onSuccess: () => {
      toast.success(isAr ? 'تم حذف الموظفين المحددين' : 'Selected employees deleted');
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      setSelected(new Set());
      setShowBulkDelete(false);
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  if (isLoading) return <EmployeeListSkeleton />;

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'الموظفون' : 'Employees'}
        subtitle={isAr ? `إدارة بيانات ${total} موظف` : `Managing ${total} employees`}
        actions={
          <Button
            onClick={() => navigate(ROUTES.EMPLOYEES.NEW)}
            startIcon={<Plus size={16} />}
          >
            {isAr ? 'إضافة موظف' : 'Add Employee'}
          </Button>
        }
      />

      {/* Search */}
      <div className="flex gap-3">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder={isAr ? 'بحث عن موظف...' : 'Search employees...'}
          isAr={isAr}
          className="flex-1 max-w-sm"
        />
      </div>

      {isAdmin && selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                        bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40">
          <p className="text-sm text-red-700 dark:text-red-400">
            {isAr ? `${selected.size} موظف محدد` : `${selected.size} employee(s) selected`}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setSelected(new Set())}>
              {isAr ? 'إلغاء التحديد' : 'Clear selection'}
            </Button>
            <Button variant="danger" startIcon={<Trash2 size={14} />} onClick={() => setShowBulkDelete(true)}>
              {isAr ? 'حذف المحدد' : 'Delete Selected'}
            </Button>
          </div>
        </div>
      )}

      {employees.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'لا توجد نتائج' : 'No results found'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              emp={emp}
              isAr={isAr}
              onView={(id) => navigate(ROUTES.EMPLOYEES.DETAIL(id))}
              onEdit={(id) => navigate(ROUTES.EMPLOYEES.EDIT(id))}
              onDelete={isAdmin ? (id) => removeOne(id) : undefined}
              selected={selected.has(emp.id)}
              onToggleSelect={isAdmin ? toggleSelect : undefined}
            />
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700
                        bg-white dark:bg-gray-800 shadow-sm">
          <TablePagination
            pageIndex={page - 1}
            pageCount={lastPage}
            totalRows={total}
            firstRow={firstRow}
            lastRow={lastRow}
            canPrev={page > 1}
            canNext={page < lastPage}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
            onPage={(idx) => setPage(idx + 1)}
            isAr={isAr}
          />
        </div>
      )}

      {/* Single-delete confirmation is handled inside EmployeeCard itself —
          only the bulk-delete confirm needs a modal at this level. */}
      {isAdmin && (
        <BulkDeleteEmployeesModal
          open={showBulkDelete}
          count={selected.size}
          onClose={() => setShowBulkDelete(false)}
          onConfirm={() => removeMany(Array.from(selected))}
          isLoading={bulkDeleting}
          isAr={isAr}
        />
      )}

    </div>
  );
}
