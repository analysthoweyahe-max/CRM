import { Plus } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { PayrollTypeCard }        from '../components/PayrollTypeCard';
import { PayrollTypeFormModal }   from '../components/PayrollTypeFormModal';
import { DeletePayrollTypeModal } from '../components/DeletePayrollTypeModal';
import { usePayrollTypesPage }    from '../hooks/usePayrollTypesPage';

const TABS = [
  { key: 'bonus' as const,     ar: 'أنواع المكافآت', en: 'Bonus Types' },
  { key: 'deduction' as const, ar: 'أنواع الخصومات', en: 'Deduction Types' },
];

export function PayrollTypesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    tab, setTab,
    items, isLoading,
    showAdd, openAdd, closeAdd, submitAdd, creating,
    editing, openEdit, closeEdit, submitEdit, updating,
    pendingDelete, askDelete, cancelDelete, confirmDelete, deleting,
  } = usePayrollTypesPage(isAr);

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isAr ? 'أنواع المكافآت والخصومات' : 'Bonus & Deduction Types'}
        subtitle={isAr ? 'إدارة أنواع المكافآت والخصومات المستخدمة في الرواتب' : 'Manage payroll bonus and deduction types'}
        actions={
          <Button variant="primary" startIcon={<Plus size={15} />} onClick={openAdd}>
            {tab === 'bonus'
              ? (isAr ? 'إضافة نوع مكافأة' : 'Add Bonus Type')
              : (isAr ? 'إضافة نوع خصم' : 'Add Deduction Type')}
          </Button>
        }
      />

      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${tab === t.key
                ? 'bg-[#A0CD39] text-gray-900'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
          >
            {isAr ? t.ar : t.en}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'لا توجد أنواع' : 'No types yet'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <PayrollTypeCard
              key={item.id}
              item={item}
              isAr={isAr}
              onEdit={() => openEdit(item)}
              onDelete={() => askDelete(item)}
            />
          ))}
        </div>
      )}

      <PayrollTypeFormModal
        open={showAdd}
        onClose={closeAdd}
        onSubmit={submitAdd}
        isLoading={creating}
        isAr={isAr}
        kind={tab}
      />

      <PayrollTypeFormModal
        open={!!editing}
        onClose={closeEdit}
        onSubmit={submitEdit}
        initial={editing}
        isLoading={updating}
        isAr={isAr}
        kind={tab}
      />

      <DeletePayrollTypeModal
        item={pendingDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={deleting}
        isAr={isAr}
      />
    </div>
  );
}
