import type { ReactNode } from 'react';

interface PageHeaderProps {
  title:     string;
  subtitle?: string;
  start?:    ReactNode;
  actions?:  ReactNode;
}

export function PageHeader({ title, subtitle, start, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {start}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="sm:shrink-0 flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
