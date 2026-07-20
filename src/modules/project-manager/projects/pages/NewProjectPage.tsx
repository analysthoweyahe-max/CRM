import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/app/providers/LanguageProvider';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Combobox } from '@/shared/components/form/Combobox';
import { SDLCPanel } from '../components/SDLCPanel';
import { CreateProjectForm } from '@/shared/modules/create-project/components/CreateProjectForm';
import { useCreateProjectForm } from '@/shared/modules/create-project/hooks/useCreateProjectForm';
import { useAllTemplates } from '@/modules/project-manager/templates/hooks/useProjectTemplates';
import { TemplateResourceLink } from '@/modules/project-manager/templates/components/TemplateResourceLink';

export function NewProjectPage() {
  const { lang, isRTL } = useLang();
  const isAr = lang === 'ar';
  const navigate = useNavigate();

  const [templateId, setTemplateId] = useState('');
  const form = useCreateProjectForm({ module: 'pm', templateId: templateId || undefined });

  const selectedTypeId = form.projectTypeId ? Number(form.projectTypeId) : null;
  const { data: matchingTemplates = [], isLoading: templatesLoading } = useAllTemplates(
    'pm',
    selectedTypeId,
  );
  const templateItems = [
    { id: '', label: isAr ? '-- بدون قالب --' : '-- No template --' },
    ...matchingTemplates.map(t => ({
      id:     t.uuid,
      label:  t.name,
      detail: isAr ? `${t.stepsCount} مرحلة` : `${t.stepsCount} steps`,
      href:   t.link,
    })),
  ];

  const selectedTemplate = matchingTemplates.find((t) => t.uuid === templateId);

  useEffect(() => {
    if (templateId && !matchingTemplates.some(t => t.uuid === templateId)) setTemplateId('');
  }, [form.projectTypeId, matchingTemplates]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr ? 'إنشاء مشروع جديد' : 'Create New Project'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isAr ? 'أملأ تفاصيل المشروع واختر الفريق في خطوة واحدة' : 'Fill in project details and assign the team in one step'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SDLCPanel
          isAr={isAr}
          templateId={templateId}
          templates={matchingTemplates}
          isLoadingTemplates={templatesLoading}
          onTemplateSelect={setTemplateId}
        />
        <Card padding="md" className="lg:col-span-2 space-y-5">
          {selectedTypeId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isAr ? 'قالب المشروع (اختياري)' : 'Project Template (optional)'}
              </label>
              <Combobox
                items={templateItems}
                value={templateId}
                onChange={setTemplateId}
                placeholder={isAr ? '-- بدون قالب --' : '-- No template --'}
                searchPlaceholder={isAr ? 'ابحث عن قالب...' : 'Search template...'}
                noResultsText={isAr ? 'لا توجد قوالب لهذا النوع' : 'No templates for this type'}
              />
              {selectedTemplate && (
                <div className="mt-2">
                  <TemplateResourceLink link={selectedTemplate.link} isAr={isAr} />
                </div>
              )}
            </div>
          )}
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
        <Button
          variant="primary"
          onClick={() => form.handleSave()}
          disabled={(!form.saveAsDraft && !form.isValid) || (form.saveAsDraft && !form.name.trim()) || form.saved || form.isSaving}
        >
          {form.saveAsDraft
            ? (isAr ? 'حفظ كمسودة' : 'Save as Draft')
            : (isAr ? 'إنشاء المشروع' : 'Create Project')}
        </Button>
        <Button variant="ghost" onClick={() => navigate(form.cancelPath)} disabled={form.saved || form.isSaving}>
          {isAr ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>
    </div>
  );
}
