import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus }        from 'lucide-react';
import { useLang }     from '@/app/providers/LanguageProvider';
import { ROUTES }      from '@/app/router/routes';
import { PageHeader }  from '@/shared/components/ui/PageHeader';
import { Button }      from '@/shared/components/ui/Button';
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
  const [page,   setPage]   = useState(1);       // 1-indexed (matches API)

  // Debounce via delayed update is omitted to keep it simple; search resets page on change
  const { data, isLoading } = useEmployeeList({ page, per_page: PAGE_SIZE, search });

  const employees = data?.data         ?? [];
  const total     = data?.total        ?? 0;
  const lastPage  = data?.last_page    ?? 1;
  const firstRow  = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRow   = Math.min(page * PAGE_SIZE, total);

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  if (isLoading && !data) return <EmployeeListSkeleton />;

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
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={isAr ? 'بحث عن موظف...' : 'Search employees...'}
          className="flex-1 max-w-sm rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800 px-4 py-2.5 text-sm
                     text-gray-800 dark:text-gray-100 placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-[#A0CD39]"
          dir={isAr ? 'rtl' : 'ltr'}
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
