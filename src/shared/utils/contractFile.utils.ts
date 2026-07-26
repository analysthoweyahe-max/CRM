import type { AxiosError } from 'axios';

export const CONTRACT_UPLOAD_MAX_MB = 10;

export const CONTRACT_ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export function formatFileSize(bytes: number, isAr = false): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ${isAr ? 'ك.ب' : 'KB'}`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ${isAr ? 'م.ب' : 'MB'}`;
}

export function validateContractFile(file: File, maxMb: number = CONTRACT_UPLOAD_MAX_MB): string | null {
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File "${file.name}" exceeds ${maxMb} MB`;
  }
  if (!CONTRACT_ACCEPTED_MIME_TYPES.includes(file.type)) {
    return `File "${file.name}" must be a PDF or image (jpg, png, webp)`;
  }
  return null;
}

/** Extract validation errors from contract upload responses. */
export function extractContractUploadError(error: unknown): string {
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
