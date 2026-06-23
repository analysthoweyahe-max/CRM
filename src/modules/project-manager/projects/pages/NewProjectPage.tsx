import { useState } from 'react';
import { CheckCircle2, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/app/providers/LanguageProvider';
import { Card } from '@/shared/components/ui/Card';
import { ROUTES } from '@/app/router/routes';
import { addProject } from '../store/projectStore';
import type { ProjectStatus } from '../types/project.types';

const SDLC_STAGES = [
  { num: 1, title: 'متطلبات العمل', desc: 'تجميع احتياجات أصحاب المصلحة والمتطلبات الوظيفية' },
  { num: 2, title: 'التحليل',       desc: 'دراسة الجدوى ونمذجة البيانات والبحث' },
  { num: 3, title: 'التصميم',       desc: 'هيكلة النظام وتدفقات تجربة المستخدم والتصميم عالي الدقة' },
  { num: 4, title: 'التطوير',       desc: 'التنفيذ والبرمجة والتكامل' },
  { num: 5, title: 'الاختبار',      desc: 'ضمان الجودة واختبار الانحدار واختبار القبول' },
  { num: 6, title: 'النشر',         desc: 'الإطلاق ودليل التشغيل والتسليم' },
];

const PROJECT_TYPES = ['موقع إلكتروني', 'تطبيق موبايل', 'نظام إدارة', 'لوحة تحكم', 'تطبيق ويب', 'أخرى'];
const PROJECT_STATUSES = [
  { value: 'notStarted', label: 'لم يبدأ' },
  { value: 'inProgress', label: 'قيد التنفيذ' },
  { value: 'paused',     label: 'متوقف' },
  { value: 'completed',  label: 'مكتمل' },
];

export function NewProjectPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('');
  const [status,      setStatus]      = useState('notStarted');
  const [startDate,   setStartDate]   = useState('');
  const [links,       setLinks]       = useState<string[]>(['']);
  const [generateSDLC, setGenerateSDLC] = useState(true);
  const [saved,       setSaved]       = useState(false);

  const addLink    = () => setLinks(prev => [...prev, '']);
  const updateLink = (i: number, val: string) =>
    setLinks(prev => prev.map((l, idx) => (idx === i ? val : l)));
  const removeLink = (i: number) =>
    setLinks(prev => prev.filter((_, idx) => idx !== i));

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

  const inputCls = [
    'w-full rounded-xl border border-gray-200 dark:border-gray-600',
    'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
    'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
    'transition-shadow duration-150',
  ].join(' ');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr ? 'إنشاء مشروع جديد' : 'Create New Project'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isAr ? 'أملأ تفاصيل المشروع وحدد مراحله' : 'Fill in project details and define stages'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left: SDLC panel ── */}
        <Card overflow className="lg:col-span-1">

          {/* Card header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#A0CD39] shrink-0" />
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {isAr ? 'توليد قالب SDLC' : 'Generate SDLC Template'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                {isAr
                  ? 'إنشاء مراحل المشروع القياسية تلقائياً لهذا المشروع'
                  : 'Auto-create standard project stages for this project'}
              </p>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={generateSDLC}
              onClick={() => setGenerateSDLC(p => !p)}
              className={[
                'relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer border-0',
                generateSDLC ? 'bg-[#A0CD39]' : 'bg-gray-200 dark:bg-gray-600',
              ].join(' ')}
            >
              <span
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200"
                style={{ insetInlineStart: generateSDLC ? '1.25rem' : '0.125rem' }}
              />
            </button>
          </div>

          {/* Stages list */}
          <div className={`divide-y divide-gray-50 dark:divide-gray-700/50 transition-opacity duration-200 ${!generateSDLC ? 'opacity-40' : ''}`}>
            {SDLC_STAGES.map(stage => (
              <div key={stage.num} className="px-5 py-3.5 flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#D8EBAE] dark:bg-[#A0CD39]/20
                                 text-[#709028] dark:text-[#A0CD39] text-xs font-bold
                                 flex items-center justify-center mt-0.5">
                  {stage.num}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stage.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Right: Form ── */}
        <Card padding="md" className="lg:col-span-2 space-y-5">

          {/* اسم المشروع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {isAr ? 'اسم المشروع' : 'Project Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={isAr ? 'مثال: موقع الشركة الإلكتروني' : 'e.g. Company Website'}
              className={inputCls}
            />
          </div>

          {/* وصف المشروع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {isAr ? 'وصف المشروع' : 'Project Description'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={isAr ? 'نبذة عن المشروع وأهدافه' : 'Brief about the project and its goals'}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* نوع + حالة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isAr ? 'نوع المشروع' : 'Project Type'}
              </label>
              <select value={projectType} onChange={e => setProjectType(e.target.value)} className={inputCls}>
                <option value="">{isAr ? '-- اختر النوع --' : '-- Select Type --'}</option>
                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isAr ? 'حالة المشروع' : 'Project Status'}
              </label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
                {PROJECT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* تاريخ البدء */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {isAr ? 'تاريخ البدء' : 'Start Date'}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* مراجع وروابط */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {isAr ? 'مراجع وروابط' : 'References & Links'}
            </label>
            <div className="space-y-2.5">
              {links.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={e => updateLink(i, e.target.value)}
                    placeholder="https://..."
                    className={`${inputCls} flex-1`}
                  />
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(i)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1.5 text-sm font-medium
                           text-[#709028] dark:text-[#A0CD39] hover:opacity-80 transition-opacity"
              >
                <Plus size={15} />
                {isAr ? 'إضافة رابط' : 'Add Link'}
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Success toast ── */}
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

      {/* ── Actions ── */}
      <div className="flex items-center justify-center gap-3 flex-wrap pb-4">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={!name.trim() || saved}
          className="px-6 py-2.5 rounded-xl bg-[#A0CD39] hover:bg-[#709028]
                     text-white font-medium text-sm transition-colors shadow-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAr ? 'حفظ المشروع' : 'Save Project'}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={!name.trim() || saved}
          className="px-6 py-2.5 rounded-xl border border-[#A0CD39]
                     text-[#709028] dark:text-[#A0CD39]
                     hover:bg-[#D8EBAE] dark:hover:bg-[#A0CD39]/10
                     font-medium text-sm transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAr ? 'حفظ كمسودة' : 'Save as Draft'}
        </button>
        <button
          type="button"
          onClick={() => navigate(ROUTES.PROJECT_MANAGER.DASHBOARD)}
          disabled={saved}
          className="px-6 py-2.5 rounded-xl text-gray-500 dark:text-gray-400
                     hover:text-gray-700 dark:hover:text-gray-200
                     font-medium text-sm transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAr ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}
