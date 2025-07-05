export interface DailyEvent {
  id: number;
  date: string;
  event_type: 'fully_open' | 'opened_late' | 'closed_early' | 'never_opened';
  expected_open_time: string;
  expected_close_time: string;
  actual_open_time?: string;
  actual_close_time?: string;
  details?: any;
  created_at: string;
}

export interface CalendarDay {
  date: string;
  status: 'fully_open' | 'opened_late' | 'closed_early' | 'never_opened' | 'not_operating_day';
  events: DailyEvent[];
}

export interface StatusCheck {
  id: number;
  timestamp: string;
  is_open: boolean;
  response_time?: number;
  error_message?: string;
  page_content?: string;
}