import { pool } from '../database/connection';
import { StatusCheck, DailyEvent, CalendarDay } from '../types';

export class DatabaseService {
  async saveStatusCheck(isOpen: boolean, responseTime?: number, errorMessage?: string, pageContent?: string): Promise<void> {
    const query = `
      INSERT INTO status_checks (is_open, response_time, error_message, page_content)
      VALUES ($1, $2, $3, $4)
    `;
    
    await pool.query(query, [isOpen, responseTime, errorMessage, pageContent]);
  }

  async getStatusChecks(limit: number = 100): Promise<StatusCheck[]> {
    const query = `
      SELECT * FROM status_checks
      ORDER BY timestamp DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  async saveDailyEvent(event: Omit<DailyEvent, 'id' | 'created_at'>): Promise<void> {
    const query = `
      INSERT INTO daily_events (date, event_type, expected_open_time, expected_close_time, actual_open_time, actual_close_time, details)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (date, event_type) DO UPDATE SET
        actual_open_time = EXCLUDED.actual_open_time,
        actual_close_time = EXCLUDED.actual_close_time,
        details = EXCLUDED.details
    `;
    
    await pool.query(query, [
      event.date,
      event.event_type,
      event.expected_open_time,
      event.expected_close_time,
      event.actual_open_time,
      event.actual_close_time,
      JSON.stringify(event.details)
    ]);
  }

  async getCalendarData(startDate: string, endDate: string): Promise<CalendarDay[]> {
    const query = `
      SELECT 
        date,
        event_type,
        expected_open_time,
        expected_close_time,
        actual_open_time,
        actual_close_time,
        details,
        created_at
      FROM daily_events
      WHERE date BETWEEN $1 AND $2
      ORDER BY date, event_type
    `;
    
    const result = await pool.query(query, [startDate, endDate]);
    
    // Group events by date
    const eventsByDate: { [date: string]: DailyEvent[] } = {};
    result.rows.forEach(row => {
      const date = row.date.toISOString().split('T')[0];
      if (!eventsByDate[date]) {
        eventsByDate[date] = [];
      }
      eventsByDate[date].push({
        id: row.id,
        date,
        event_type: row.event_type,
        expected_open_time: row.expected_open_time,
        expected_close_time: row.expected_close_time,
        actual_open_time: row.actual_open_time,
        actual_close_time: row.actual_close_time,
        details: row.details,
        created_at: row.created_at
      });
    });

    // Create calendar data
    const calendarData: CalendarDay[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const events = eventsByDate[dateStr] || [];
      
      // Determine primary status for the day
      let status: CalendarDay['status'] = 'not_operating_day';
      if (events.length > 0) {
        // Priority: never_opened > closed_early > opened_late > fully_open
        if (events.some(e => e.event_type === 'never_opened')) {
          status = 'never_opened';
        } else if (events.some(e => e.event_type === 'closed_early')) {
          status = 'closed_early';
        } else if (events.some(e => e.event_type === 'opened_late')) {
          status = 'opened_late';
        } else if (events.some(e => e.event_type === 'fully_open')) {
          status = 'fully_open';
        }
      }
      
      calendarData.push({
        date: dateStr,
        status,
        events
      });
    }
    
    return calendarData;
  }

  async getEventsForDate(date: string): Promise<DailyEvent[]> {
    const query = `
      SELECT * FROM daily_events
      WHERE date = $1
      ORDER BY event_type
    `;
    
    const result = await pool.query(query, [date]);
    return result.rows;
  }
}