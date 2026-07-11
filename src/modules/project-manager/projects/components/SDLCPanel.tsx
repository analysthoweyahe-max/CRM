import { LayoutTemplate, ListChecks, Star } from 'lucide-react';

import { Link } from 'react-router-dom';

import { StagesPanel }   from '@/shared/components/ui/StagesPanel';

import type { StageItem } from '@/shared/components/ui/StagesPanel';

import { Card }   from '@/shared/components/ui/Card';

import { Badge }  from '@/shared/components/ui/Badge';

import { ROUTES } from '@/app/router/routes';

import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';

import { useTemplate } from '@/modules/project-manager/templates/hooks/useProjectTemplates';

import type { PmProjectTemplate } from '@/modules/project-manager/templates/types/template.types';



interface Props {

  isAr:               boolean;

  templateId?:        string;

  templates:          PmProjectTemplate[];

  isLoadingTemplates?: boolean;

  onTemplateSelect: (uuid: string) => void;

}



export function SDLCPanel({

  isAr,

  templateId,

  templates,

  isLoadingTemplates,

  onTemplateSelect,

}: Props) {

  const { data: template, isLoading: isLoadingTemplate } = useTemplate('pm', templateId || undefined);



  if (templateId && isLoadingTemplate) {

    return (

      <StagesPanel

        title={isAr ? 'جاري تحميل القالب...' : 'Loading template...'}

        subtitle={isAr ? 'يتم جلب مراحل القالب المحدد' : 'Fetching the selected template stages'}

        icon={<LayoutTemplate size={17} className="text-[#A0CD39] shrink-0" />}

        stages={[]}

      />

    );

  }



  if (templateId && template) {

    const stages: StageItem[] = template.steps

      .slice()

      .sort((a, b) => a.sortOrder - b.sortOrder)

      .map((s, i) => ({

        num:   s.sortOrder || i + 1,

        title: s.title,

        desc:  s.description ?? '',

      }));



    return (

      <div className="space-y-2 lg:col-span-1">

        <StagesPanel

          title={template.name}

          subtitle={isAr ? 'مراحل المشروع من القالب المحدد' : 'Project stages from the selected template'}

          icon={<LayoutTemplate size={17} className="text-[#A0CD39] shrink-0" />}

          stages={stages}

        />

        <button

          type="button"

          onClick={() => onTemplateSelect('')}

          className="w-full text-xs text-[#709028] dark:text-[#A0CD39] hover:underline text-center py-1"

        >

          {isAr ? 'تغيير القالب' : 'Change template'}

        </button>

      </div>

    );

  }



  return (

    <Card overflow className="lg:col-span-1">

      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">

        <div className="flex items-center gap-2">

          <LayoutTemplate size={17} className="text-[#A0CD39] shrink-0" />

          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">

            {isAr ? 'قوالب المشروع' : 'Project Templates'}

          </span>

        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">

          {isAr ? 'اختر قالباً لعرض مراحله' : 'Select a template to preview its stages'}

        </p>

      </div>



      <div className="divide-y divide-gray-50 dark:divide-gray-700/50 max-h-[28rem] overflow-y-auto">

        {isLoadingTemplates ? (

          <p className="px-5 py-8 text-center text-xs text-gray-400 dark:text-gray-500">

            {isAr ? 'جاري التحميل...' : 'Loading...'}

          </p>

        ) : templates.length === 0 ? (

          <div className="px-5 py-8 text-center space-y-2">

            <p className="text-xs text-gray-400 dark:text-gray-500">

              {isAr ? 'لا توجد قوالب بعد' : 'No templates yet'}

            </p>

            <Link

              to={ROUTES.PROJECT_MANAGER.TEMPLATES}

              className="text-xs text-[#709028] dark:text-[#A0CD39] hover:underline"

            >

              {isAr ? 'إدارة القوالب' : 'Manage templates'}

            </Link>

          </div>

        ) : (

          templates.map((t) => {

            const typeLabel = t.projectTypeLabel || t.projectType;

            return (

              <button

                key={t.uuid}

                type="button"

                onClick={() => onTemplateSelect(t.uuid)}

                className="w-full px-5 py-3.5 flex items-start gap-3 text-start hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"

              >

                <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]">

                  <ListChecks size={15} />

                </span>

                <div className="min-w-0 flex-1">

                  <div className="flex items-center gap-1.5">

                    {t.isDefault && (

                      <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />

                    )}

                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">

                      {t.name}

                    </p>

                  </div>

                  {t.description && (

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">

                      {t.description}

                    </p>

                  )}

                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">

                    <span className="text-xs text-gray-400 dark:text-gray-500">

                      {isAr ? `${t.stepsCount} مرحلة` : `${t.stepsCount} steps`}

                    </span>

                    {typeLabel ? (

                      <Badge

                        label={translateProjectLookup(t.projectType ?? '', typeLabel, isAr)}

                        variant="brand"

                      />

                    ) : (

                      <Badge label={isAr ? 'عام' : 'Global'} variant="gray" />

                    )}

                  </div>

                </div>

              </button>

            );

          })

        )}

      </div>



      {templates.length > 0 && (

        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/60 text-center">

          <Link

            to={ROUTES.PROJECT_MANAGER.TEMPLATES}

            className="text-xs text-[#709028] dark:text-[#A0CD39] hover:underline"

          >

            {isAr ? 'إدارة القوالب' : 'Manage templates'}

          </Link>

        </div>

      )}

    </Card>

  );

}


