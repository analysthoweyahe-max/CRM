import { useRef, type ReactNode } from 'react';
import { X, Pencil, Trash2, ExternalLink, ImageIcon, Paperclip } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Combobox } from '@/shared/components/form/Combobox';
import { formatDateShort } from '@/shared/utils/date.utils';
import { buildStatusComboboxItems, buildStatusLabelMap, statusLabelFor } from '../utils/clientIssue.utils';
import type { ClientIssue, ClientIssueStatus } from '../types/projectClientIssue.types';

interface Props {
  issue:               ClientIssue | null;
  allIssues:           ClientIssue[];
  isAr:                boolean;
  canEdit:             boolean;
  canDelete:           boolean;
  canUpdateStatus:     boolean;
  onClose:             () => void;
  onEdit:              () => void;
  onDelete:            () => void;
  onStatusChange:      (status: ClientIssueStatus) => void;
  onUploadImage:       (file: File) => void;
  onUploadFile:        (file: File) => void;
  onRemoveAttachment:  (attachmentId: number) => void;
}

export function ClientIssueDetailDrawer({
  issue, allIssues, isAr, canEdit, canDelete, canUpdateStatus,
  onClose, onEdit, onDelete, onStatusChange,
  onUploadImage, onUploadFile, onRemoveAttachment,
}: Props) {
  const imageRef = useRef<HTMLInputElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  if (!issue) return null;

  const statusLabelMap = buildStatusLabelMap(allIssues);
  const statusItems = buildStatusComboboxItems(statusLabelMap, isAr);

  const rows: { label: string; value: ReactNode }[] = [
    { label: isAr ? 'المشكلة' : 'Problem', value: issue.problem },
    { label: isAr ? 'تأثيرها' : 'Impact',  value: issue.impact },
    { label: isAr ? 'حلها' : 'Solution',    value: issue.solution || '—' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[560px] bg-white dark:bg-gray-900
                      shadow-2xl flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400
                       hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {isAr ? 'تفاصيل المشكلة' : 'Issue Details'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {canUpdateStatus ? (
            <div className="max-w-xs">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {isAr ? 'الحالة' : 'Status'}
              </p>
              <Combobox
                items={statusItems}
                value={issue.status}
                onChange={v => onStatusChange(v as ClientIssueStatus)}
                searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
                noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
              />
            </div>
          ) : (
            <span className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full
                             bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {statusLabelFor(issue.status, statusLabelMap, isAr)}
            </span>
          )}

          <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/60">
                {rows.map(row => (
                  <tr key={row.label}>
                    <th className="py-3 px-4 text-start font-semibold text-gray-600 dark:text-gray-300
                                   bg-gray-50/80 dark:bg-gray-800/50 w-32 align-top">
                      {row.label}
                    </th>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-100 whitespace-pre-wrap text-start">
                      {row.value}
                    </td>
                  </tr>
                ))}
                <tr>
                  <th className="py-3 px-4 text-start font-semibold text-gray-600 dark:text-gray-300
                                 bg-gray-50/80 dark:bg-gray-800/50 align-top">
                    {isAr ? 'الصورة' : 'Image'}
                  </th>
                  <td className="py-3 px-4 space-y-2">
                    {issue.imageAttachment ? (
                      <div className="flex items-start gap-2">
                        <a href={issue.imageAttachment.url} target="_blank" rel="noreferrer"
                          className="block max-w-xs rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                          <img src={issue.imageAttachment.url} alt={issue.imageAttachment.name}
                            className="w-full h-auto object-cover" />
                        </a>
                        {canEdit && (
                          <button type="button" onClick={() => onRemoveAttachment(issue.imageAttachment!.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ) : canEdit ? (
                      <>
                        <input ref={imageRef} type="file" accept="image/*" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) onUploadImage(f); e.target.value = ''; }} />
                        <Button type="button" variant="secondary" size="sm"
                          startIcon={<ImageIcon size={14} />}
                          onClick={() => imageRef.current?.click()}>
                          {isAr ? 'رفع صورة' : 'Upload image'}
                        </Button>
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="py-3 px-4 text-start font-semibold text-gray-600 dark:text-gray-300
                                 bg-gray-50/80 dark:bg-gray-800/50 align-top">
                    {isAr ? 'الملف' : 'File'}
                  </th>
                  <td className="py-3 px-4 space-y-2">
                    {issue.fileAttachment ? (
                      <div className="flex items-center gap-2">
                        <a href={issue.fileAttachment.url} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-[#709028] dark:text-[#A0CD39] hover:underline">
                          <ExternalLink size={14} />
                          {issue.fileAttachment.name}
                        </a>
                        {canEdit && (
                          <button type="button" onClick={() => onRemoveAttachment(issue.fileAttachment!.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ) : canEdit ? (
                      <>
                        <input ref={fileRef} type="file" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) onUploadFile(f); e.target.value = ''; }} />
                        <Button type="button" variant="secondary" size="sm"
                          startIcon={<Paperclip size={14} />}
                          onClick={() => fileRef.current?.click()}>
                          {isAr ? 'رفع ملف' : 'Upload file'}
                        </Button>
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 text-start">
            {issue.createdBy?.name} · {formatDateShort(issue.createdAt, isAr)}
          </p>
        </div>

        {(canEdit || canDelete) && (
          <div className="flex items-center justify-start gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
            {canEdit && (
              <Button variant="secondary" size="sm" startIcon={<Pencil size={14} />} onClick={onEdit}>
                {isAr ? 'تعديل' : 'Edit'}
              </Button>
            )}
            {canDelete && (
              <Button variant="ghost" size="sm" startIcon={<Trash2 size={14} />} onClick={onDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                {isAr ? 'حذف' : 'Delete'}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
