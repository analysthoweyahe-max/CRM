import { useEffect, useState } from 'react';
import { toast }    from 'sonner';
import { Modal }    from '@/shared/components/ui/Modal';
import { Button }   from '@/shared/components/ui/Button';
import { Switch }   from '@/shared/components/ui/Switch';
import { Combobox } from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { FormField } from '@/shared/components/form/FormField';
import { extractApiError } from '@/shared/utils/error.utils';
import { useAllTemplates, useApplyTemplate } from '../hooks/useProjectTemplates';
import { filterTemplatesByType } from '../utils/templateFilter';
import type { TemplateModule } from '../api/projectTemplate.api';

interface Props {
  open:           boolean;
  onClose:        () => void;
  projectId:      string;
  projectTypeId?: number | null;
  isAr:           boolean;
  module?:        TemplateModule;
  onApplied?:     () => void;
}

export function ApplyTemplateModal({ open, onClose, projectId, projectTypeId, isAr, module = 'pm', onApplied }: Props) {
  const { data: templates = [], isLoading } = useAllTemplates(module);
  const { mutate: apply, isPending } = useApplyTemplate(projectId, module);

  const [templateId, setTemplateId] = useState('');
  const [replace, setReplace]       = useState(false);

  useEffect(() => {
    if (!open) { setTemplateId(''); setReplace(false); }
  }, [open]);

  const available = filterTemplatesByType(templates, projectTypeId);

  const items: ComboboxItem[] = available.map((t) => ({
    id:     t.uuid,
    label:  t.name,
    detail: isAr ? `${t.stepsCount} مرحلة` : `${t.stepsCount} steps`,
  }));

  function handleApply() {
    if (!templateId || isPending) return;
    apply({ template_id: templateId, replace }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم تطبيق القالب' : 'Template applied');
        onApplied?.();
        onClose();
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'تطبيق قالب' : 'Apply Template'}
      description={isAr ? 'حوّل مراحل القالب إلى مراحل للمشروع' : 'Turn template steps into project phases'}
      footer={
        <div className="flex items-center gap-3 justify-start flex-row-reverse">
          <Button variant={replace ? 'danger' : 'primary'} disabled={!templateId} isLoading={isPending} onClick={handleApply}>
            {replace
              ? (isAr ? 'استبدال المراحل' : 'Replace Phases')
              : (isAr ? 'إضافة المراحل' : 'Append Phases')}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 py-1">
        <FormField label={isAr ? 'القالب' : 'Template'} required>
          <Combobox
            items={items}
            value={templateId}
            onChange={setTemplateId}
            placeholder={isLoading
              ? (isAr ? 'جاري التحميل...' : 'Loading...')
              : (isAr ? '-- اختر القالب --' : '-- Select Template --')}
            searchPlaceholder={isAr ? 'ابحث عن قالب...' : 'Search template...'}
            noResultsText={isAr ? 'لا توجد قوالب' : 'No templates'}
          />
        </FormField>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
          <Switch checked={replace} onChange={() => setReplace((v) => !v)}
            ariaLabel={isAr ? 'استبدال المراحل' : 'Replace phases'} />
          <div className="text-end">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {isAr ? 'استبدال المراحل الحالية' : 'Replace existing phases'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {replace
                ? (isAr ? 'سيتم حذف كل المراحل الحالية ثم إنشاء مراحل القالب' : 'All current phases will be deleted, then template phases created')
                : (isAr ? 'ستُضاف مراحل القالب بعد المراحل الحالية' : 'Template phases will be appended after existing phases')}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
