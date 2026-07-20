import { useMemo } from 'react';
import { PhasesManagerUI } from '@/shared/modules/project/components/PhasesManagerUI';
import { useSeoProjectPhases } from '../hooks/useSeoProjectPhases';
import { seoPhasesToPhaseItems } from '../utils/seoPhase.utils';

interface Props {
  projectId: string;
  isAr:      boolean;
  canEdit?:  boolean;
}

/** Read-only phase list sourced from project template phases (client-updates API). */
export function SeoSettingsPhasesSection({ projectId, isAr, canEdit = false }: Props) {
  const { data: phases = [], isLoading, isError } = useSeoProjectPhases(projectId);

  const phaseItems = useMemo(
    () => seoPhasesToPhaseItems(phases, isAr),
    [phases, isAr],
  );

  return (
    <div className="space-y-3">
      <PhasesManagerUI
        phases={phaseItems}
        isAr={isAr}
        readOnly
        isLoading={isLoading}
        emptyLabel={
          isError
            ? (isAr ? 'تعذر تحميل مراحل المشروع' : 'Failed to load project phases')
            : (isAr
              ? 'لا توجد مراحل بعد — طبّق قالباً من الزر أعلاه لإنشاء مراحل المشروع.'
              : 'No phases yet — apply a template using the button above to create project phases.')
        }
      />
      {canEdit && phases.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-end px-1">
          {isAr
            ? 'المراحل مُشتقة من قالب المشروع. استخدم «تطبيق قالب» لإضافة أو استبدال المراحل.'
            : 'Phases come from the project template. Use “Apply Template” to append or replace phases.'}
        </p>
      )}
    </div>
  );
}
