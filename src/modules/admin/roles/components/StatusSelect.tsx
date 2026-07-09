import { Combobox } from '@/shared/components/form/Combobox';
import { MANAGER_STATUS_OPTIONS, type ManagerStatus } from '../types/adminManager.types';

interface Props {
  value:    ManagerStatus;
  onChange: (status: ManagerStatus) => void;
  isAr:     boolean;
  disabled?: boolean;
}

export function StatusSelect({ value, onChange, isAr, disabled }: Props) {
  const items = MANAGER_STATUS_OPTIONS.map(o => ({
    id:    o.id,
    label: isAr ? o.labelAr : o.labelEn,
  }));

  return (
    <Combobox
      items={items}
      value={value}
      onChange={v => onChange(v as ManagerStatus)}
      searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
      noResultsText={isAr ? 'لا نتائج' : 'No results'}
      disabled={disabled}
    />
  );
}
