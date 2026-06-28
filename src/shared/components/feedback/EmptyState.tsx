import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title:        string;
  description?: string;
  icon?:        ReactNode;
  action?:      ReactNode;
  className?:   string;
}

export function EmptyState({ title, description, icon, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-[#D8EBAE]/60 dark:bg-[#A0CD39]/10 flex items-center justify-center mb-4">
        {icon ?? <Inbox size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      </div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
