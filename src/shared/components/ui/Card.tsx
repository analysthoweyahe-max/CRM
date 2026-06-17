import type { HTMLAttributes } from 'react';

type Padding = 'none' | 'sm' | 'md' | 'lg';

const PAD: Record<Padding, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?:  Padding;
  overflow?: boolean;
}

export function Card({
  children,
  className = '',
  padding   = 'none',
  overflow  = false,
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl border border-gray-100 dark:border-gray-700',
        'bg-white dark:bg-gray-800 shadow-sm',
        overflow ? 'overflow-hidden' : '',
        PAD[padding],
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
