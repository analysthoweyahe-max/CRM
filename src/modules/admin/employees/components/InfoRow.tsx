import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: ReactNode;
}

export function InfoRow({ label, value }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-gray-600 dark:text-gray-300">{value}</span>
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
    </div>
  );
}
