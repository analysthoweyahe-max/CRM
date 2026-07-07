import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus }        from 'lucide-react';
import { useLang }     from '@/app/providers/LanguageProvider';
import { ROUTES }      from '@/app/router/routes';
import { PageHeader }  from '@/shared/components/ui/PageHeader';
import { Button }      from '@/shared/components/ui/Button';
import { SearchInput } from '@/shared/components/form/SearchInput';
import { matchesSearch } from '@/shared/utils/search.utils';
import { TablePagination }      from '@/shared/components/tables/TablePagination';
import { EmployeeCard }         from '../components/EmployeeCard';
import { EmployeeListSkeleton } from '../components/EmployeeListSkeleton';
import { useEmployeeList }      from '../hooks/useEmployeeList';

const PAGE_SIZE = 8;

export function EmployeeListPage() {
  const { lang } = useLang();
  const isAr      = lang === 'ar';
  const navigate  = useNavigate();

  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);       // 1-indexed

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

    </div>
  );
}
