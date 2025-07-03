import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function Login({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="login-container">
      <h2>Login</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={() => onLogin(username, password)}>Login</button>
      <button className="btn-purple" style={{marginTop: '10px'}} onClick={onSwitchToRegister}>Don't have an account? Register</button>
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

  // Fetch proposed dates for the group
  useEffect(() => {
    if (group && group.id) {
      setLoading(true);
      fetch(`http://127.0.0.1:8080/group-dates?group_id=${group.id}`)
        .then(res => res.json())
        .then(setDates)
        .catch(() => setDates([]))
        .finally(() => setLoading(false));
    }
  }, [group]);

  // Propose a new date
  const handlePropose = () => {
    if (!newDate || !newTime) return;
    fetch('http://127.0.0.1:8080/propose-date', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: group.id, date: newDate, time: newTime, proposed_by: user.id })
    })
      .then(res => res.json())
      .then(() => {
        setNewDate('');
        setNewTime('');
        // Refresh dates
        return fetch(`http://127.0.0.1:8080/group-dates?group_id=${group.id}`)
          .then(res => res.json())
          .then(setDates);
      });
  };

  // Vote for a date
  const handleVote = (event_date_id, available) => {
    fetch('http://127.0.0.1:8080/vote-date', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_date_id, user_id: user.id, available })
    })
      .then(() => {
        // Refresh dates
        return fetch(`http://127.0.0.1:8080/group-dates?group_id=${group.id}`)
          .then(res => res.json())
          .then(setDates);
      });
  };

  // Helper to get weekday name
  const getWeekday = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'long' });
  };

  return (
    <section className="date-voting">
      <h3>Step 1: Vote on a Date</h3>
      <div style={{marginBottom: '1rem'}}>
        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
        <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={{marginLeft: '0.5rem'}} />
        <button className="btn-primary" onClick={handlePropose} disabled={!newDate || !newTime}>Propose Date & Time</button>
      </div>
      {loading ? <p>Loading dates...</p> : (
        <table style={{width: '100%', background: '#fff', borderCollapse: 'collapse'}}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Time</th>
              <th>Proposed By</th>
              <th>Available</th>
              <th>Not Available</th>
              <th>Your Vote</th>
            </tr>
          </thead>
          <tbody>
            {(dates || []).map(date => (
              <tr key={date.id}>
                <td>{date.date}</td>
                <td>{getWeekday(date.date)}</td>
                <td>{date.time}</td>
                <td>{date.proposed_by_username}</td>
                <td>{date.available_votes}</td>
                <td>{date.not_available_votes}</td>
                <td>
                  <button className="btn-primary" onClick={() => handleVote(date.id, true)}>Available</button>
                  <button className="btn-purple" onClick={() => handleVote(date.id, false)} style={{marginLeft: '0.5rem'}}>Not Available</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function Dashboard({ user, group, onLogout }) {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Letshangout</h2>
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>Chat</li>
            <li>Budget</li>
          </ul>
        </nav>
        <div style={{marginTop: '2rem'}}>
          <button onClick={onLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <DateVoting group={group} user={user} />
        <section className="task-board">
          <h3>Step 2: Tasks</h3>
          <p>Task list/kanban coming soon...</p>
        </section>
        <section className="budget-panel">
          <h3>Step 3: Budget & Settlement</h3>
          <p>Budget/settlement UI coming soon...</p>
        </section>
      </main>
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

  useEffect(() => {
    const backendUrl = 'http://127.0.0.1:8080/api';
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
      fetch(`http://127.0.0.1:8080/my-groups?user_id=${user.id}`)
        .then(res => res.json())
        .then(groups => setUserGroups(groups))
        .catch(() => setUserGroups([]));
    }
  }, [user]);

  const handleLogin = (username, password) => {
    fetch('http://127.0.0.1:8080/login', {
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
    fetch('http://127.0.0.1:8080/register', {
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
    fetch('http://127.0.0.1:8080/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: groupName, user_id: user.id })
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
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
    fetch('http://127.0.0.1:8080/join-group', {
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

  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{marginBottom: '2rem'}}>Welcome to Letshangout!</h1>
        {!user ? (
          <div className="centered-container">
            {showRegister ? (
              <Register onRegister={handleRegister} onSwitchToLogin={() => setShowRegister(false)} />
            ) : (
              <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />
            )}
          </div>
        ) : !selectedGroup ? (
          <div className="centered-container">
            <h2>Welcome, {user ? user.username : ''}!</h2>
            <h3>Your Groups:</h3>
            <ul style={{listStyle: 'none', padding: 0}}>
              {userGroups.map(g => (
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
        <div>
          <h3>Hello, {user ? user.username : ''}!</h3>
          {selectedGroup && (
            <div>
              <p>Group Name: {selectedGroup.name}</p>
              <p>Group Code: {selectedGroup.code}</p>
            </div>
          )}
        </div>
        <div className="api-response">
          <h2>API Response:</h2>
          {loading ? (
            <p>Loading data from backend...</p>
          ) : error ? (
            <div className="error-message">
              <p>Error connecting to backend: {error}</p>
              <p>Make sure the Go backend is running on port 8080</p>
            </div>
          ) : (
            <pre>{JSON.stringify(data, null, 2)}</pre>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;

