import { useEffect, useRef, useState } from 'react';
import { ImageIcon, Paperclip, X } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import { ArrayInput } from '@/shared/components/form/ArrayInput';
import {
  normalizeImportantLinks,
  validateImportantLinks,
} from '@/shared/utils/importantLinks.utils';
import type { ClientIssue, CreateClientIssuePayload } from '../types/projectClientIssue.types';

interface Props {
  open:       boolean;
  onClose:    () => void;
  onSubmit:   (
    payload: CreateClientIssuePayload,
    images?: File[],
    files?: File[],
  ) => Promise<void>;
  initial?:   ClientIssue | null;
  isLoading:  boolean;
  isAr:       boolean;
}

const EMPTY = { problem: '', impact: '', solution: '' };

export function ClientIssueFormModal({
  open, onClose, onSubmit, initial, isLoading, isAr,
}: Props) {
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState<File[]>([]);
  const [files, setFiles]   = useState<File[]>([]);
  const [links, setLinks]   = useState<string[]>([]);
  const [linksError, setLinksError] = useState<string | undefined>();
  const imageRef = useRef<HTMLInputElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm(initial
      ? { problem: initial.problem, impact: initial.impact, solution: initial.solution ?? '' }
      : EMPTY);
    setImages([]);
    setFiles([]);
    setLinks(initial?.links?.length ? [...initial.links] : []);
    setLinksError(undefined);
  }, [open, initial]);

  const isValid = !!(form.problem.trim() && form.impact.trim());

  async function handleSubmit() {
    if (!isValid) return;
    const linksErr = validateImportantLinks(links, isAr);
    if (linksErr) {
      setLinksError(linksErr);
      return;
    }
    setLinksError(undefined);
    const cleanedLinks = normalizeImportantLinks(links);
    // Always send links from this form: [] clears on update; create accepts optional array.
    await onSubmit({
      problem:  form.problem.trim(),
      impact:   form.impact.trim(),
      solution: form.solution.trim() || null,
      links:    cleanedLinks,
    }, images, files);
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
                {isAr ? 'الروابط' : 'Links'}
              </td>
              <td className="py-3 px-3">
                <FormField label="" error={linksError}>
                  <ArrayInput
                    values={links}
                    type="url"
                    placeholder="https://..."
                    addLabel={isAr ? 'إضافة رابط' : 'Add link'}
                    onAdd={() => setLinks(prev => [...prev, ''])}
                    onUpdate={(i, v) => {
                      setLinks(prev => {
                        const next = [...prev];
                        next[i] = v;
                        return next;
                      });
                      setLinksError(undefined);
                    }}
                    onRemove={i => setLinks(prev => prev.filter((_, idx) => idx !== i))}
                    minItems={0}
                    dir="ltr"
                    error={!!linksError}
                  />
                </FormField>
              </td>
            </tr>
            <tr>
              <td className="py-3 px-3 align-top font-medium text-gray-700 dark:text-gray-300">
                {isAr ? 'إرفاق صور' : 'Attach Images'}
              </td>
              <td className="py-3 px-3 space-y-2">
                <FormField label="">
                  <input
                    ref={imageRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => {
                      const selected = Array.from(e.target.files ?? []);
                      if (selected.length) setImages(prev => [...prev, ...selected]);
                      e.target.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    startIcon={<ImageIcon size={14} />}
                    onClick={() => imageRef.current?.click()}
                  >
                    {isAr ? 'اختر صوراً' : 'Choose images'}
                  </Button>
                </FormField>
                {images.length > 0 && (
                  <ul className="space-y-1">
                    {images.map((file, i) => (
                      <li key={`${file.name}-${i}`}
                        className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <ImageIcon size={12} className="shrink-0 text-gray-400" />
                        <span className="truncate flex-1" dir="ltr">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-gray-400 hover:text-red-500 p-0.5"
                          aria-label={isAr ? 'إزالة' : 'Remove'}
                        >
                          <X size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-3 align-top font-medium text-gray-700 dark:text-gray-300">
                {isAr ? 'إرفاق ملفات' : 'Attach Files'}
              </td>
              <td className="py-3 px-3 space-y-2">
                <FormField label="">
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={e => {
                      const selected = Array.from(e.target.files ?? []);
                      if (selected.length) setFiles(prev => [...prev, ...selected]);
                      e.target.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    startIcon={<Paperclip size={14} />}
                    onClick={() => fileRef.current?.click()}
                  >
                    {isAr ? 'اختر ملفات' : 'Choose files'}
                  </Button>
                </FormField>
                {files.length > 0 && (
                  <ul className="space-y-1">
                    {files.map((file, i) => (
                      <li key={`${file.name}-${i}`}
                        className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <Paperclip size={12} className="shrink-0 text-gray-400" />
                        <span className="truncate flex-1" dir="ltr">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-gray-400 hover:text-red-500 p-0.5"
                          aria-label={isAr ? 'إزالة' : 'Remove'}
                        >
                          <X size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
