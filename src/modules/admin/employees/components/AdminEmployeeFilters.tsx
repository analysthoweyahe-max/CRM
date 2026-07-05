import { Search } from 'lucide-react';
import { Combobox } from '@/shared/components/form/Combobox';
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
      <div className="w-40">
        <Combobox
          items={toItems(departmentOptions, isAr ? 'كل الأقسام' : 'All Departments')}
          value={department}
          onChange={onDepartment}
          searchPlaceholder={isAr ? 'ابحث عن قسم...' : 'Search department...'}
          noResultsText={isAr ? 'لا نتائج' : 'No results'}
        />
      </div>

      <div className="w-40">
        <Combobox
          items={roleItems}
          value={role}
          onChange={onRole}
          searchPlaceholder={isAr ? 'ابحث عن دور...' : 'Search role...'}
          noResultsText={isAr ? 'لا نتائج' : 'No results'}
        />
      </div>

      <div className="w-36">
        <Combobox
          items={statusItems}
          value={status}
          onChange={onStatus}
          searchPlaceholder={isAr ? 'ابحث عن حالة...' : 'Search status...'}
          noResultsText={isAr ? 'لا نتائج' : 'No results'}
        />
      </div>

      <div className="relative flex-1 min-w-52">
        <Search size={14} className="absolute inset-y-0 my-auto inset-s-3 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder={isAr ? 'ابحث عن موظف بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
          className="w-full h-10 ps-9 pe-4 rounded-xl border border-gray-200 dark:border-gray-600
                     bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/30
                     focus:border-[#A0CD39] transition text-end"
        />
      </div>
    </div>
  );
}
