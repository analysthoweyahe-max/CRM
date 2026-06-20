import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  open:         boolean;
  onClose:      () => void;
  title:        string;
  description?: string;
  children?:    ReactNode;
  footer?:      ReactNode;
  size?:        'sm' | 'md' | 'lg';
}

const SIZE_CLS = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${SIZE_CLS[size]} bg-white dark:bg-gray-800 rounded-2xl shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {children && (
          <div className="px-6 pb-4">{children}</div>
        )}

        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
