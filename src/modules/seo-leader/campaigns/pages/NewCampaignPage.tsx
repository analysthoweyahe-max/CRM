import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang }     from '@/app/providers/LanguageProvider';
import { Card }        from '@/shared/components/ui/Card';
import { Button }      from '@/shared/components/ui/Button';
import { ROUTES }      from '@/app/router/routes';
import { useNewCampaign }      from '../hooks/useNewCampaign';
import { SeoPhasesPanel }      from '../components/SeoPhasesPanel';
import { CampaignFormFields }  from '../components/CampaignFormFields';

export function NewCampaignPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();
  const form     = useNewCampaign();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr ? 'إنشاء مشروع SEO جديد' : 'Create New SEO Project'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isAr ? 'أملأ تفاصيل المشروع وحدد مراحل الـ SEO' : 'Fill in project details and define SEO phases'}
        </p>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SeoPhasesPanel isAr={isAr} />
        <Card padding="md" className="lg:col-span-2">
          <CampaignFormFields
            name={form.name}               domain={form.domain}
            description={form.description} campaignType={form.campaignType}
            status={form.status}           startDate={form.startDate}
            endDate={form.endDate}         keywords={form.keywords}
            links={form.links}             isAr={isAr}
            githubLink={form.githubLink}   setGithubLink={form.setGithubLink}
            campaignTypeItems={form.campaignTypeItems}
            statusItems={form.statusItems}
            setName={form.setName}         setDomain={form.setDomain}
            setDesc={form.setDesc}         setType={form.setType}
            setStatus={form.setStatus}     setStartDate={form.setStartDate}
            setEndDate={form.setEndDate}
            addKeyword={form.addKeyword}   updateKeyword={form.updateKeyword}
            removeKeyword={form.removeKeyword}
            addLink={form.addLink}         updateLink={form.updateLink}
            removeLink={form.removeLink}
          />
        </Card>
      </div>

      {/* Success toast */}
      {form.saved && (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl
                          bg-[#A0CD39] text-gray-900 shadow-xl
                          animate-[fadeInUp_0.3s_ease]">
            <CheckCircle size={18} className="shrink-0" />
            <span className="text-sm font-semibold">
              {isAr ? 'تم إنشاء المشروع بنجاح!' : 'Project created successfully!'}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 flex-wrap pb-4">
        <Button
          variant="primary"
          onClick={() => form.handleSave(false)}
          disabled={!form.isValid || form.saved || form.isSaving}
        >
          {isAr ? 'حفظ المشروع' : 'Save Project'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => form.handleSave(true)}
          disabled={!form.name.trim() || form.saved || form.isSaving}
          className="border-[#A0CD39] text-[#709028] dark:text-[#A0CD39]
                     hover:bg-[#D8EBAE] dark:hover:bg-[#A0CD39]/10"
        >
          {isAr ? 'حفظ كمسودة' : 'Save as Draft'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.SEO_LEADER.DASHBOARD)}
          disabled={form.saved || form.isSaving}
        >
          {isAr ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>

    </div>
  );
}
