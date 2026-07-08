import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'icon'
  | 'icon-brand'
  | 'icon-danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  isLoading?: boolean;
  startIcon?: ReactNode;
  endIcon?:   ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLS: Record<ButtonVariant, string> = {
  primary:
    'rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-gray-900 font-semibold',
  secondary:
    'rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50',
  danger:
    'rounded-lg border border-red-200 bg-white dark:bg-gray-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
  ghost:
    'rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  icon:
    'flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
  'icon-brand':
    'flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-[#D8EBAE]',
  'icon-danger':
    'flex items-center justify-center w-8 h-8 rounded-lg text-red-700 hover:bg-[#F0A696]',
};

// icon* and ghost manage their own sizing; primary/secondary/danger get size classes
const SIZED_VARIANTS = new Set<ButtonVariant>(['primary', 'secondary', 'danger']);

const SIZE_CLS: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'py-3.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'md',
      isLoading = false,
      startIcon,
      endIcon,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const cls = [
      'inline-flex items-center justify-center gap-2 transition-colors shrink-0',
      VARIANT_CLS[variant],
      SIZED_VARIANTS.has(variant) && SIZE_CLS[size],
      fullWidth && 'w-full',
      (disabled || isLoading) && 'disabled:opacity-60 disabled:cursor-not-allowed',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} disabled={disabled || isLoading} className={cls} {...rest}>
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
            {children}
          </>
        ) : (
          <>
            {startIcon}
            {children}
            {endIcon}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
