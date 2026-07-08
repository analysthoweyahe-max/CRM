import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLang }                 from '@/app/providers/LanguageProvider';
import { Card }                    from '@/shared/components/ui/Card';
import { PageHeader }              from '@/shared/components/ui/PageHeader';
import { Button }                  from '@/shared/components/ui/Button';
import { AddSeoTaskForm }          from '../components/AddSeoTaskForm';
import { useAddSeoTaskPage }       from '../hooks/useAddSeoTaskPage';

export function AddSeoTaskPage() {
  const { lang } = useLang();
  const isRTL    = lang === 'ar';
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const {
    isAr,
    campaign,
    campaignLoading,
    teamItems,
    teamLoading,
    form,
    set,
    apiError,
    isValid,
    isSaving,
    handleAdd,
    goBack,
  } = useAddSeoTaskPage();

  if (campaignLoading || teamLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-10 w-48 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-96 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto" dir={isAr ? 'rtl' : 'ltr'}>

      <PageHeader
        title={isAr ? 'إضافة مهمة' : 'Add Task'}
        subtitle={
          campaign?.name
            ? (isAr ? `مشروع: ${campaign.name}` : `Project: ${campaign.name}`)
            : (isAr ? 'أضف مهمة جديدة للمشروع' : 'Add a new task to the project')
        }
        start={
          <Button
            variant="ghost"
            type="button"
            onClick={goBack}
            className="p-2"
            aria-label={isAr ? 'رجوع' : 'Back'}
          >
            <BackIcon size={18} />
          </Button>
        }
      />

      <Card padding="lg">
        <AddSeoTaskForm
          form={form}
          set={set}
          teamItems={teamItems}
          isAr={isAr}
        />

        {apiError && (
          <p className="mt-4 text-sm text-red-500 dark:text-red-400">{apiError}</p>
        )}

        <div className="flex items-center gap-3 pt-6 mt-2 border-t border-gray-100 dark:border-gray-700/60">
          <Button
            variant="primary"
            disabled={!isValid || isSaving}
            onClick={handleAdd}
          >
            {isSaving
              ? (isAr ? 'جاري الحفظ...' : 'Saving…')
              : (isAr ? 'إضافة مهمة' : 'Add Task')}
          </Button>
          <Button variant="ghost" onClick={goBack}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      </Card>

    </div>
  );
}
