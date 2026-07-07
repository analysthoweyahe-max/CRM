import { Combobox } from '@/shared/components/form/Combobox';
import { SearchInput } from '@/shared/components/form/SearchInput';
import { getRoleLabel } from '../types/adminEmployee.types';

interface Props {
  isAr:              boolean;
  search:            string;
  department:        string;
  role:              string;
  status:            string;
  departmentOptions: string[];
  roleOptions:       string[];
  onSearch:          (v: string) => void;
  onDepartment:      (v: string) => void;
  onRole:            (v: string) => void;
  onStatus:          (v: string) => void;
}

export function AdminEmployeeFilters({
  isAr, search, department, role, status,
  departmentOptions, roleOptions,
  onSearch, onDepartment, onRole, onStatus,
}: Props) {
  const toItems = (opts: string[], allLabel: string) => [
    { id: '', label: allLabel },
    ...opts.map(o => ({ id: o, label: o })),
  ];

  const roleItems = [
    { id: '', label: isAr ? 'كل الأدوار' : 'All Roles' },
    ...roleOptions.map(o => ({ id: o, label: getRoleLabel(o, isAr) })),
  ];

  const statusItems = [
    { id: '',         label: isAr ? 'كل الحالات' : 'All Statuses' },
    { id: 'active',   label: isAr ? 'نشط'  : 'Active'   },
    { id: 'inactive', label: isAr ? 'معطل' : 'Inactive' },
    { id: 'pending',  label: isAr ? 'معلق' : 'Pending'  },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-full sm:w-40">
        <Combobox
          items={toItems(departmentOptions, isAr ? 'كل الأقسام' : 'All Departments')}
          value={department}
          onChange={onDepartment}
          searchPlaceholder={isAr ? 'ابحث عن قسم...' : 'Search department...'}
          noResultsText={isAr ? 'لا نتائج' : 'No results'}
        />
      </div>

      <div className="w-full sm:w-40">
        <Combobox
          items={roleItems}
          value={role}
          onChange={onRole}
          searchPlaceholder={isAr ? 'ابحث عن دور...' : 'Search role...'}
          noResultsText={isAr ? 'لا نتائج' : 'No results'}
        />
      </div>

      <div className="w-full sm:w-36">
        <Combobox
          items={statusItems}
          value={status}
          onChange={onStatus}
          searchPlaceholder={isAr ? 'ابحث عن حالة...' : 'Search status...'}
          noResultsText={isAr ? 'لا نتائج' : 'No results'}
        />
      </div>

      <SearchInput
        value={search}
        onChange={onSearch}
        placeholder={isAr ? 'ابحث عن موظف بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
        isAr={isAr}
        className="w-full sm:flex-1 sm:min-w-52"
      />
    </div>
  );
}
