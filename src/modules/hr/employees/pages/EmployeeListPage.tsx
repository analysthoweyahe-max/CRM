import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLang }     from '@/app/providers/LanguageProvider';
import { useAuth }     from '@/modules/auth/context/AuthContext';
import { ROUTES }      from '@/app/router/routes';
import { PageHeader }  from '@/shared/components/ui/PageHeader';
import { Button }      from '@/shared/components/ui/Button';
import { Combobox }    from '@/shared/components/form/Combobox';
import { SearchInput } from '@/shared/components/form/SearchInput';
import { usePermission } from '@/shared/hooks/usePermission';
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
const STATUS_FILTERS = new Set(['active', 'inactive', 'pending']);

export function EmployeeListPage() {
  const { lang } = useLang();
  const isAr      = lang === 'ar';
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user }  = useAuth();
  const isAdmin   = user?.role === 'admin';
  const canCreate = usePermission('create-employee');
  const canEdit   = usePermission('edit-employee');
  const canDelete = usePermission('delete-employee');

  const statusFromUrl = searchParams.get('status') ?? '';
  const status = STATUS_FILTERS.has(statusFromUrl) ? statusFromUrl : '';

  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);       // 1-indexed

  const [selected,       setSelected]       = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const { data: allEmployees = [], isLoading } = useEmployeeList();

  const filtered = useMemo(() => {
    const list = allEmployees.filter(e => {
      if (status && e.status !== status) return false;
      if (search.trim() && !matchesSearch([e.name, e.email, e.phone, e.employeeNumber], search)) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return Number(b.id) - Number(a.id);
    });
  }, [allEmployees, search, status]);

  const total     = filtered.length;
  const lastPage  = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstRow  = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRow   = Math.min(page * PAGE_SIZE, total);
  const employees = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusItems = [
    { id: '',         label: isAr ? 'كل الحالات' : 'All Statuses' },
    { id: 'active',   label: isAr ? 'نشط'  : 'Active'   },
    { id: 'inactive', label: isAr ? 'معطل' : 'Inactive' },
    { id: 'pending',  label: isAr ? 'معلق' : 'Pending'  },
  ];

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleStatus(v: string) {
    setPage(1);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (v) next.set('status', v);
      else next.delete('status');
      return next;
    }, { replace: true });
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
          canCreate ? (
            <Button
              onClick={() => navigate(ROUTES.EMPLOYEES.NEW)}
              startIcon={<Plus size={16} />}
            >
              {isAr ? 'إضافة موظف' : 'Add Employee'}
            </Button>
          ) : undefined
        }
      />

      {/* Search + status filter */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder={isAr ? 'بحث عن موظف...' : 'Search employees...'}
          isAr={isAr}
          className="flex-1 max-w-sm"
        />
        <div className="w-full sm:w-36">
          <Combobox
            items={statusItems}
            value={status}
            onChange={handleStatus}
            searchPlaceholder={isAr ? 'ابحث عن حالة...' : 'Search status...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </div>
      </div>

      {canDelete && selected.size > 0 && (
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
              onEdit={canEdit ? (id) => navigate(ROUTES.EMPLOYEES.EDIT(id)) : undefined}
              onDelete={canDelete ? (id) => removeOne(id) : undefined}
              selected={selected.has(emp.id)}
              onToggleSelect={canDelete ? toggleSelect : undefined}
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
