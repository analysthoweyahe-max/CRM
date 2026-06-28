export interface AttendanceFiltersProps {
  activeStatus:   string | null;
  onStatusChange: (s: string | null) => void;
  isAr:           boolean;
}
