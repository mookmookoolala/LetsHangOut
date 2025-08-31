import React, { useState } from 'react';

export function CalendarSelector({ onSelect }) {
  const [date, setDate] = useState('');
  return (
    <div className="calendar-container">
      <h2>Select Free Time</h2>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <button onClick={() => onSelect(date)}>Select</button>
    </div>
  );
} 