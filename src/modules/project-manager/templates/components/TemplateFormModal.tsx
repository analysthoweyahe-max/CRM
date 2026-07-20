import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { Switch }    from '@/shared/components/ui/Switch';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { MultiCombobox } from '@/shared/components/form/MultiCombobox';
import { FormField } from '@/shared/components/form/FormField';
import { usePmProjectLookups } from '@/modules/project-manager/projects/hooks/usePmProjectLookups';
import { createProjectApi } from '@/shared/modules/create-project/api/createProject.api';
import { projectTypeLabel } from '@/shared/modules/create-project/utils/createProject.utils';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { TemplateStepsEditor } from './TemplateStepsEditor';
import { templateProjectTypeIds } from '../utils/templateFilter';
import type { TemplateModule } from '../api/projectTemplate.api';
import type {
  PmProjectTemplate,
  PmTemplatePayload,
  PmTemplateStep,
} from '../types/template.types';

interface Props {
  open:      boolean;
  onClose:   () => void;
  onSubmit:  (payload: PmTemplatePayload) => void;
  initial?:  PmProjectTemplate | null;
  isLoading: boolean;
  isAr:      boolean;
  module?:   TemplateModule;
  fieldErrors?: Record<string, string>;
  onClearFieldError?: (field: string) => void;
}

const TEXTAREA = [
  'w-full rounded-lg border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent resize-none',
].join(' ');

export function TemplateFormModal({
  open, onClose, onSubmit, initial, isLoading, isAr, module = 'pm',
  fieldErrors = {}, onClearFieldError,
}: Props) {
  const pmLookups = usePmProjectLookups();
  const seoTypesQ = useQuery({
    queryKey: ['create-project', 'seo', 'types', 'template-form'],
    queryFn:  () => createProjectApi.projectTypes('seo'),
    enabled:  open && module === 'seo',
    staleTime: 60_000,
  });

  const [name, setName]           = useState('');
  const [link, setLink]           = useState('');
  const [description, setDesc]    = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [projectTypes, setTypes]  = useState<string[]>([]);
  const [steps, setSteps]         = useState<PmTemplateStep[]>([]);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setLink(initial?.link ?? '');
    setDesc(initial?.description ?? '');
    setIsDefault(initial?.isDefault ?? false);
    setTypes(initial ? templateProjectTypeIds(initial).map(String) : []);
    setSteps(
      initial?.steps?.length
        ? initial.steps.map((s, i) => ({ ...s, sortOrder: s.sortOrder ?? i }))
        : [{ title: '', description: '', sortOrder: 0 }],
    );
  }, [open, initial]);

  const validSteps = steps.filter((s) => s.title.trim());
  const isValid = !!name.trim() && validSteps.length > 0;

  const typeItems: ComboboxItem[] = module === 'seo'
    ? (seoTypesQ.data ?? []).map((t) => ({
        id:    String(t.id),
        label: projectTypeLabel(t, isAr),
      }))
    : pmLookups.types.map((t) => ({
        id: t.value,
        label: translateProjectLookup(t.value, t.label, isAr, t.labelAr),
      }));

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      name:             name.trim(),
      link:             link.trim() || null,
      description:      description.trim() || null,
      is_default:       isDefault,
      project_type_ids: projectTypes.map(Number).filter((n) => !Number.isNaN(n)),
      steps: validSteps.map((s, i) => ({
        title:       s.title.trim(),
        description: s.description?.trim() || null,
        sort_order:  i,
      })),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      title={initial
        ? (isAr ? 'تعديل القالب' : 'Edit Template')
        : (isAr ? 'إضافة قالب جديد' : 'Add New Template')}
      footer={
        <div className="flex items-center gap-3 justify-start flex-row-reverse">
          <Button variant="primary" disabled={!isValid} isLoading={isLoading} onClick={handleSubmit}>
            {isAr ? 'حفظ' : 'Save'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 py-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isAr ? 'اسم القالب' : 'Template Name'} required>
            <Input value={name} onChange={(e) => setName(e.target.value)}
              placeholder={isAr
                ? (module === 'seo' ? 'مثال: قالب حملة SEO' : 'مثال: قالب تطوير ويب')
                : (module === 'seo' ? 'e.g. SEO Campaign Template' : 'e.g. Web Development Template')} />
          </FormField>
          <FormField
            label={isAr ? 'نوع المشروع' : 'Project Type'}
            hint={isAr
              ? 'اختر نوعاً أو أكثر لربط القالب، أو اتركه فارغاً ليكون عاماً'
              : 'Select one or more types, or leave empty for global'}
          >
            <MultiCombobox
              items={typeItems}
              values={projectTypes}
              onChange={setTypes}
              placeholder={isAr ? 'كل الأنواع (عام)' : 'All types (global)'}
              searchPlaceholder={isAr ? 'ابحث عن نوع...' : 'Search type...'}
              noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
            />
          </FormField>
        </div>

        <FormField label={isAr ? 'الوصف' : 'Description'}>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={isAr ? 'وصف مختصر للقالب' : 'Short template description'}
            className={TEXTAREA}
          />
        </FormField>

        <FormField
          label={isAr ? 'رابط القالب' : 'Template link'}
          hint={!fieldErrors.link
            ? (isAr ? 'اختياري — رابط خارجي للموارد أو الوثائق' : 'Optional — external URL for resources or docs')
            : undefined}
          error={fieldErrors.link}
        >
          <Input
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              if (fieldErrors.link) onClearFieldError?.('link');
            }}
            placeholder="https://docs.google.com/... or docs.google.com/..."
            dir="ltr"
            hasError={!!fieldErrors.link}
          />
        </FormField>

        <div className="flex items-center justify-between gap-4">
          <Switch checked={isDefault} onChange={() => setIsDefault((v) => !v)}
            ariaLabel={isAr ? 'قالب افتراضي' : 'Default template'} />
          <div className="text-end">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {isAr ? 'قالب افتراضي' : 'Default Template'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {isAr ? 'يمكن أن يكون قالب واحد فقط افتراضياً' : 'Only one template can be default'}
            </p>
          </div>
        </div>

        <TemplateStepsEditor steps={steps} onChange={setSteps} isAr={isAr} />
      </div>
    </Modal>
  );
}
