import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { RoleSelect }        from './RoleSelect';
import { StatusSelect }      from './StatusSelect';
import { PermissionsPicker } from './PermissionsPicker';
import type { ManagerFormValues } from '../types/adminManager.types';
import type { ApiRole } from '../types/adminRole.types';

interface Props {
  mode:               'create' | 'edit';
  values:             ManagerFormValues;
  onChange:           (patch: Partial<ManagerFormValues>) => void;
  errors?:            Record<string, string>;
  isAr:               boolean;
  showStatus?:        boolean;
  showPermissions?:   boolean;
  availableRoles?:    ApiRole[];
  allowedRoleNames?:  string[];
  disableEmail?:      boolean;
}

export function ManagerForm({
  mode,
  values,
  onChange,
  errors = {},
  isAr,
  showStatus = mode === 'edit',
  showPermissions = false,
  availableRoles,
  allowedRoleNames,
  disableEmail = false,
}: Props) {
  function togglePermission(slug: string) {
    onChange({
      permissions: values.permissions.includes(slug)
        ? values.permissions.filter(s => s !== slug)
        : [...values.permissions, slug],
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={isAr ? 'الاسم' : 'Name'} required error={errors.name}>
          <Input
            value={values.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder={isAr ? 'الاسم الكامل' : 'Full name'}
          />
        </FormField>

        <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'} required error={errors.email}>
          <Input
            type="email"
            value={values.email}
            onChange={e => onChange({ email: e.target.value })}
            placeholder="name@howeyah.com"
            disabled={disableEmail}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={isAr ? 'رقم الهاتف' : 'Phone'} error={errors.phone}>
          <Input
            value={values.phone}
            onChange={e => onChange({ phone: e.target.value })}
            placeholder={isAr ? '05xxxxxxxx' : '05xxxxxxxx'}
          />
        </FormField>

        {showStatus && (
          <FormField label={isAr ? 'الحالة' : 'Status'} required error={errors.status}>
            <StatusSelect
              value={values.status}
              onChange={status => onChange({ status })}
              isAr={isAr}
            />
          </FormField>
        )}
      </div>

      <FormField label={isAr ? 'الدور' : 'Role'} required error={errors.role}>
        <RoleSelect
          value={values.role}
          onChange={role => onChange({ role })}
          isAr={isAr}
          availableRoles={availableRoles}
          allowedRoleNames={allowedRoleNames}
        />
      </FormField>

      {showPermissions && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {isAr ? 'الصلاحيات' : 'Permissions'}
          </p>
          {errors.permissions && (
            <p className="text-xs text-red-500">{errors.permissions}</p>
          )}
          <PermissionsPicker
            selected={values.permissions}
            onToggle={togglePermission}
            isAr={isAr}
          />
        </div>
      )}
    </div>
  );
}
