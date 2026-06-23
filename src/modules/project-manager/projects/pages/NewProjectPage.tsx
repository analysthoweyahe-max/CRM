import { useState }    from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang }     from '@/app/providers/LanguageProvider';
import { Card }        from '@/shared/components/ui/Card';
import { Button }      from '@/shared/components/ui/Button';
import { ROUTES }      from '@/app/router/routes';
import { addProject }  from '../store/projectStore';
import type { ProjectStatus } from '../types/project.types';
import { SDLCPanel }        from '../components/SDLCPanel';
import { ProjectFormFields } from '../components/ProjectFormFields';

export function NewProjectPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();

  const [name,        setName]        = useState('');
  const [description, setDesc]        = useState('');
  const [projectType, setType]        = useState('');
  const [status,      setStatus]      = useState('notStarted');
  const [startDate,   setDate]        = useState('');
  const [links,       setLinks]       = useState<string[]>(['']);
  const [saved,       setSaved]       = useState(false);

  const addLink    = () => setLinks(p => [...p, '']);
  const updateLink = (i: number, v: string) =>
    setLinks(p => p.map((l, idx) => idx === i ? v : l));
  const removeLink = (i: number) =>
    setLinks(p => p.filter((_, idx) => idx !== i));

  function handleSave(asDraft = false) {
    if (!name.trim()) return;
    addProject({
      id:             `p-${Date.now()}`,
      nameAr:         name.trim(),
      nameEn:         name.trim(),
      categoryAr:     projectType || 'مشروع',
      categoryEn:     projectType || 'Project',
      progress:       0,
      status:         (asDraft ? 'notStarted' : status) as ProjectStatus,
      tasksCompleted: 0,
      tasksTotal:     0,
      team:           [],
    });
    setSaved(true);
    setTimeout(() => navigate(ROUTES.PROJECT_MANAGER.DASHBOARD), 1500);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr ? 'إنشاء مشروع جديد' : 'Create New Project'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isAr ? 'أملأ تفاصيل المشروع وحدد مراحله' : 'Fill in project details and define stages'}
        </p>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SDLCPanel isAr={isAr} />
        <Card padding="md" className="lg:col-span-2">
          <ProjectFormFields
            name={name}        description={description}
            projectType={projectType} status={status}
            startDate={startDate}     links={links}
            isAr={isAr}
            setName={setName}  setDesc={setDesc}
            setType={setType}  setStatus={setStatus}
            setDate={setDate}
            addLink={addLink}  updateLink={updateLink} removeLink={removeLink}
          />
        </Card>
      </div>

      {/* Success toast */}
      {saved && (
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
          onClick={() => handleSave(false)}
          disabled={!name.trim() || !description.trim() || !projectType || !startDate || saved}
        >
          {isAr ? 'حفظ المشروع' : 'Save Project'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSave(true)}
          disabled={!name.trim() || !description.trim() || !projectType || !startDate || saved}
          className="border-[#A0CD39] text-[#709028] dark:text-[#A0CD39]
                     hover:bg-[#D8EBAE] dark:hover:bg-[#A0CD39]/10"
        >
          {isAr ? 'حفظ كمسودة' : 'Save as Draft'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.PROJECT_MANAGER.DASHBOARD)}
          disabled={saved}
        >
          {isAr ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>

    </div>
  );
}
