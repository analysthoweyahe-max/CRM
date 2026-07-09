import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/app/providers/LanguageProvider';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { SeoPhasesPanel } from '../components/SeoPhasesPanel';
import { CreateProjectForm } from '@/shared/modules/create-project/components/CreateProjectForm';
import { useCreateProjectForm } from '@/shared/modules/create-project/hooks/useCreateProjectForm';

export function NewCampaignPage() {
  const { lang, isRTL } = useLang();
  const isAr = lang === 'ar';
  const navigate = useNavigate();
  const form = useCreateProjectForm({ module: 'seo' });

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr ? 'إنشاء مشروع SEO جديد' : 'Create New SEO Project'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isAr ? 'أملأ تفاصيل المشروع واختر الفريق في خطوة واحدة' : 'Fill in project details and assign the team in one step'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="order-2 lg:order-1">
          <SeoPhasesPanel isAr={isAr} />
        </div>
        <Card padding="md" className="order-1 lg:order-2 lg:col-span-2">
          <CreateProjectForm form={form} />
        </Card>
      </div>

      {form.saved && (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#A0CD39] text-gray-900 shadow-xl animate-[fadeInUp_0.3s_ease]">
            <CheckCircle size={18} className="shrink-0" />
            <span className="text-sm font-semibold">
              {form.savedAsDraft
                ? (isAr ? 'تم حفظ المسودة بنجاح!' : 'Draft saved successfully!')
                : (isAr ? 'تم إنشاء المشروع بنجاح!' : 'Project created successfully!')}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 flex-wrap pb-4">
        <Button variant="primary" onClick={() => form.handleSave(false)} disabled={!form.isValid || form.saved || form.isSaving}>
          {isAr ? 'إنشاء المشروع' : 'Create Project'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => form.handleSave(true)}
          disabled={!form.name.trim() || form.saved || form.isSaving}
          className="border-[#A0CD39] text-[#709028] dark:text-[#A0CD39] hover:bg-[#D8EBAE] dark:hover:bg-[#A0CD39]/10"
        >
          {isAr ? 'حفظ كمسودة' : 'Save as Draft'}
        </Button>
        <Button variant="ghost" onClick={() => navigate(form.cancelPath)} disabled={form.saved || form.isSaving}>
          {isAr ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>
    </div>
  );
}
