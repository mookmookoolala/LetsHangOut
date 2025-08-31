import React, { useState } from 'react';

export function TodoList({ todos, onAdd, onComplete, onAssign, users }) {
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