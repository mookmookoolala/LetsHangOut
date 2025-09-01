import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

export function TaskBoard({ group, user }) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [due, setDue] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('todo');
  const [editTask, setEditTask] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [commentTask, setCommentTask] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (group && group.id) {
      fetch(`${API_URL}/group-tasks?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => setTasks(Array.isArray(data) ? data : []));
      fetch(`${API_URL}/group-members?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => setMembers(Array.isArray(data) ? data : []));
    }
  }, [group]);

  const fetchTasks = () => {
    fetch(`${API_URL}/group-tasks?group_id=${group.id}`)
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []));
  };

  const handleAddTask = () => {
    if (!title || !assignee) return;
    fetch(`${API_URL}/add-task`, {
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
    fetch(`${API_URL}/complete-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId })
    }).then(fetchTasks);
  };

  const handleEditTask = (task) => {
    setEditTask(task);
  };

  const handleEditSave = () => {
    fetch(`${API_URL}/update-task`, {
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
    fetch(`${API_URL}/delete-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId })
    }).then(() => {
      setShowDelete(null);
      fetchTasks();
    });
  };

  const handleOpenComments = (task) => {
    setCommentTask(task);
    setNewComment('');
  };

  const handleCloseComments = () => {
    setCommentTask(null);
    setNewComment('');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const now = new Date();
    setComments(prev => ({
      ...prev,
      [commentTask.id]: [
        ...(prev[commentTask.id] || []),
        { user: user.username, text: newComment, time: now.toLocaleString() }
      ]
    }));
    setNewComment('');
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

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    const task = tasks.find(t => t.id.toString() === draggableId);
    if (!task) return;
    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    if (sourceStatus !== destStatus) {
      fetch(`${API_URL}/update-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: task.id,
          status: destStatus
        })
      }).then(fetchTasks);
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 650,
        margin: '0 auto',
        mb: 4,
        borderRadius: { xs: 3, sm: 4 },
        boxShadow: 6,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: { xs: 1, sm: 2 },
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            height: 80,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            background: 'linear-gradient(90deg, #1976d2 0%, #6c47ff 100%)',
            display: 'flex',
            alignItems: 'center',
            px: 4,
            mb: 3,
            boxShadow: 3,
          }}
        >
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, letterSpacing: 1 }}>
            Step 2: Tasks
          </Typography>
        </Box>
        <div style={{marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}>
          <input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
          <input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
          <input type="date" value={due} onChange={e => setDue(e.target.value)} />
          <select value={assignee} onChange={e => setAssignee(e.target.value)}>
            <option value="">Assignee</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
          </select>
          <Button className="btn-primary" onClick={handleAddTask}>Add Task</Button>
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
                                    <Button
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      sx={{
                                        borderRadius: 2,
                                        fontWeight: 700,
                                        px: 2,
                                        py: 1,
                                        boxShadow: 2,
                                        background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                                        textTransform: 'none',
                                        fontSize: isMobile ? '1rem' : '1.08rem',
                                        mr: 1,
                                      }}
                                      onClick={() => handleMarkDone(task.id)}
                                    >
                                      Mark as Done
                                    </Button>
                                  )}
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    sx={{
                                      borderRadius: 2,
                                      fontWeight: 700,
                                      px: 2,
                                      py: 1,
                                      boxShadow: 2,
                                      background: 'linear-gradient(90deg, #ff9800 0%, #ff6b00 100%)',
                                      textTransform: 'none',
                                      fontSize: isMobile ? '1rem' : '1.08rem',
                                      mr: 1,
                                    }}
                                    onClick={() => handleEditTask(task)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    sx={{
                                      borderRadius: 2,
                                      fontWeight: 700,
                                      px: 2,
                                      py: 1,
                                      boxShadow: 2,
                                      background: 'linear-gradient(90deg, #e53935 0%, #c51162 100%)',
                                      textTransform: 'none',
                                      fontSize: isMobile ? '1rem' : '1.08rem',
                                    }}
                                    onClick={() => setShowDelete(task.id)}
                                  >
                                    Delete
                                  </Button>
                                  <Button
                                    variant="contained"
                                    color="info"
                                    size="small"
                                    sx={{
                                      borderRadius: 2,
                                      fontWeight: 700,
                                      px: 2,
                                      py: 1,
                                      boxShadow: 2,
                                      background: 'linear-gradient(90deg, #42a5f5 0%, #6c47ff 100%)',
                                      textTransform: 'none',
                                      fontSize: isMobile ? '1rem' : '1.08rem',
                                      mr: 1,
                                    }}
                                    onClick={() => handleOpenComments(task)}
                                  >
                                    Comment
                                  </Button>
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
                <Button className="btn-primary" onClick={handleEditSave} sx={{ minHeight: { xs: 44, sm: 36 } }}>Save</Button>
                <Button className="btn-primary" style={{background: '#e53935'}} onClick={() => setEditTask(null)} sx={{ minHeight: { xs: 44, sm: 36 } }}>Cancel</Button>
              </div>
            </div>
          )}
        </Modal>
        <Modal isOpen={!!showDelete} onRequestClose={() => setShowDelete(null)} ariaHideApp={false} style={{content: {maxWidth: 320, margin: 'auto', borderRadius: 12, textAlign: 'center'}}}>
          <h3>Delete Task?</h3>
          <p>Are you sure you want to delete this task?</p>
          <div style={{display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16}}>
            <Button className="btn-primary" style={{background: '#e53935'}} onClick={() => handleDeleteTask(showDelete)}>Delete</Button>
            <Button className="btn-primary" onClick={() => setShowDelete(null)}>Cancel</Button>
          </div>
        </Modal>
        <Dialog open={!!commentTask} onClose={handleCloseComments} maxWidth="sm" fullWidth>
          <DialogTitle>Comments for: {commentTask?.title}</DialogTitle>
          <DialogContent dividers>
            {(comments[commentTask?.id] || []).length === 0 ? (
              <Typography color="text.secondary">No comments yet.</Typography>
            ) : (
              (comments[commentTask?.id] || []).map((c, idx) => (
                <Box key={idx} sx={{ mb: 2, p: 1.2, borderRadius: 2, background: '#f7f9fc', boxShadow: 1 }}>
                  <Typography sx={{ fontWeight: 700, color: '#2a6cff' }}>{c.user}</Typography>
                  <Typography sx={{ fontSize: '0.98rem', color: '#222' }}>{c.text}</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#888', mt: 0.5 }}>{c.time}</Typography>
                </Box>
              ))
            )}
            <TextField
              label="Add a comment"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mt: 2, '& .MuiInputBase-input': { fontSize: { xs: '1rem', sm: '0.95rem' } } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseComments} sx={{ minHeight: { xs: 44, sm: 36 } }}>Close</Button>
            <Button onClick={handleAddComment} variant="contained" disabled={!newComment.trim()} sx={{ minHeight: { xs: 44, sm: 36 } }}>Add Comment</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
} 