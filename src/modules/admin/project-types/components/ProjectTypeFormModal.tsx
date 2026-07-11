import { useEffect, useState } from 'react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { Switch }    from '@/shared/components/ui/Switch';
import { FormField } from '@/shared/components/form/FormField';
import type {
  PmProjectTypeItem,
  PmProjectTypePayload,
  ProjectTypeCategory,
} from '@/modules/project-manager/projects/types/project.types';

interface FormState extends PmProjectTypePayload {
  category: ProjectTypeCategory;
}

interface Props {
  open:      boolean;
  onClose:   () => void;
  onSubmit:  (payload: PmProjectTypePayload & { category: ProjectTypeCategory }) => void;
  initial?:  PmProjectTypeItem | null;
  isLoading: boolean;
  isAr:      boolean;
  /** Default module when creating (edit uses initial.category). */
  defaultCategory?: ProjectTypeCategory;
}

const EMPTY = (category: ProjectTypeCategory): FormState => ({
  name: '', nameAr: '', isActive: true, sortOrder: 0, category,
});

export function ProjectTypeFormModal({
  open, onClose, onSubmit, initial, isLoading, isAr, defaultCategory = 'pm',
}: Props) {
  const [form, setForm] = useState<FormState>(EMPTY(defaultCategory));
  const isEdit = !!initial;

  useEffect(() => {
    if (!open) return;
    setForm(initial ? {
      name:       initial.name,
      nameAr:     initial.nameAr ?? '',
      isActive:   initial.isActive,
      sortOrder:  initial.sortOrder,
      category:   initial.category,
    } : EMPTY(defaultCategory));
  }, [open, initial, defaultCategory]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValid = !!form.name.trim();

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      name:      form.name.trim(),
      nameAr:    form.nameAr?.trim() || null,
      isActive:  form.isActive,
      sortOrder: form.sortOrder,
      category:  form.category,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial
        ? (isAr ? 'تعديل نوع المشروع' : 'Edit Project Type')
        : (isAr ? 'إضافة نوع مشروع جديد' : 'Add New Project Type')}
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
        {!isEdit && (
          <FormField label={isAr ? 'القسم' : 'Module'} required>
            <div className="flex gap-2">
              {(['pm', 'seo'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors
                    ${form.category === cat
                      ? 'border-[#A0CD39] bg-[#A0CD39]/15 text-gray-900 dark:text-gray-100'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}
                >
                  {cat === 'pm'
                    ? (isAr ? 'إدارة المشاريع' : 'Project Manager')
                    : (isAr ? 'SEO' : 'SEO')}
                </button>
              ))}
            </div>
          </FormField>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isAr ? 'الاسم بالإنجليزي' : 'English Name'} required>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Web Development" dir="ltr" />
          </FormField>
          <FormField label={isAr ? 'الاسم بالعربي' : 'Arabic Name'}>
            <Input value={form.nameAr ?? ''} onChange={(e) => set('nameAr', e.target.value)}
              placeholder="مثال: تطوير ويب" />
          </FormField>
        </div>

        <FormField label={isAr ? 'ترتيب الفرز' : 'Sort Order'}>
          <Input type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
        </FormField>

        <div className="flex items-center justify-between gap-4 pt-1">
          <Switch checked={form.isActive ?? true} onChange={() => set('isActive', !form.isActive)}
            ariaLabel={isAr ? 'مفعّل' : 'Active'} />
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {isAr ? 'مفعّل' : 'Active'}
          </p>
        </div>
      </div>
    </Modal>
  );
}
