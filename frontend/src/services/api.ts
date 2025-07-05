import { CalendarDay, DailyEvent, StatusCheck } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export class ApiService {
  static async getCalendarData(startDate: string, endDate: string): Promise<CalendarDay[]> {
    const response = await fetch(
      `${API_BASE_URL}/calendar?startDate=${startDate}&endDate=${endDate}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar data');
    }
    
    return response.json();
  }

  static async getEventsForDate(date: string): Promise<DailyEvent[]> {
    const response = await fetch(`${API_BASE_URL}/events/${date}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    return response.json();
  }

  static async getStatusChecks(limit: number = 100): Promise<StatusCheck[]> {
    const response = await fetch(`${API_BASE_URL}/status-checks?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch status checks');
    }
    
    return response.json();
  }
}