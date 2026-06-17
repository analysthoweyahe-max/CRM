import { type ReactNode } from 'react';
import { FieldError } from './FieldError';

interface FormFieldProps {
  label?:    string;
  error?:    string;
  children:  ReactNode;
  required?: boolean;
}

export function FormField({ label, error, children, required }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ms-0.5">*</span>}
        </label>
      )}
      {children}
      <FieldError message={error} />
    </div>
  );
}
