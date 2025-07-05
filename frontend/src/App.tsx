import React, { useState } from 'react';
import Calendar from './components/Calendar';
import EventLog from './components/EventLog';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  const handleCloseEventLog = () => {
    setSelectedDate(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>I Love Pastel - Restaurant Status Tracker</h1>
        <p>Track when the restaurant is open, closed, or operating with delays</p>
      </header>
      
      <main className="App-main">
        <Calendar onDateClick={handleDateClick} />
        
        {selectedDate && (
          <EventLog
            selectedDate={selectedDate}
            onClose={handleCloseEventLog}
          />
        )}
      </main>
    </div>
  );
}

export default App;
