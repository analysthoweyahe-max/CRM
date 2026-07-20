import { useEffect, useRef, useState } from 'react';
import { ImageIcon, Paperclip } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import type { ClientIssue, CreateClientIssuePayload } from '../types/projectClientIssue.types';

interface Props {
  open:       boolean;
  onClose:    () => void;
  onSubmit:   (payload: CreateClientIssuePayload, image?: File | null, file?: File | null) => Promise<void>;
  initial?:   ClientIssue | null;
  isLoading:  boolean;
  isAr:       boolean;
}

const EMPTY = { problem: '', impact: '', solution: '' };

export function ClientIssueFormModal({
  open, onClose, onSubmit, initial, isLoading, isAr,
}: Props) {
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState<File | null>(null);
  const [file, setFile]   = useState<File | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm(initial
      ? { problem: initial.problem, impact: initial.impact, solution: initial.solution ?? '' }
      : EMPTY);
    setImage(null);
    setFile(null);
  }, [open, initial]);

  const isValid = !!(form.problem.trim() && form.impact.trim());

  async function handleSubmit() {
    if (!isValid) return;
    await onSubmit({
      problem:  form.problem.trim(),
      impact:   form.impact.trim(),
      solution: form.solution.trim() || null,
    }, image, file);
    onClose();
  }

  const textareaCls = `${inputCls(false)} h-auto min-h-[88px] py-3 resize-y`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      title={initial
        ? (isAr ? 'تعديل المشكلة' : 'Edit Issue')
        : (isAr ? 'إضافة مشكلة للعميل' : 'Add Client Issue')}
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
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="py-2 px-3 text-start font-semibold text-gray-600 dark:text-gray-300 w-36">
                {isAr ? 'الحقل' : 'Field'}
              </th>
              <th className="py-2 px-3 text-start font-semibold text-gray-600 dark:text-gray-300">
                {isAr ? 'القيمة' : 'Value'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/60">
            <tr>
              <td className="py-3 px-3 align-top font-medium text-gray-700 dark:text-gray-300">
                {isAr ? 'المشكلة' : 'Problem'} <span className="text-red-500">*</span>
              </td>
              <td className="py-3 px-3">
                <textarea
                  value={form.problem}
                  onChange={e => setForm(f => ({ ...f, problem: e.target.value }))}
                  className={textareaCls}
                  placeholder={isAr ? 'صف المشكلة...' : 'Describe the problem…'}
                  rows={3}
                />
              </td>
            </tr>
            <tr>
              <td className="py-3 px-3 align-top font-medium text-gray-700 dark:text-gray-300">
                {isAr ? 'تأثيرها' : 'Impact'} <span className="text-red-500">*</span>
              </td>
              <td className="py-3 px-3">
                <textarea
                  value={form.impact}
                  onChange={e => setForm(f => ({ ...f, impact: e.target.value }))}
                  className={textareaCls}
                  placeholder={isAr ? 'ما تأثير المشكلة؟' : 'What is the impact?'}
                  rows={3}
                />
              </td>
            </tr>
            <tr>
              <td className="py-3 px-3 align-top font-medium text-gray-700 dark:text-gray-300">
                {isAr ? 'حلها' : 'Solution'}
              </td>
              <td className="py-3 px-3">
                <textarea
                  value={form.solution}
                  onChange={e => setForm(f => ({ ...f, solution: e.target.value }))}
                  className={textareaCls}
                  placeholder={isAr ? 'الحل المقترح أو المطبق...' : 'Proposed or applied solution…'}
                  rows={3}
                />
              </td>
            </tr>
            <tr>
              <td className="py-3 px-3 align-top font-medium text-gray-700 dark:text-gray-300">
                {isAr ? 'إرفاق صورة' : 'Attach Image'}
              </td>
              <td className="py-3 px-3">
                <FormField label="">
                  <input ref={imageRef} type="file" accept="image/*" className="hidden"
                    onChange={e => setImage(e.target.files?.[0] ?? null)} />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    startIcon={<ImageIcon size={14} />}
                    onClick={() => imageRef.current?.click()}
                  >
                    {image?.name ?? (isAr ? 'اختر صورة' : 'Choose image')}
                  </Button>
                </FormField>
              </td>
            </tr>
            <tr>
              <td className="py-3 px-3 align-top font-medium text-gray-700 dark:text-gray-300">
                {isAr ? 'إرفاق ملف' : 'Attach File'}
              </td>
              <td className="py-3 px-3">
                <FormField label="">
                  <input ref={fileRef} type="file" className="hidden"
                    onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    startIcon={<Paperclip size={14} />}
                    onClick={() => fileRef.current?.click()}
                  >
                    {file?.name ?? (isAr ? 'اختر ملفاً' : 'Choose file')}
                  </Button>
                </FormField>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
