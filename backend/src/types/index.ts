export interface StatusCheck {
  id: number;
  timestamp: Date;
  is_open: boolean;
  response_time?: number;
  error_message?: string;
  page_content?: string;
}

export interface DailyEvent {
  id: number;
  date: string;
  event_type: 'fully_open' | 'opened_late' | 'closed_early' | 'never_opened' | 'outside_hours';
  expected_open_time: string;
  expected_close_time: string;
  actual_open_time?: string;
  actual_close_time?: string;
  details?: any;
  created_at: Date;
}

export interface RestaurantConfig {
  id: number;
  name: string;
  url: string;
  closed_indicator: string;
  check_interval_minutes: number;
  operating_days: number[];
  open_time: string;
  close_time: string;
  timezone: string;
  updated_at: Date;
}

export interface CalendarDay {
  date: string;
  status: 'fully_open' | 'opened_late' | 'closed_early' | 'never_opened' | 'outside_hours' | 'not_operating_day';
  events: DailyEvent[];
}