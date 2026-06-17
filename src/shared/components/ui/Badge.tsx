import type { ReactNode } from 'react';

const VARIANTS = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
  error:   'bg-red-100    text-red-600    dark:bg-red-900/30    dark:text-red-400',
  brand:   'bg-brand-50   text-brand-700  dark:bg-brand-900/30  dark:text-brand-300 border border-brand-200 dark:border-brand-700/50',
  gray:    'bg-gray-100   text-gray-600   dark:bg-gray-700      dark:text-gray-300  border border-gray-200 dark:border-gray-600',
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

interface BadgeProps {
  label:      string;
  variant:    BadgeVariant;
  icon?:      ReactNode;
  className?: string;
}

export function Badge({ label, variant, icon, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                  text-[11px] font-medium ${VARIANTS[variant]} ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}
