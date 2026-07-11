import { useMemo } from 'react';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import { MultiCombobox } from '@/shared/components/form/MultiCombobox';
import { useDepartments, useJobTitles } from '@/modules/hr/employees/hooks/useLookups';
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

function titleDepartmentId(t: { departmentId?: unknown; department_id?: unknown }): string {
  const raw = t.departmentId ?? t.department_id;
  return raw == null || raw === '' ? '' : String(raw);
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
  const { data: departments = [], isLoading: deptsLoading } = useDepartments();
  const { data: allJobTitles = [], isLoading: titlesLoading } = useJobTitles();

  const selectedDeptSet = useMemo(
    () => new Set(values.departmentIds.map(String)),
    [values.departmentIds],
  );

  const filteredTitles = useMemo(() => {
    if (selectedDeptSet.size === 0) return [];
    return allJobTitles.filter((t) => {
      const deptId = titleDepartmentId(t);
      // Titles without a department stay available; otherwise must match a selected dept
      return !deptId || selectedDeptSet.has(deptId);
    });
  }, [allJobTitles, selectedDeptSet]);

  const deptItems = departments.map((d) => ({
    id:    String(d.id),
    label: isAr ? (d.nameAr || d.name_ar || d.name) : d.name,
  }));

  const titleItems = filteredTitles.map((t) => ({
    id:    String(t.id),
    label: isAr ? (t.nameAr || t.name_ar || t.name) : t.name,
  }));

  function handleDepartmentsChange(departmentIds: string[]) {
    const nextSet = new Set(departmentIds.map(String));
    const title = allJobTitles.find((t) => String(t.id) === values.jobTitleId);
    const titleDept = title ? titleDepartmentId(title) : '';
    const jobTitleStillValid = !values.jobTitleId
      || !titleDept
      || nextSet.has(titleDept);

    onChange({
      departmentIds,
      ...(jobTitleStillValid ? {} : { jobTitleId: '' }),
    });
  }

  function handleJobTitleChange(jobTitleId: string) {
    const title = allJobTitles.find((t) => String(t.id) === jobTitleId);
    const deptFromTitle = title ? titleDepartmentId(title) : '';
    const patch: Partial<ManagerFormValues> = { jobTitleId };

    // Ensure the title's department is among the selected departments
    if (deptFromTitle && !selectedDeptSet.has(deptFromTitle)) {
      patch.departmentIds = [...values.departmentIds, deptFromTitle];
    }

    onChange(patch);
  }

  function togglePermission(slug: string) {
    onChange({
      permissions: values.permissions.includes(slug)
        ? values.permissions.filter(s => s !== slug)
        : [...values.permissions, slug],
    });
  }

  const deptError = errors.departmentIds || errors.department_ids || errors.departmentId || errors.department_id;

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label={isAr ? 'الأقسام' : 'Departments'}
          required
          error={deptError}
        >
          <MultiCombobox
            items={deptItems}
            values={values.departmentIds}
            onChange={handleDepartmentsChange}
            error={!!deptError}
            placeholder={isAr ? 'اختر قسماً أو أكثر' : 'Select one or more departments'}
            searchPlaceholder={isAr ? 'ابحث عن قسم...' : 'Search department...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
            disabled={deptsLoading}
          />
        </FormField>

        <FormField
          label={isAr ? 'المسمى الوظيفي' : 'Job Title'}
          required
          error={errors.jobTitleId || errors.job_title_id}
        >
          <Combobox
            items={titleItems}
            value={values.jobTitleId}
            onChange={handleJobTitleChange}
            searchPlaceholder={isAr ? 'ابحث عن مسمى...' : 'Search job title...'}
            noResultsText={
              values.departmentIds.length === 0
                ? (isAr ? 'اختر قسماً أولاً' : 'Select a department first')
                : (isAr ? 'لا نتائج' : 'No results')
            }
            disabled={titlesLoading || values.departmentIds.length === 0}
            placeholder={
              values.departmentIds.length === 0
                ? (isAr ? 'اختر قسماً أولاً' : 'Select a department first')
                : (isAr ? 'اختر المسمى' : 'Select job title')
            }
          />
        </FormField>
      </div>

      <FormField label={isAr ? 'الدور' : 'Role'} required error={errors.role}>
        <RoleSelect
          value={values.role}
          onChange={role => onChange({ role })}
          isAr={isAr}
          availableRoles={availableRoles}
          allowedRoleNames={allowedRoleNames}
          disabled={allowedRoleNames !== undefined && allowedRoleNames.length === 0}
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
