import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useLang }    from '@/app/providers/LanguageProvider';
import { ROUTES }     from '@/app/router/routes';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { SearchInput } from '@/shared/components/form/SearchInput';
import { extractApiError } from '@/shared/utils/error.utils';
import { AdminEmployeeTable } from '@/modules/admin/employees/components/AdminEmployeeTable';
import { AddManagerModal }    from '../components/AddManagerModal';
import { useAdminManagers }   from '../hooks/useAdminManagers';
import { useCreateAdmin }     from '../hooks/useCreateAdmin';
import type { CreateAdminPayload } from '../types/adminManager.types';

export function AdminManagersPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();

  const {
    employees: managers, isLoading, total, pageSize, page, setPage, pageCount,
    search, setSearch,
  } = useAdminManagers();

  const { mutate: createAdmin, isPending: creating } = useCreateAdmin();
  const [showAdd, setShowAdd] = useState(false);

  function submitManager(payload: CreateAdminPayload) {
    createAdmin(payload, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء المدير' : 'Manager created');
        setShowAdd(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'المديرون' : 'Managers'}
        subtitle={isAr
          ? 'إدارة مديري الموارد البشرية والمشاريع و SEO'
          : 'Manage HR, Project, and SEO managers'}
        actions={
          <Button variant="primary" startIcon={<UserPlus size={15} />} onClick={() => setShowAdd(true)}>
            {isAr ? 'إضافة مدير' : 'Add Manager'}
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={isAr ? 'ابحث بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
        isAr={isAr}
        className="max-w-sm"
      />

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : (
        <AdminEmployeeTable
          employees={managers}
          isAr={isAr}
          page={page} pageCount={pageCount} total={total} pageSize={pageSize}
          onPage={setPage}
          onRowClick={id => navigate(ROUTES.ADMIN.EMPLOYEE_DETAIL(id))}
        />
      )}

      <AddManagerModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={submitManager}
        isLoading={creating}
        isAr={isAr}
      />

    </div>
  );
}
