import { useEffect, useMemo, useState } from 'react';
import { useNavigate }               from 'react-router-dom';
import { Plus }                      from 'lucide-react';
import { useLang }                   from '@/app/providers/LanguageProvider';
import { ROUTES }                    from '@/app/router/routes';
import { PageHeader }                from '@/shared/components/ui/PageHeader';
import { TablePagination }           from '@/shared/components/tables/TablePagination';
import { EmployeeCard }              from '../components/EmployeeCard';
import { EmployeeFilters }           from '../components/EmployeeFilters';
import { EmployeeListSkeleton }      from '../components/EmployeeListSkeleton';
import { EMPLOYEES }                 from '../data/employeeData';

const PAGE_SIZE = 8;

export function EmployeeListPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();

  const [isLoading,    setIsLoading]    = useState(true);
  const [search,       setSearch]       = useState('');
  const [deptFilter,   setDeptFilter]   = useState('');
  const [titleFilter,  setTitleFilter]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page,         setPage]         = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const allDepts   = isAr ? 'كل الأقسام'  : 'All Departments';
  const allTitles  = isAr ? 'كل المسميات' : 'All Titles';
  const allStat    = isAr ? 'كل الحالات'  : 'All Statuses';

  const deptOptions   = [allDepts,  ...Array.from(new Set(EMPLOYEES.map((e) => isAr ? e.department : e.deptEn)))];
  const titleOptions  = [allTitles, ...Array.from(new Set(EMPLOYEES.map((e) => isAr ? e.jobTitle   : e.jobTitleEn)))];
  const statusOptions = isAr
    ? [allStat, 'نشط', 'مرفوض', 'معلق']
    : [allStat, 'Active', 'Inactive', 'Pending'];

  const activeDept   = deptFilter   || allDepts;
  const activeTitle  = titleFilter  || allTitles;
  const activeStat   = statusFilter || allStat;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return EMPLOYEES.filter((e) => {
      const matchSearch = !q
        || e.name.includes(search)
        || e.nameEn.toLowerCase().includes(q)
        || e.email.toLowerCase().includes(q)
        || e.phone.includes(search);

      const matchDept  = activeDept  === allDepts  || (isAr ? e.department : e.deptEn)    === activeDept;
      const matchTitle = activeTitle === allTitles || (isAr ? e.jobTitle   : e.jobTitleEn) === activeTitle;
      const matchStat  = activeStat  === allStat
        || (activeStat === (isAr ? 'نشط'   : 'Active'  ) && e.status === 'active')
        || (activeStat === (isAr ? 'مرفوض' : 'Inactive') && e.status === 'inactive')
        || (activeStat === (isAr ? 'معلق'  : 'Pending' ) && e.status === 'pending');

      return matchSearch && matchDept && matchTitle && matchStat;
    });
  }, [search, activeDept, activeTitle, activeStat, isAr, allDepts, allTitles, allStat]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage  = Math.min(page, pageCount - 1);
  const paged     = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const firstRow  = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const lastRow   = Math.min((safePage + 1) * PAGE_SIZE, filtered.length);

  if (isLoading) return <EmployeeListSkeleton />;

  function resetPage() { setPage(0); }

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'الموظفون' : 'Employees'}
        subtitle={isAr ? `إدارة بيانات ${EMPLOYEES.length} موظف` : `Managing ${EMPLOYEES.length} employees`}
        actions={
          <button
            type="button"
            onClick={() => navigate(ROUTES.EMPLOYEES.NEW)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl shrink-0
                       bg-[#A0CD39] hover:bg-[#90BA33] text-gray-900 text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            {isAr ? 'إضافة موظف' : 'Add Employee'}
          </button>
        }
      />

      <EmployeeFilters
        isAr={isAr}
        search={search}
        deptFilter={activeDept}
        titleFilter={activeTitle}
        statusFilter={activeStat}
        deptOptions={deptOptions}
        titleOptions={titleOptions}
        statusOptions={statusOptions}
        onSearch={(v) => { setSearch(v);       resetPage(); }}
        onDept={(v)   => { setDeptFilter(v);   resetPage(); }}
        onTitle={(v)  => { setTitleFilter(v);  resetPage(); }}
        onStatus={(v) => { setStatusFilter(v); resetPage(); }}
      />

      {paged.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'لا توجد نتائج' : 'No results found'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paged.map((emp) => (
            <EmployeeCard
              key={emp.id}
              emp={emp}
              isAr={isAr}
              onView={(id) => navigate(ROUTES.EMPLOYEES.DETAIL(id))}
              onEdit={(id) => navigate(ROUTES.EMPLOYEES.DETAIL(id))}
            />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700
                        bg-white dark:bg-gray-800 shadow-sm">
          <TablePagination
            pageIndex={safePage}
            pageCount={pageCount}
            totalRows={filtered.length}
            firstRow={firstRow}
            lastRow={lastRow}
            canPrev={safePage > 0}
            canNext={safePage < pageCount - 1}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
            onPage={setPage}
            isAr={isAr}
          />
        </div>
      )}

    </div>
  );
}
