import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Modal from 'react-modal';

function Login({ onLogin, onSwitchToRegister, onGuest }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="login-outer" style={{ position: 'relative' }}>
      <img src="https://letshangout.s3.us-east-1.amazonaws.com/icons/LHO8-removebg-preview+(1).png" alt="Letshangout Logo" style={{ position: 'absolute', top: 24, left: 24, width: 56, height: 56, borderRadius: '50%', boxShadow: '0 1px 6px #2a6cff22' }} />
      <div className="login-container">
        <img className="login-logo" src="https://letshangout.s3.us-east-1.amazonaws.com/icons/LHO8-removebg-preview+(1).png" alt="Letshangout Logo" style={{ width: 128, height: 128 }} />
        <h2>Login</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn-primary" onClick={() => onLogin(username, password)}>Login</button>
        <button className="btn-purple" style={{marginTop: '10px'}} onClick={onSwitchToRegister}>Don't have an account? Register</button>
        <button className="btn-secondary" style={{marginTop: '10px'}} onClick={onGuest}>Continue as Guest</button>
      </div>
    </div>
  );
}

function Register({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="login-container">
      <h2>Register</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={() => onRegister(username, password)}>Register</button>
      <button style={{marginTop: '10px'}} onClick={onSwitchToLogin}>Already have an account? Login</button>
    </div>
  );
}

function CreateGroup({ onCreate }) {
  const [groupName, setGroupName] = useState('');
  return (
    <div className="group-container">
      <h2>Create Group</h2>
      <input placeholder="Group Name" value={groupName} onChange={e => setGroupName(e.target.value)} />
      <button onClick={() => onCreate(groupName)}>Create</button>
    </div>
  );
}

function CalendarSelector({ onSelect }) {
  const [date, setDate] = useState('');
  return (
    <div className="calendar-container">
      <h2>Select Free Time</h2>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <button onClick={() => onSelect(date)}>Select</button>
    </div>
  );
}

function JoinGroup({ onJoin, groupList }) {
  const [groupCode, setGroupCode] = useState('');
  const [error, setError] = useState('');
  const handleJoinClick = () => {
    if (groupList && !groupList.includes(groupCode)) {
      setError('Group does not exist.');
      return;
    }
    setError('');
    onJoin(groupCode);
  };
  return (
    <div className="group-container">
      <h2>Join Group</h2>
      <input placeholder="Group Code" value={groupCode} onChange={e => setGroupCode(e.target.value)} />
      <button onClick={handleJoinClick}>Join</button>
      {error && <div style={{color:'red',marginTop:'10px'}}>{error}</div>}
    </div>
  );
}

function Chat({ messages, onSend }) {
  const [input, setInput] = useState('');
  return (
    <div className="chat-container">
      <h2>Group Chat</h2>
      <div className="chat-messages" style={{height: '150px', overflowY: 'auto', background: '#fff', border: '1px solid #ccc', marginBottom: '10px', padding: '10px'}}>
        {messages.map((msg, idx) => (
          <div key={idx}><b>{msg.user}:</b> {msg.text}</div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." />
      <button onClick={() => { onSend(input); setInput(''); }}>Send</button>
    </div>
  );
}

function TodoList({ todos, onAdd, onComplete, onAssign, users }) {
  const [task, setTask] = useState('');
  const [date, setDate] = useState('');
  const [assignee, setAssignee] = useState(users && users.length > 0 ? users[0] : '');
  return (
    <div className="todo-container">
      <h2>To-Do List</h2>
      <div style={{marginBottom: '10px'}}>
        <input placeholder="Task" value={task} onChange={e => setTask(e.target.value)} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        {users && users.length > 0 && (
          <select value={assignee} onChange={e => setAssignee(e.target.value)}>
            {users.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        )}
        <button onClick={() => { onAdd(task, date, assignee); setTask(''); setDate(''); }}>Add</button>
      </div>
      <table style={{width: '100%', background: '#fff', borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            <th style={{border: '1px solid #ccc'}}>Task</th>
            <th style={{border: '1px solid #ccc'}}>Due Date</th>
            <th style={{border: '1px solid #ccc'}}>Assignee</th>
            <th style={{border: '1px solid #ccc'}}>Status</th>
            <th style={{border: '1px solid #ccc'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo, idx) => (
            <tr key={idx} style={{textDecoration: todo.completed ? 'line-through' : 'none'}}>
              <td style={{border: '1px solid #ccc'}}>{todo.task}</td>
              <td style={{border: '1px solid #ccc'}}>{todo.date}</td>
              <td style={{border: '1px solid #ccc'}}>{todo.assignee}</td>
              <td style={{border: '1px solid #ccc'}}>{todo.completed ? 'Done' : 'Pending'}</td>
              <td style={{border: '1px solid #ccc'}}>
                {!todo.completed && <button onClick={() => onComplete(idx)}>Complete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DateVoting({ group, user }) {
  const [dates, setDates] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [userVotes, setUserVotes] = useState({}); // {event_date_id: true/false}
  const [confirmedEvent, setConfirmedEvent] = useState(null);
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  // Fetch proposed dates for the group
  useEffect(() => {
    if (group && group.id) {
      setLoading(true);
      fetch(`http://127.0.0.1:8085/group-dates?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => {
          setDates(data);
          // Extract user's votes
          const votes = {};
          data.forEach(date => {
            if (date.votes && Array.isArray(date.votes)) {
              const myVote = date.votes.find(v => v.user_id === user.id);
              if (myVote) votes[date.id] = myVote.available;
            }
          });
          setUserVotes(votes);
        })
        .catch(() => setDates([]))
        .finally(() => setLoading(false));
    }
  }, [group, user]);

  // Modified handlePropose for range
  const handlePropose = () => {
    if (rangeMode) {
      if (!rangeStart || !rangeEnd || (rangeEnd < rangeStart)) return;
      fetch('http://127.0.0.1:8085/propose-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: group.id, date: rangeStart, end_date: rangeEnd, time: newTime, proposed_by: user.id })
      })
        .then(res => res.json())
        .then(() => {
          setRangeStart('');
          setRangeEnd('');
          setNewTime('');
          // Refresh dates
          return fetch(`http://127.0.0.1:8085/group-dates?group_id=${group.id}`)
            .then(res => res.json())
            .then(setDates);
        });
    } else {
      if (!newDate || !newTime) return;
      fetch('http://127.0.0.1:8085/propose-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: group.id, date: newDate, time: newTime, proposed_by: user.id })
      })
        .then(res => res.json())
        .then(() => {
          setNewDate('');
          setNewTime('');
          // Refresh dates
          return fetch(`http://127.0.0.1:8085/group-dates?group_id=${group.id}`)
            .then(res => res.json())
            .then(setDates);
        });
    }
  };

  // Vote for a date (only if not already voted)
  const handleVote = (event_date_id, available) => {
    if (userVotes[event_date_id] !== undefined) return; // Already voted
    fetch('http://127.0.0.1:8085/vote-date', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_date_id, user_id: user.id, available })
    })
      .then(() => {
        // Refresh dates
        return fetch(`http://127.0.0.1:8085/group-dates?group_id=${group.id}`)
          .then(res => res.json())
          .then(setDates);
      });
  };

  // Delete a proposed date
  const handleDelete = (event_date_id) => {
    fetch('http://127.0.0.1:8085/delete-proposed-date', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_date_id, user_id: user.id })
    })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        // Refresh dates
        return fetch(`http://127.0.0.1:8085/group-dates?group_id=${group.id}`)
          .then(res => res.json())
          .then(setDates);
      })
      .catch(err => alert('Failed to delete date: ' + err.message));
  };

  // Helper to get weekday name
  const getWeekday = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'long' });
  };

  // Helper to generate and download .ics file
  function downloadICS(event) {
    const pad = n => n.toString().padStart(2, '0');
    const dt = event.date + (event.time ? 'T' + event.time.replace(':', '') + '00' : '');
    const dtEnd = event.date + (event.time ? 'T' + (pad(Number(event.time.split(':')[0]) + 1) + event.time.slice(2)).replace(':', '') + '00' : '');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:Letshangout - ${group?.name || 'Event'}`,
      `DTSTART:${dt.replace(/[-:]/g, '')}`,
      `DTEND:${dtEnd.replace(/[-:]/g, '')}`,
      `DESCRIPTION:Confirmed group event via Letshangout` + (event.description ? '\n' + event.description : ''),
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `letshangout-event.ics`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  // Card style
  return (
    <section className="date-voting">
      <h3 style={{marginBottom: '1rem'}}>Step 1: Vote on a Date</h3>
      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center'}}>
        <button
          className={rangeMode ? 'btn-primary' : 'btn-secondary'}
          style={{padding: '8px 16px', borderRadius: 6, fontWeight: 600}}
          onClick={() => setRangeMode(false)}
        >One Day</button>
        <button
          className={rangeMode ? 'btn-secondary' : 'btn-primary'}
          style={{padding: '8px 16px', borderRadius: 6, fontWeight: 600}}
          onClick={() => setRangeMode(true)}
        >Range of Days</button>
        {!rangeMode ? (
          <>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{padding: '8px', borderRadius: 6, border: '1px solid #ccc'}} />
            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={{marginLeft: '0.5rem', padding: '8px', borderRadius: 6, border: '1px solid #ccc'}} />
          </>
        ) : (
          <>
            <input type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)} style={{padding: '8px', borderRadius: 6, border: '1px solid #ccc'}} placeholder="Start Date" />
            <span style={{fontWeight: 600, margin: '0 8px'}}>to</span>
            <input type="date" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} style={{padding: '8px', borderRadius: 6, border: '1px solid #ccc'}} placeholder="End Date" />
            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={{marginLeft: '0.5rem', padding: '8px', borderRadius: 6, border: '1px solid #ccc'}} />
          </>
        )}
        <button className="btn-primary" onClick={handlePropose} disabled={(!rangeMode && (!newDate || !newTime)) || (rangeMode && (!rangeStart || !rangeEnd || rangeEnd < rangeStart))} style={{marginLeft: '0.5rem', padding: '8px 16px', borderRadius: 6, fontWeight: 600}}>Propose Date{rangeMode ? ' Range' : ''}</button>
      </div>
      {loading ? <p>Loading dates...</p> : (
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '1.5rem'}}>
          {(dates || []).map(date => (
            <div key={date.id} style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '1.2rem',
              minWidth: 260,
              maxWidth: 320,
              flex: '1 1 260px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              position: 'relative',
              borderLeft: '6px solid #2196f3'
            }}>
              <div style={{fontWeight: 700, fontSize: '1.1rem', marginBottom: 2}}>
                {!date.end_date ? (
                  <>{date.date} <span style={{color: '#888', fontWeight: 400, marginLeft: 8}}>{getWeekday(date.date)}</span> {date.time && <span style={{marginLeft: 8, color: '#2196f3'}}>{date.time}</span>}</>
                ) : (
                  <>{date.date} to {date.end_date} <span style={{color: '#888', fontWeight: 400, marginLeft: 8}}>{getWeekday(date.date)} - {getWeekday(date.end_date)}</span> {date.time && <span style={{marginLeft: 8, color: '#2196f3'}}>{date.time}</span>}</>
                )}
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <span style={{background: '#eee', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1rem'}}>
                  {date.proposed_by_username ? date.proposed_by_username.charAt(0).toUpperCase() : '?'}
                </span>
                <span style={{fontSize: '0.97rem'}}>{date.proposed_by_username}</span>
              </div>
              <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
                <span style={{background: '#4caf50', color: '#fff', borderRadius: 12, padding: '2px 10px', fontWeight: 600, fontSize: '0.95rem'}}>Available: {date.available_votes}</span>
                <span style={{background: '#f44336', color: '#fff', borderRadius: 12, padding: '2px 10px', fontWeight: 600, fontSize: '0.95rem'}}>Not: {date.not_available_votes}</span>
              </div>
              <div style={{display: 'flex', gap: '0.5rem', marginTop: 8}}>
                {userVotes[date.id] === undefined ? (
                  <>
                    <button className="btn-primary" onClick={() => handleVote(date.id, true)} style={{padding: '6px 12px', borderRadius: 6, fontWeight: 600}}>Available</button>
                    <button className="btn-purple" onClick={() => handleVote(date.id, false)} style={{padding: '6px 12px', borderRadius: 6, fontWeight: 600}}>Not Available</button>
                  </>
                ) : (
                  <span style={{fontWeight: 600, color: userVotes[date.id] ? '#4caf50' : '#f44336'}}>You voted: {userVotes[date.id] ? 'Available' : 'Not Available'}</span>
                )}
                {date.proposed_by === user.id && (
                  <button className="btn-danger" style={{marginLeft: '0.5rem', padding: '6px 12px', borderRadius: 6, fontWeight: 600}} onClick={() => handleDelete(date.id)}>Delete</button>
                )}
                {/* Confirm button for organizer (or anyone) */}
                <button className="btn-primary" style={{marginLeft: 8}} onClick={() => setConfirmedEvent(date)}>Confirm</button>
              </div>
              {/* Show Save to Calendar if confirmed */}
              {confirmedEvent && confirmedEvent.id === date.id && (
                <div style={{marginTop: 12, textAlign: 'center'}}>
                  <button className="btn-primary" onClick={() => downloadICS(date)}>
                    Save to Calendar
                  </button>
                  <div style={{color: '#2a6cff', marginTop: 6, fontWeight: 500}}>Event confirmed!</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Show confirmed event date below cards */}
      {confirmedEvent && (
        <div style={{marginTop: 24, textAlign: 'center', fontWeight: 600, fontSize: '1.1rem', color: '#2a6cff'}}>
          Confirmed Event: {confirmedEvent.date}
          {confirmedEvent.time && (
            <> at {confirmedEvent.time}</>
          )}
        </div>
      )}
    </section>
  );
}

function TaskBoard({ group, user }) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [due, setDue] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('todo');
  const [editTask, setEditTask] = useState(null);
  const [showDelete, setShowDelete] = useState(null);

  useEffect(() => {
    if (group && group.id) {
      fetch(`http://127.0.0.1:8085/group-tasks?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => setTasks(Array.isArray(data) ? data : []));
      fetch(`http://127.0.0.1:8085/group-members?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => setMembers(Array.isArray(data) ? data : []));
    }
  }, [group]);

  const fetchTasks = () => {
    fetch(`http://127.0.0.1:8085/group-tasks?group_id=${group.id}`)
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []));
  };

  const handleAddTask = () => {
    if (!title || !assignee) return;
    fetch('http://127.0.0.1:8085/add-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: group.id,
        title,
        description: desc,
        due_date: due,
        assignee_id: Number(assignee),
        status
      })
    }).then(() => {
      setTitle('');
      setDesc('');
      setDue('');
      setAssignee('');
      setStatus('todo');
      fetchTasks();
    });
  };

  const handleMarkDone = (taskId) => {
    fetch('http://127.0.0.1:8085/complete-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId })
    }).then(fetchTasks);
  };

  const handleEditTask = (task) => {
    setEditTask(task);
  };

  const handleEditSave = () => {
    fetch('http://127.0.0.1:8085/update-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_id: editTask.id,
        title: editTask.title,
        description: editTask.description,
        due_date: editTask.due_date,
        assignee_id: editTask.assignee_id,
        status: editTask.status
      })
    }).then(() => {
      setEditTask(null);
      fetchTasks();
    });
  };

  const handleDeleteTask = (taskId) => {
    fetch('http://127.0.0.1:8085/delete-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId })
    }).then(() => {
      setShowDelete(null);
      fetchTasks();
    });
  };

  const statusColor = s =>
    s === 'done' ? '#d4edda' :
    s === 'in-progress' ? '#fff3cd' :
    '#f8d7da';

  const statusTextColor = s =>
    s === 'done' ? '#155724' :
    s === 'in-progress' ? '#856404' :
    '#721c24';

  const statusGroups = [
    { key: 'todo', label: 'To Do', color: '#2196f3' },
    { key: 'in-progress', label: 'In Progress', color: '#ff9800' },
    { key: 'done', label: 'Done', color: '#4caf50' }
  ];

  // Drag and drop handlers
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    const task = tasks.find(t => t.id.toString() === draggableId);
    if (!task) return;
    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    if (sourceStatus !== destStatus) {
      fetch('http://127.0.0.1:8085/update-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: task.id,
          status: destStatus
        })
      }).then(fetchTasks);
    }
  };

  // Group tasks by status
  const groupedTasks = statusGroups.map(g => tasks.filter(t => t.status === g.key));

  return (
    <section className="task-board">
      <h3>Step 2: Tasks</h3>
      <div style={{marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}>
        <input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
        <input type="date" value={due} onChange={e => setDue(e.target.value)} />
        <select value={assignee} onChange={e => setAssignee(e.target.value)}>
          <option value="">Assignee</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
        </select>
        <button className="btn-primary" onClick={handleAddTask}>Add Task</button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        {statusGroups.map((group) => (
          <div key={group.key} className="task-section">
            <div className="section-header" style={{display: 'flex', alignItems: 'center', margin: '32px 0 8px 0', fontWeight: 700, fontSize: '1.1rem'}}>
              <span style={{width: 8, height: 32, borderRadius: 4, marginRight: 12, background: group.color, display: 'inline-block'}} />
              {group.label}
            </div>
            <Droppable droppableId={group.key}>
              {(provided) => (
                <table className="task-table" style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px'}} ref={provided.innerRef} {...provided.droppableProps}>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Description</th>
                      <th>Due</th>
                      <th>Assignee</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.filter(t => t.status === group.key).length === 0 ? (
                      <tr style={{height: 48, textAlign: 'center'}}>
                        <td colSpan={6} style={{color: '#aaa'}}>No tasks</td>
                      </tr>
                    ) : (
                      tasks.filter(t => t.status === group.key).map((task, tIdx) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={tIdx}>
                          {(provided) => (
                            <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="task-row" style={{
                              background: '#fff',
                              borderRadius: 12,
                              boxShadow: '0 2px 8px rgba(44,100,255,0.06)',
                              transition: 'box-shadow 0.2s, transform 0.1s',
                              textAlign: 'center',
                              ...provided.draggableProps.style
                            }}>
                              <td style={{fontWeight: 600}}>{task.title}</td>
                              <td>{task.description}</td>
                              <td>{task.due_date || '—'}</td>
                              <td>
                                <span className="assignee-tag" style={{
                                  background: '#e3e8fd',
                                  color: '#2a6cff',
                                  borderRadius: 8,
                                  padding: '4px 10px',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}>
                                  {(members.find(m => m.id === task.assignee_id) && members.find(m => m.id === task.assignee_id).picture) && (
                                    <img src={members.find(m => m.id === task.assignee_id).picture} alt="" style={{width: 24, height: 24, borderRadius: '50%', marginRight: 6}} />
                                  )}
                                  {(members.find(m => m.id === task.assignee_id) || {}).username || 'Unassigned'}
                                </span>
                              </td>
                              <td>
                                <span className="status-tag" style={{
                                  background: statusColor(task.status),
                                  color: statusTextColor(task.status),
                                  borderRadius: 8,
                                  padding: '4px 10px',
                                  fontWeight: 600
                                }}>
                                  {group.label}
                                </span>
                              </td>
                              <td>
                                {task.status !== 'done' && (
                                  <button className="btn-primary" style={{padding: '4px 12px', borderRadius: 8, fontSize: '0.95rem', marginRight: 6}} onClick={() => handleMarkDone(task.id)}>Mark as Done</button>
                                )}
                                <button className="btn-primary" style={{padding: '4px 12px', borderRadius: 8, fontSize: '0.95rem', marginRight: 6, background: '#ff9800'}} onClick={() => handleEditTask(task)}>Edit</button>
                                <button className="btn-primary" style={{padding: '4px 12px', borderRadius: 8, fontSize: '0.95rem', background: '#e53935'}} onClick={() => setShowDelete(task.id)}>Delete</button>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </tbody>
                </table>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
      {/* Edit Modal */}
      <Modal isOpen={!!editTask} onRequestClose={() => setEditTask(null)} ariaHideApp={false} style={{content: {maxWidth: 400, margin: 'auto', borderRadius: 12}}}>
        {editTask && (
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <h3>Edit Task</h3>
            <input value={editTask.title} onChange={e => setEditTask({...editTask, title: e.target.value})} />
            <input value={editTask.description} onChange={e => setEditTask({...editTask, description: e.target.value})} />
            <input type="date" value={editTask.due_date} onChange={e => setEditTask({...editTask, due_date: e.target.value})} />
            <select value={editTask.assignee_id} onChange={e => setEditTask({...editTask, assignee_id: e.target.value})}>
              <option value="">Assignee</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
            </select>
            <select value={editTask.status} onChange={e => setEditTask({...editTask, status: e.target.value})}>
              {statusGroups.map(sg => <option key={sg.key} value={sg.key}>{sg.label}</option>)}
            </select>
            <div style={{display: 'flex', gap: 8, marginTop: 8}}>
              <button className="btn-primary" onClick={handleEditSave}>Save</button>
              <button className="btn-primary" style={{background: '#e53935'}} onClick={() => setEditTask(null)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>
      {/* Delete Confirmation */}
      <Modal isOpen={!!showDelete} onRequestClose={() => setShowDelete(null)} ariaHideApp={false} style={{content: {maxWidth: 320, margin: 'auto', borderRadius: 12, textAlign: 'center'}}}>
        <h3>Delete Task?</h3>
        <p>Are you sure you want to delete this task?</p>
        <div style={{display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16}}>
          <button className="btn-primary" style={{background: '#e53935'}} onClick={() => handleDeleteTask(showDelete)}>Delete</button>
          <button className="btn-primary" onClick={() => setShowDelete(null)}>Cancel</button>
        </div>
      </Modal>
    </section>
  );
}

function BudgetPanel({ group, user }) {
  const CATEGORIES = [
    { key: 'food', label: 'Food & Drinks', color: '#ff9800' },
    { key: 'transport', label: 'Transport', color: '#2196f3' },
    { key: 'accommodation', label: 'Accommodation', color: '#4caf50' },
    { key: 'activities', label: 'Activities', color: '#9c27b0' },
    { key: 'misc', label: 'Miscellaneous', color: '#607d8b' }
  ];
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(user ? user.id : '');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [splitWith, setSplitWith] = useState([]);
  const [members, setMembers] = useState([]);
  const [openCategory, setOpenCategory] = useState(null); // for drill-down
  const [showSettlement, setShowSettlement] = useState(false);
  const [newExternalName, setNewExternalName] = useState('');
  const [externalMembers, setExternalMembers] = useState([]);

  // Fetch group members
  useEffect(() => {
    if (group && group.id) {
      fetch(`http://127.0.0.1:8085/group-members?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => setMembers(Array.isArray(data) ? data : []))
        .catch(() => setMembers([]));
    }
  }, [group]);

  // Fetch expenses and balances
  const refresh = () => {
    if (group && group.id) {
      fetch(`http://127.0.0.1:8085/group-expenses?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => {
          console.log('Fetched expenses:', data);
          setExpenses(Array.isArray(data) ? data : []);
          setTimeout(() => console.log('Current expenses state:', expenses), 0);
        })
        .catch(() => setExpenses([]));
      fetch(`http://127.0.0.1:8085/group-balances?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => setBalances(Array.isArray(data) ? data : []))
        .catch(() => setBalances([]));
    }
  };
  useEffect(refresh, [group]);

  const handleAddExpense = () => {
    if (!desc || !amount || !paidBy || splitWith.length === 0) return;
    fetch('http://127.0.0.1:8085/add-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: group.id,
        description: desc,
        amount: Number(amount),
        paid_by: Number(paidBy),
        date,
        category,
        split_with: splitWith.map(Number)
      })
    })
      .then(() => {
        setDesc(''); setAmount(''); setPaidBy(user ? user.id : ''); setDate(''); setCategory(CATEGORIES[0].key); setSplitWith([]);
        refresh();
      });
  };

  // Calculate category totals
  const categoryTotals = CATEGORIES.map(cat => {
    const catExpenses = expenses.filter(e => e.category === cat.key);
    const total = catExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    return { ...cat, total, expenses: catExpenses };
  });

  const handleDeleteExpense = (expenseId) => {
    fetch('http://127.0.0.1:8085/delete-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expense_id: expenseId })
    })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        return res.text();
      })
      .then(() => refresh())
      .catch(err => alert('Failed to delete expense: ' + err.message));
  };

  // Modified settlement calculation to include external members
  function calculateSettlementsWithExternal(balances, externalMembers, expenses) {
    // Build a map of all members (app + external)
    const allMembers = {};
    balances.forEach(b => { allMembers[b.user_id] = { username: b.username, balance: b.balance }; });
    externalMembers.forEach(em => { allMembers[em.id] = { username: em.name, balance: 0 }; });
    // Sum up external members' balances from expenses
    expenses.forEach(exp => {
      if (exp.split_with && Array.isArray(exp.split_with)) {
        exp.split_with.forEach(sw => {
          if (typeof sw === 'string' && sw.startsWith('ext:')) {
            // Find the external member
            const ext = externalMembers.find(em => em.id === sw);
            if (ext) {
              // Calculate their share
              const share = exp.amount / exp.split_with.length;
              allMembers[ext.id].balance -= share;
              // Paid by logic (if external paid, add to their balance)
              if (exp.paid_by === sw) allMembers[ext.id].balance += exp.amount;
            }
          }
        });
        // If paid_by is external
        if (typeof exp.paid_by === 'string' && exp.paid_by.startsWith('ext:')) {
          const ext = externalMembers.find(em => em.id === exp.paid_by);
          if (ext) allMembers[ext.id].balance += exp.amount;
        }
      }
    });
    // Convert to array for settlement
    const allBalances = Object.entries(allMembers).map(([id, v]) => ({ id, username: v.username, balance: v.balance }));
    // Use the same settlement logic
    const creditors = allBalances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
    const debtors = allBalances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
    const settlements = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(-debtor.balance, creditor.balance);
      if (amount > 0.01) {
        settlements.push({ from: debtor.username, to: creditor.username, amount });
        debtor.balance += amount;
        creditor.balance -= amount;
      }
      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }
    return settlements;
  }

  // Add external member via backend
  const handleAddExternalMember = async () => {
    if (!newExternalName.trim()) return;
    const name = newExternalName.trim();
    const res = await fetch('http://127.0.0.1:8085/add-external-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: group.id, name })
    });
    if (res.ok) {
      const member = await res.json();
      setMembers(members => [...members, { id: member.id, username: member.name, is_external: true }]);
      setSplitWith(sw => [...sw, String(member.id)]);
      setNewExternalName('');
    } else {
      alert('Failed to add external member');
    }
  };

  return (
    <section className="budget-panel">
      <h3 style={{marginBottom: '1rem'}}>Step 3: Budget & Settlement</h3>
      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center'}}>
        <input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} style={{padding: '8px', borderRadius: 6, border: '1px solid #ccc'}} />
        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} style={{padding: '8px', borderRadius: 6, border: '1px solid #ccc', width: 100}} />
        <select value={paidBy} onChange={e => setPaidBy(e.target.value)} style={{padding: '8px', borderRadius: 6, border: '1px solid #ccc'}}>
          <option value="">Paid By</option>
          {(members || []).map(m => (
            <option key={m.id} value={String(m.id)}>{m.username}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{padding: '8px', borderRadius: 6, border: '1px solid #ccc'}} />
        <select value={category} onChange={e => setCategory(e.target.value)} style={{padding: '8px', borderRadius: 6, border: '1px solid #ccc', minWidth: 120}}>
          {CATEGORIES.map(cat => (
            <option key={cat.key} value={cat.key}>{cat.label}</option>
          ))}
        </select>
        <div style={{display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 120, maxHeight: 120, overflowY: 'auto', padding: '6px 8px', border: '1px solid #ccc', borderRadius: 6, background: '#fafaff'}}>
          <div style={{fontWeight: 500, marginBottom: 4}}>Split With:</div>
          {(members || []).map(m => (
            <label key={m.id} style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', padding: '2px 0'}}>
              <input
                type="checkbox"
                value={m.id}
                checked={splitWith.includes(String(m.id))}
                onChange={e => {
                  const id = String(m.id);
                  setSplitWith(sw =>
                    e.target.checked ? [...sw, id] : sw.filter(x => x !== id)
                  );
                }}
                style={{width: 18, height: 18, accentColor: '#2a6cff'}}
              />
              {m.username}
              {m.is_external && <span style={{fontSize: '0.95em', color: '#888', marginLeft: 4}}>(external)</span>}
            </label>
          ))}
          {/* Add external member input */}
          <div style={{display: 'flex', gap: 4, marginTop: 10, alignItems: 'center', background: '#f4f8ff', borderRadius: 6, padding: '6px 8px', border: '1.5px solid #b3c6ff', boxShadow: '0 1px 4px #2a6cff11'}}>
            <input
              type="text"
              placeholder="Add external member"
              value={newExternalName}
              onChange={e => setNewExternalName(e.target.value)}
              style={{flex: 1, padding: '8px 12px', borderRadius: 6, border: '1.5px solid #b3c6ff', background: '#fff', fontSize: '1rem', marginRight: 4}}
              onKeyDown={e => { if (e.key === 'Enter') handleAddExternalMember(); }}
            />
            <button
              type="button"
              style={{padding: '8px 16px', borderRadius: 6, background: '#2a6cff', color: '#fff', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 1px 4px #2a6cff22'}}
              onClick={handleAddExternalMember}
            >Add</button>
          </div>
        </div>
        <button className="btn-primary" onClick={handleAddExpense} style={{padding: '8px 16px', borderRadius: 6, fontWeight: 600}}>Add Expense</button>
      </div>
      {/* Category summary cards */}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem'}}>
        {categoryTotals.map(cat => (
          <div key={cat.key} onClick={() => setOpenCategory(openCategory === cat.key ? null : cat.key)}
            style={{
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '1.2rem',
              minWidth: 180,
              maxWidth: 220,
              flex: '1 1 180px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              position: 'relative',
              borderLeft: `6px solid ${cat.color}`,
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
              outline: openCategory === cat.key ? `2px solid ${cat.color}` : 'none',
            }}
          >
            <div style={{fontWeight: 700, fontSize: '1.1rem', marginBottom: 2, color: cat.color}}>{cat.label}</div>
            <div style={{color: '#555', fontSize: '1.05rem'}}>Total: <span style={{fontWeight: 600}}>${cat.total.toFixed(2)}</span></div>
            {openCategory === cat.key && cat.expenses.length > 0 && (
              <div style={{marginTop: 10, borderTop: `1.5px solid ${cat.color}22`, paddingTop: 8}}>
                {cat.expenses.map(exp => (
                  <div key={exp.id} style={{marginBottom: 8, padding: 6, borderRadius: 8, background: '#f7f9fc', position: 'relative', display: 'flex', alignItems: 'center', gap: 8}}>
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: 600, fontSize: '1rem'}}>{exp.description}</div>
                      <div style={{fontSize: '0.97rem', color: '#888'}}>Paid by: {(members.find(m => m.id === exp.paid_by) || {}).username || 'Unknown'}</div>
                      <div style={{fontSize: '0.97rem', color: '#888'}}>Amount: ${exp.amount.toFixed(2)}</div>
                      <div style={{fontSize: '0.93rem', color: '#aaa'}}>Date: {exp.date || '—'}</div>
                    </div>
                    {exp.paid_by === user.id && (
                      <button onClick={() => handleDeleteExpense(exp.id)} style={{background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', marginLeft: 8}}>Delete</button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {openCategory === cat.key && cat.expenses.length === 0 && (
              <div style={{marginTop: 10, color: '#aaa'}}>No expenses in this category.</div>
            )}
          </div>
        ))}
      </div>
      <div style={{marginTop: '2rem'}}>
        <h4>Group Balances</h4>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
          {(balances || []).map(bal => (
            <div key={bal.user_id} style={{background: bal.balance < 0 ? '#f44336' : '#4caf50', color: '#fff', borderRadius: 8, padding: '0.7rem 1.2rem', fontWeight: 600, minWidth: 180}}>
              {bal.username}: {bal.balance < 0 ? 'owes' : 'is owed'} ${Math.abs(bal.balance).toFixed(2)}
            </div>
          ))}
        </div>
        <button className="btn-primary" style={{marginTop: 24}} onClick={() => setShowSettlement(true)}>Settle Up</button>
        <Modal isOpen={showSettlement} onRequestClose={() => setShowSettlement(false)} ariaHideApp={false} style={{content: {maxWidth: 400, margin: 'auto', borderRadius: 12}}}>
          <h3>Settlement Instructions</h3>
          <div style={{margin: '16px 0'}}>
            {balances.length === 0 ? (
              <div>No balances to settle.</div>
            ) : (
              (() => {
                // Use the new settlement function
                const settlements = calculateSettlementsWithExternal(JSON.parse(JSON.stringify(balances)), externalMembers, expenses);
                return settlements.length === 0 ? (
                  <div>Everyone is settled up!</div>
                ) : (
                  <ul style={{paddingLeft: 20}}>
                    {settlements.map((s, idx) => (
                      <li key={idx}>{s.from} pays {s.to} <b>${s.amount.toFixed(2)}</b></li>
                    ))}
                  </ul>
                );
              })()
            )}
          </div>
          <button className="btn-primary" onClick={() => setShowSettlement(false)}>Close</button>
        </Modal>
      </div>
    </section>
  );
}

function Dashboard({ user, group, onLogout }) {
  const [showInvite, setShowInvite] = useState(false);
  const [members, setMembers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar toggle
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  useEffect(() => {
    if (group && group.id) {
      fetch(`http://127.0.0.1:8085/group-members?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => setMembers(Array.isArray(data) ? data : []))
        .catch(() => setMembers([]));
    }
  }, [group]);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const inviteLink = `${window.location.origin}/invite/${group.code}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied!');
  };
  // Responsive: close sidebar on main click (mobile)
  const handleMainClick = () => {
    if (window.innerWidth <= 900 && sidebarOpen) setSidebarOpen(false);
  };
  // Sidebar open/close logic for mobile
  const sidebarClass = sidebarOpen ? 'sidebar open' : 'sidebar';
  return (
    <div className="dashboard">
      <div className="app-bar">
        {/* Remove hamburger and logo from app bar */}
      </div>
      <div className={sidebarClass} style={{zIndex: 999}}>
        {/* Logo always at the top of the sidebar */}
        <img
          src="https://letshangout.s3.us-east-1.amazonaws.com/icons/LHO8-removebg-preview+(1).png"
          alt="Letshangout Logo"
          style={{width: 64, height: 64, borderRadius: '50%', marginTop: 40, marginBottom: 16, cursor: 'pointer', display: 'block', marginLeft: 'auto', marginRight: 'auto'}}
          onClick={() => navigate('/')} 
        />
        <nav>
          <ul>
            <li style={{fontWeight: activeTab === 'dashboard' ? 700 : 400, color: activeTab === 'dashboard' ? '#2a6cff' : undefined, cursor: 'pointer'}} onClick={() => setActiveTab('dashboard')}>Dashboard</li>
            <li style={{fontWeight: activeTab === 'chat' ? 700 : 400, color: activeTab === 'chat' ? '#2a6cff' : undefined, cursor: 'pointer'}} onClick={() => setActiveTab('chat')}>Chat</li>
            <li style={{fontWeight: activeTab === 'budget' ? 700 : 400, color: activeTab === 'budget' ? '#2a6cff' : undefined, cursor: 'pointer'}} onClick={() => setActiveTab('budget')}>Budget</li>
            <li style={{cursor: 'pointer'}} onClick={() => navigate('/profile')}>Profile</li>
          </ul>
        </nav>
        <div style={{marginTop: '2rem'}}>
          <button onClick={onLogout}>Logout</button>
        </div>
        <div style={{marginTop: '2rem'}}>
          <h4>Group Members</h4>
          <ul style={{listStyle: 'none', padding: 0}}>
            {(members || []).map(m => (
              <li key={m.id} style={{display: 'flex', alignItems: 'center', marginBottom: 6}}>
                <span style={{background: '#eee', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1rem', marginRight: 8}}>
                  {m.username ? m.username.charAt(0).toUpperCase() : '?'}
                </span>
                <span>{m.username}</span>
                {group.admin_id === m.id && (
                  <span style={{marginLeft: 8, background: '#2a6cff', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: '0.9em', fontWeight: 600}}>Administrator</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Overlay for sidebar on mobile */}
      {sidebarOpen && window.innerWidth <= 900 && (
        <div onClick={() => setSidebarOpen(false)} style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(44,100,255,0.08)', zIndex: 998}} />
      )}
      <main className="main-content" onClick={handleMainClick}>
        {activeTab === 'dashboard' && (
          <>
            <div style={{marginBottom: '1rem'}}>
              <button className="btn-primary" onClick={() => setShowInvite(!showInvite)}>
                {showInvite ? 'Hide Invite Link' : 'Invite to Group'}
              </button>
              {showInvite && (
                <div style={{marginTop: 10, background: '#f5f5f5', padding: 12, borderRadius: 8}}>
                  <div style={{marginBottom: 8}}><b>Invite Link:</b></div>
                  <input value={inviteLink} readOnly style={{width: '80%', padding: 6, borderRadius: 6, border: '1px solid #ccc'}} />
                  <button className="btn-secondary" onClick={handleCopy} style={{marginLeft: 8}}>Copy</button>
                </div>
              )}
            </div>
            <DateVoting group={group} user={user} />
            <TaskBoard group={group} user={user} />
            <BudgetPanel group={group} user={user} />
          </>
        )}
        {activeTab === 'chat' && (
          <div style={{padding: 32, textAlign: 'center', color: '#888'}}>
            <h2>Group Chat</h2>
            <p>Chat feature coming soon!</p>
          </div>
        )}
        {activeTab === 'budget' && (
          <BudgetPanel group={group} user={user} />
        )}
      </main>
    </div>
  );
}

function InviteJoin({ onLogin, onRegister, onGuest, user, setUser, setUserGroups, setSelectedGroup }) {
  const { groupCode } = useParams();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    if (user && user.id && groupCode) {
      const joinWithUserId = (realUserId) => {
        setJoining(true);
        fetch('http://127.0.0.1:8085/join-group', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: groupCode, user_id: realUserId })
        })
          .then(res => {
            if (!res.ok) return res.text().then(t => { throw new Error(t); });
            return res.json();
          })
          .then(() => {
            fetch(`http://127.0.0.1:8085/my-groups?user_id=${realUserId}`)
              .then(res => res.json())
              .then(groups => {
                setUserGroups(groups);
                const group = (groups || []).find(g => g.code === groupCode);
                setSelectedGroup(group || null);
                navigate('/');
              });
          })
          .catch(e => setError(e.message))
          .finally(() => setJoining(false));
      };
      if (typeof user.id === 'string' && user.isGuest) {
        // Register guest in backend
        fetch('http://127.0.0.1:8085/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.username, password: '' })
        })
          .then(res => {
            if (!res.ok) return res.text().then(t => { throw new Error(t); });
            return res.json();
          })
          .then(newUser => {
            setUser({ ...user, id: newUser.id });
            joinWithUserId(newUser.id);
          })
          .catch(e => setError(e.message));
      } else {
        joinWithUserId(user.id);
      }
    }
  }, [user, groupCode, setUserGroups, setSelectedGroup, navigate]);

  const handleGuest = () => setShowGuestPrompt(true);
  const confirmGuest = () => {
    if (!guestName) return;
    fetch('http://127.0.0.1:8085/guest-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: guestName })
    })
      .then(res => res.json())
      .then(user => {
        setUser({ ...user, guest: true });
        setShowGuestPrompt(false);
        setGuestName('');
      });
  };

  if (!user) {
    return (
      <div className="centered-container">
        <h2>Join Group</h2>
        <p>To join this group, please login, register, or continue as guest.</p>
        {showGuestPrompt ? (
          <div className="login-container">
            <h2>Continue as Guest</h2>
            <input placeholder="Your Name" value={guestName} onChange={e => setGuestName(e.target.value)} />
            <button className="btn-primary" onClick={confirmGuest} disabled={!guestName}>Continue</button>
            <button style={{marginTop: '10px'}} onClick={() => setShowGuestPrompt(false)}>Back</button>
          </div>
        ) : (
          <Login onLogin={onLogin} onSwitchToRegister={() => {}} onGuest={handleGuest} />
        )}
      </div>
    );
  }
  if (joining) return <div className="centered-container"><p>Joining group...</p></div>;
  if (error) return <div className="centered-container"><p style={{color:'red'}}>{error}</p></div>;
  return <div className="centered-container"><p>Redirecting...</p></div>;
}

function ProfileSettings({ user, setUser }) {
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [picture, setPicture] = useState(user?.picture || '');
  const [preview, setPreview] = useState(user?.picture || '');
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradePassword, setUpgradePassword] = useState('');
  const [upgradeError, setUpgradeError] = useState('');
  const navigate = useNavigate();
  if (!user) return <div style={{padding: 32, textAlign: 'center'}}>Loading...</div>;

  const handlePictureChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setPicture(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let pictureUrl = user.picture;
    if (picture && picture instanceof File) {
      // Simulate upload, replace with real upload logic if needed
      pictureUrl = preview;
    }
    const updated = { ...user, username, phone, picture: pictureUrl };
    // Call backend to update user profile
    await fetch('http://127.0.0.1:8085/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setUser(updated);
    setSaving(false);
    navigate(-1); // Go back
  };

  const handleUpgrade = async () => {
    setSaving(true);
    setUpgradeError('');
    const res = await fetch('http://127.0.0.1:8085/upgrade-guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, username, password: upgradePassword })
    });
    if (res.ok) {
      const upgraded = await res.json();
      setUser({ ...upgraded, guest: false });
      setShowUpgrade(false);
      setUpgradePassword('');
      navigate(-1);
    } else {
      setUpgradeError('Upgrade failed. Try a different username or password.');
    }
    setSaving(false);
  };

  return (
    <div className="profile-settings-page" style={{maxWidth: 420, margin: '3.5rem auto 0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(44,100,255,0.08)', padding: '2.5rem 2rem'}}>
      <h2 style={{textAlign: 'center', color: '#2a6cff', marginBottom: 24}}>Profile Settings</h2>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <label htmlFor="profile-pic-input" style={{cursor: 'pointer'}}>
          <img src={preview || '/logo192.png'} alt="Profile" style={{width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px #2a6cff22', marginBottom: 8}} />
          <input id="profile-pic-input" type="file" accept="image/*" style={{display: 'none'}} onChange={handlePictureChange} />
        </label>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={{padding: '12px', borderRadius: 8, border: '1.5px solid #cfd8ff', width: '100%', fontSize: '1.1rem'}} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number for PayNow (optional)" style={{padding: '12px', borderRadius: 8, border: '1.5px solid #cfd8ff', width: '100%', fontSize: '1.1rem'}} />
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{marginTop: 18, width: '100%'}}>{saving ? 'Saving...' : 'Save Changes'}</button>
        {user.guest && !showUpgrade && (
          <button className="btn-secondary" style={{marginTop: 18, width: '100%'}} onClick={() => setShowUpgrade(true)}>Upgrade to Account</button>
        )}
        {showUpgrade && (
          <div style={{width: '100%', marginTop: 12}}>
            <input type="password" value={upgradePassword} onChange={e => setUpgradePassword(e.target.value)} placeholder="Set a password" style={{padding: '12px', borderRadius: 8, border: '1.5px solid #cfd8ff', width: '100%', fontSize: '1.1rem', marginBottom: 8}} />
            <button className="btn-primary" onClick={handleUpgrade} disabled={saving || !upgradePassword} style={{width: '100%'}}>{saving ? 'Signing Up...' : 'Sign Up'}</button>
            {upgradeError && <div style={{color: '#f44336', marginTop: 8}}>{upgradeError}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [messages, setMessages] = useState([]);
  const [todos, setTodos] = useState([]);
  const [groupMembers, setGroupMembers] = useState([user ? user.username : '']);
  const [groupList, setGroupList] = useState(['demo']); // Replace with real group list from backend
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    const backendUrl = 'http://127.0.0.1:8085/api';
    setLoading(true);
    fetch(backendUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user && user.id) {
      fetch(`http://127.0.0.1:8085/my-groups?user_id=${user.id}`)
        .then(res => res.json())
        .then(groups => setUserGroups(groups))
        .catch(() => setUserGroups([]));
    }
  }, [user]);

  const handleLogin = (username, password) => {
    fetch('http://127.0.0.1:8085/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
      })
      .then(user => {
        setUser(user);
      })
      .catch(error => {
        alert('Login failed: ' + error.message);
      });
  };
  const handleRegister = (username, password) => {
    fetch('http://127.0.0.1:8085/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
      })
      .then(user => {
        setUser(user);
      })
      .catch(error => {
        alert('Registration failed: ' + error.message);
      });
  };

  const handleCreateGroup = (groupName) => {
    if (!user || !user.id) {
      alert('You must be logged in to create a group.');
      return;
    }
    fetch('http://127.0.0.1:8085/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: groupName,
        user_id: user.id,
        username: user.guest ? user.username : undefined,
        guest: user.guest ? true : undefined
      })
    })
      .then(async response => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
        // Try to parse JSON, fallback to error if not JSON
        try {
          return await response.json();
        } catch {
          throw new Error('Unexpected response from server.');
        }
      })
      .then(group => {
        setGroup(group);
        alert('Group created! Your group code is: ' + group.code);
      })
      .catch(error => {
        alert('Group creation failed: ' + error.message);
      });
  };

  const handleJoinGroup = (groupCode) => {
    if (!user || !user.id) {
      alert('You must be logged in to join a group.');
      return;
    }
    fetch('http://127.0.0.1:8085/join-group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: groupCode, user_id: user.id })
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
      })
      .then(data => {
        setGroup({ code: groupCode });
        alert('Successfully joined group!');
      })
      .catch(error => {
        alert('Join group failed: ' + error.message);
      });
  };

  const handleSendMessage = (text) => {
    setMessages([...messages, { user: user ? user.username : '', text }]);
  };
  const handleAddTodo = (task, date, assignee) => {
    setTodos([...todos, { task, date, assignee, completed: false }]);
    if (assignee && !groupMembers.includes(assignee)) {
      setGroupMembers([...groupMembers, assignee]);
    }
  };
  const handleCompleteTodo = (idx) => {
    setTodos(todos.map((todo, i) => i === idx ? { ...todo, completed: true } : todo));
  };

  const handleGuest = () => {
    setShowGuestPrompt(true);
  };
  const confirmGuest = () => {
    if (!guestName) return;
    fetch('http://127.0.0.1:8085/guest-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: guestName })
    })
      .then(res => res.json())
      .then(user => {
        setUser({ ...user, guest: true });
        setShowGuestPrompt(false);
        setGuestName('');
      });
  };

  return (
    <Router>
      <Routes>
        <Route path="/invite/:groupCode" element={
          <InviteJoin
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGuest={handleGuest}
            user={user}
            setUser={setUser}
            setUserGroups={setUserGroups}
            setSelectedGroup={setSelectedGroup}
          />
        } />
        <Route path="/profile" element={
          <ProfileSettings user={user} setUser={setUser} />
        } />
        <Route path="/*" element={
          <div className="App">
            <header className="App-header">
              {!user ? (
                <div className="centered-container">
                  {showGuestPrompt ? (
                    <div className="login-container">
                      <h2>Continue as Guest</h2>
                      <input placeholder="Your Name" value={guestName} onChange={e => setGuestName(e.target.value)} />
                      <button className="btn-primary" onClick={confirmGuest} disabled={!guestName}>Continue</button>
                      <button style={{marginTop: '10px'}} onClick={() => setShowGuestPrompt(false)}>Back</button>
                    </div>
                  ) : showRegister ? (
                    <Register onRegister={handleRegister} onSwitchToLogin={() => setShowRegister(false)} />
                  ) : (
                    <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} onGuest={handleGuest} />
                  )}
                </div>
              ) : !selectedGroup ? (
                <div className="centered-container">
                  <h2>Welcome, {user ? user.username : ''}!</h2>
                  <h3>Your Groups:</h3>
                  <ul style={{listStyle: 'none', padding: 0}}>
                    {(userGroups || []).map(g => (
                      <li key={g.id} style={{marginBottom: '1rem'}}>
                        <button className="btn-primary" onClick={() => setSelectedGroup(g)}>
                          {g.name} (Code: {g.code})
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setShowJoin(false)}>Create Group</button>
                  <button onClick={() => setShowJoin(true)}>Join Group</button>
                  {showJoin ? (
                    <JoinGroup onJoin={handleJoinGroup} groupList={[]} />
                  ) : (
                    <CreateGroup onCreate={handleCreateGroup} />
                  )}
                </div>
              ) : (
                <Dashboard user={user} group={selectedGroup} onLogout={() => { setUser(null); setSelectedGroup(null); }} />
              )}
            </header>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;

