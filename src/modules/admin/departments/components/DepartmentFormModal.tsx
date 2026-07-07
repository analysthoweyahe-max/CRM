import { useEffect, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import type { ApiDepartment } from '../types/adminDepartment.types';

interface Props {
  open:      boolean;
  onClose:   () => void;
  onSubmit:  (name: string, image: File | null) => void;
  initial?:  ApiDepartment | null;
  isLoading: boolean;
  isAr:      boolean;
}

export function DepartmentFormModal({ open, onClose, onSubmit, initial, isLoading, isAr }: Props) {
  const [name,    setName]    = useState('');
  const [image,   setImage]   = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const isEdit = !!initial;

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setImage(null);
    setPreview(null);
  }, [open, initial]);

  function handleFile(file: File | null) {
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  const isValid = !!(name.trim() && (isEdit || image));

  function handleSubmit() {
    if (!isValid) return;
    onSubmit(name.trim(), image);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit
        ? (isAr ? 'تعديل القسم' : 'Edit Department')
        : (isAr ? 'إضافة قسم جديد' : 'Add New Department')}
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
        <FormField label={isAr ? 'اسم القسم' : 'Department Name'} required>
          <Input value={name} onChange={(e) => setName(e.target.value)}
            placeholder={isAr ? 'مثال: التسويق' : 'e.g. Marketing'} />
        </FormField>

        <FormField label={isAr ? 'صورة القسم' : 'Department Image'} required={!isEdit}>
          <label className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600
                             px-4 py-3 cursor-pointer hover:border-brand-400 transition">
            {preview ? (
              <img src={preview} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
            ) : (
              <ImagePlus size={18} className="text-gray-400 shrink-0" />
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {image
                ? image.name
                : isEdit
                  ? (isAr ? 'اتركها لإبقاء الصورة الحالية' : 'Leave empty to keep the current image')
                  : (isAr ? 'اختر صورة...' : 'Choose an image...')}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </FormField>
      </div>
    </Modal>
  );
}
