import React, { useState, useEffect } from 'react';
import './StatusIndicator.css';

interface StatusCheck {
  id: number;
  timestamp: string;
  is_open: boolean;
  response_time: number;
  error_message?: string;
}

const StatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<StatusCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/status/latest`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchLatestStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading && !status) {
    return (
      <div className="status-indicator">
        <div className="status-loading">Loading status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-indicator">
        <div className="status-error">
          <span className="status-dot status-dot-error"></span>
          Error loading status
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="status-indicator">
      <div className="status-content">
        <div className="status-main">
          <span className={`status-dot ${status.is_open ? 'status-dot-open' : 'status-dot-closed'}`}></span>
          <span className="status-text">
            Restaurant is currently <strong>{status.is_open ? 'OPEN' : 'CLOSED'}</strong>
          </span>
        </div>
        <div className="status-details">
          <span className="status-time">
            Last checked: {formatTimestamp(status.timestamp)}
          </span>
          <span className="status-response">
            Response time: {status.response_time}ms
          </span>
        </div>
      </div>
      <button className="status-refresh" onClick={fetchLatestStatus} disabled={loading}>
        {loading ? '⟳' : '↻'} Refresh
      </button>
    </div>
  );
};

export default StatusIndicator;