import type { AxiosError } from 'axios';

export interface SeoTaskAttachment {
  id:         number;
  fileName:   string;
  mimeType:   string;
  size:       number;
  url:        string;
  uploadedAt: string;
}

export const SEO_ATTACHMENT_UPLOAD_MAX_MB  = 10;
export const SEO_ATTACHMENT_CREATE_MAX_MB  = 20;

export function normalizeSeoAttachment(raw: unknown): SeoTaskAttachment | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.id == null) return null;

  return {
    id:         Number(r.id),
    fileName:   String(r.fileName ?? r.name ?? 'file'),
    mimeType:   String(r.mimeType ?? r.type ?? 'application/octet-stream'),
    size:       Number(r.size ?? 0),
    url:        String(r.url ?? ''),
    uploadedAt: String(r.uploadedAt ?? r.createdAt ?? ''),
  };
}

export function normalizeSeoAttachments(raw: unknown): SeoTaskAttachment[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeSeoAttachment).filter((a): a is SeoTaskAttachment => !!a);
}

export function formatFileSize(bytes: number, isAr = false): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ${isAr ? 'ك.ب' : 'KB'}`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ${isAr ? 'م.ب' : 'MB'}`;
}

export function validateSeoFileSizes(files: File[], maxMb: number): string | null {
  const maxBytes = maxMb * 1024 * 1024;
  const tooLarge = files.find(f => f.size > maxBytes);
  if (!tooLarge) return null;
  return `File "${tooLarge.name}" exceeds ${maxMb} MB`;
}

export function appendSeoTaskFiles(fd: FormData, files: File[]) {
  files.forEach(file => fd.append('files[]', file));
}

/** Extract validation errors from SEO upload/create responses. */
export function extractSeoUploadErrors(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string | Record<string, string[]> }>;
  const message = axiosError?.response?.data?.message;

  if (message && typeof message === 'object') {
    const first = Object.values(message).flat().find(Boolean);
    if (first) return first;
  }

  if (typeof message === 'string' && message) return message;

  const errors = (axiosError?.response?.data as { errors?: Record<string, string[]> })?.errors;
  if (errors) {
    const first = Object.values(errors).flat().find(Boolean);
    if (first) return first;
  }

  return 'Upload failed';
}
