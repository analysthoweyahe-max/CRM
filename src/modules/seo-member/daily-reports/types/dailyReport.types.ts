import type {
  CreateDailyReportPayload,
  DailyReportHistoryItem,
  DailyReportTaskInput,
  RawDailyReportItem,
} from '@/shared/modules/daily-reports/types/dailyReport.types';

export type {
  CreateDailyReportPayload,
  DailyReportHistoryItem,
  DailyReportTaskInput,
};

export interface DailyReportListResponse {
  status:  string;
  message: string;
  data: {
    data:         RawDailyReportItem[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface DailyReportCreateResponse {
  status:  string;
  message: string;
  data:    RawDailyReportItem | DailyReportHistoryItem;
}
