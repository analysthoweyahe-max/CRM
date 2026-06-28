export interface AttendanceStats {
  present:  number;
  late:     number;
  earlyOut: number;
  absent:   number;
}

export interface AttendanceStatsCardsProps {
  stats:      AttendanceStats;
  isLoading:  boolean;
  isAr:       boolean;
  activeKey:  string | null;
  onFilter:   (key: string | null) => void;
}
