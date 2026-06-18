import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, startIcon, endIcon, className = '', ...props }, ref) => {
    const cls = [
      'w-full h-11 rounded-lg border text-sm',
      'text-gray-800 dark:text-gray-200',
      'bg-white dark:bg-gray-700/50',
      'outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-500',
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
        : 'border-gray-200 dark:border-gray-600 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
      startIcon ? 'ps-9' : 'ps-4',
      endIcon   ? 'pe-9' : 'pe-4',
      className,
    ].join(' ');

    return (
      <div className="relative">
        {startIcon && (
          <span className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-gray-400">
            {startIcon}
          </span>
        )}
        <input ref={ref} className={cls} {...props} />
        {endIcon && (
          <span className="absolute inset-y-0 end-3 flex items-center pointer-events-none text-gray-400">
            {endIcon}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
