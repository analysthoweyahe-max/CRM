import type { AxiosError } from 'axios';

export function extractApiError(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message ?? 'An unexpected error occurred.';
}
