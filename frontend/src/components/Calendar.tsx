import React, { useState, useEffect } from 'react';
import { CalendarDay } from '../types';
import { ApiService } from '../services/api';
import './Calendar.css';

interface CalendarProps {
  onDateClick: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onDateClick }) => {
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format dates without timezone conversion
  // This prevents the bug where clicking July 5th would show July 4th events
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentMonth]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      const startDate = formatDateToString(new Date(year, month, 1));
      const endDate = formatDateToString(new Date(year, month + 1, 0));
      
      const response = await ApiService.getCalendarData(startDate, endDate);
      setCalendarData(response.calendar);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: CalendarDay['status']) => {
    switch (status) {
      case 'fully_open': return 'status-fully-open';
      case 'opened_late': return 'status-opened-late';
      case 'closed_early': return 'status-closed-early';
      case 'never_opened': return 'status-never-opened';
      case 'outside_hours': return 'status-outside-hours';
      default: return 'status-not-operating';
    }
  };

  const getStatusText = (status: CalendarDay['status']) => {
    switch (status) {
      case 'fully_open': return 'Fully Open';
      case 'opened_late': return 'Opened Late';
      case 'closed_early': return 'Closed Early';
      case 'never_opened': return 'Never Opened';
      case 'outside_hours': return 'Outside Hours';
      default: return 'Not Operating';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getCalendarDayData = (date: Date): CalendarDay | null => {
    const dateStr = formatDateToString(date);
    return calendarData.find(day => day.date === dateStr) || null;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return <div className="calendar-loading">Loading calendar...</div>;
  }

  if (error) {
    return <div className="calendar-error">Error: {error}</div>;
  }

  const calendarDays = generateCalendarDays();

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={() => navigateMonth('prev')} className="nav-button">‹</button>
        <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
        <button onClick={() => navigateMonth('next')} className="nav-button">›</button>
      </div>
      
      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {calendarDays.map(date => {
          const dayData = getCalendarDayData(date);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={date.toISOString()}
              className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${
                isToday ? 'today' : ''
              } ${dayData ? getStatusColor(dayData.status) : ''}`}
              onClick={() => {
                if (isCurrentMonth) {
                  const formattedDate = formatDateToString(date);
                  onDateClick(formattedDate);
                }
              }}
              title={dayData ? getStatusText(dayData.status) : ''}
            >
              <div className="day-number">{date.getDate()}</div>
              {dayData && dayData.events.length > 0 && (
                <div className="event-indicator">{dayData.events.length}</div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color status-fully-open"></div>
          <span>Fully Open</span>
        </div>
        <div className="legend-item">
          <div className="legend-color status-opened-late"></div>
          <span>Opened Late</span>
        </div>
        <div className="legend-item">
          <div className="legend-color status-closed-early"></div>
          <span>Closed Early</span>
        </div>
        <div className="legend-item">
          <div className="legend-color status-never-opened"></div>
          <span>Never Opened</span>
        </div>
        <div className="legend-item">
          <div className="legend-color status-outside-hours"></div>
          <span>Outside Hours</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;