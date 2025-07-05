import React, { useState, useEffect } from 'react';
import { DailyEvent } from '../types';
import { ApiService } from '../services/api';
import './EventLog.css';

interface EventLogProps {
  selectedDate: string | null;
  onClose: () => void;
}

const EventLog: React.FC<EventLogProps> = ({ selectedDate, onClose }) => {
  const [events, setEvents] = useState<DailyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate) {
      loadEvents();
    }
  }, [selectedDate]);

  const loadEvents = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getEventsForDate(selectedDate);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return 'Unknown';
    return time.substring(0, 5); // HH:MM format
  };

  const formatDate = (dateStr: string) => {
    // Parse YYYY-MM-DD format safely without timezone conversion
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'fully_open': return '✅';
      case 'opened_late': return '⏰';
      case 'closed_early': return '⏰';
      case 'never_opened': return '❌';
      default: return '❓';
    }
  };

  const getEventDescription = (event: DailyEvent) => {
    switch (event.event_type) {
      case 'fully_open':
        return `Restaurant operated normally from ${formatTime(event.actual_open_time)} to ${formatTime(event.actual_close_time)}`;
      case 'opened_late':
        return `Restaurant opened late at ${formatTime(event.actual_open_time)} (expected ${formatTime(event.expected_open_time)})`;
      case 'closed_early':
        return `Restaurant closed early at ${formatTime(event.actual_close_time)} (expected ${formatTime(event.expected_close_time)})`;
      case 'never_opened':
        return `Restaurant never opened (expected ${formatTime(event.expected_open_time)} - ${formatTime(event.expected_close_time)})`;
      default:
        return 'Unknown event';
    }
  };

  if (!selectedDate) {
    return null;
  }

  return (
    <div className="event-log-overlay">
      <div className="event-log">
        <div className="event-log-header">
          <h3>Events for {formatDate(selectedDate)}</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="event-log-content">
          {loading && <div className="loading">Loading events...</div>}
          
          {error && <div className="error">Error: {error}</div>}
          
          {!loading && !error && events.length === 0 && (
            <div className="no-events">No events recorded for this date.</div>
          )}
          
          {!loading && !error && events.length > 0 && (
            <div className="events-list">
              {events.map(event => (
                <div key={event.id} className={`event-item ${event.event_type}`}>
                  <div className="event-icon">{getEventIcon(event.event_type)}</div>
                  <div className="event-details">
                    <div className="event-description">
                      {getEventDescription(event)}
                    </div>
                    <div className="event-meta">
                      <span>Expected: {formatTime(event.expected_open_time)} - {formatTime(event.expected_close_time)}</span>
                      {event.actual_open_time && (
                        <span>Actual Open: {formatTime(event.actual_open_time)}</span>
                      )}
                      {event.actual_close_time && (
                        <span>Actual Close: {formatTime(event.actual_close_time)}</span>
                      )}
                    </div>
                    {event.details && (
                      <div className="event-stats">
                        <small>
                          Checks: {event.details.total_checks} | 
                          Open: {event.details.open_checks} | 
                          Closed: {event.details.closed_checks}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventLog;