import { useEffect, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';

interface Props {
  open:      boolean;
  onClose:   () => void;
  onSubmit:  (name: string, image: File) => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function AddDepartmentModal({ open, onClose, onSubmit, isLoading, isAr }: Props) {
  const [name,    setName]    = useState('');
  const [image,   setImage]   = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName('');
    setImage(null);
    setPreview(null);
  }, [open]);

  function handleFile(file: File | null) {
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  const isValid = !!(name.trim() && image);

  function handleSubmit() {
    if (!isValid || !image) return;
    onSubmit(name.trim(), image);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'إضافة قسم جديد' : 'Add New Department'}
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

        <FormField label={isAr ? 'صورة القسم' : 'Department Image'} required>
          <label className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600
                             px-4 py-3 cursor-pointer hover:border-brand-400 transition">
            {preview ? (
              <img src={preview} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
            ) : (
              <ImagePlus size={18} className="text-gray-400 shrink-0" />
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {image ? image.name : (isAr ? 'اختر صورة...' : 'Choose an image...')}
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
