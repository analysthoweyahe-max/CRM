import type { ReactNode } from 'react';

/* ─── Field wrapper ───────────────────────────────── */
interface FormFieldProps {
  label:     string;
  required?: boolean;
  icon?:     ReactNode;
  error?:    string;
  hint?:     string;
  children:  ReactNode;
}

export function FormField({
  label,
  required = false,
  icon,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-base font-semibold text-gray-700 dark:text-gray-300">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error
        ? <p className="text-sm text-red-500">{error}</p>
        : hint && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}

/* ─── Shared input class helper ───────────────────── */
export function inputCls(hasError: boolean) {
  return [
    'w-full h-12 rounded-lg border px-4 text-base',
    'text-gray-800 dark:text-gray-200',
    'bg-white dark:bg-gray-700/50',
    'outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-500',
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
      : 'border-gray-200 dark:border-gray-600 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
  ].join(' ');
}
