import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Typography,
  Box,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

export function ManageUsersDialog({ open, onClose, group }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');

  const fetchMembers = useCallback(() => {
    setLoading(true);
    fetch(`${API_URL}/group-members?group_id=${group.id}`)
      .then(res => res.json())
      .then(data => {
        setMembers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching members:', err);
        setError('Failed to load group members');
        setLoading(false);
      });
  }, [group]);

  useEffect(() => {
    if (open && group && group.id) {
      fetchMembers();
    }
  }, [open, group, fetchMembers]);

  const handleRemoveUser = (userId) => {
    setLoading(true);
    fetch(`${API_URL}/leave-group`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: group.id,
        user_id: userId
      })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to remove user');
        }
        return res.json();
      })
      .then(() => {
        fetchMembers();
        setLoading(false);
      })
      .catch(err => {
        console.error('Error removing user:', err);
        setError('Failed to remove user from group');
        setLoading(false);
      });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUsername(user.username);
  };

  const handleSaveUsername = () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    setLoading(true);
    fetch(`${API_URL}/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: editingUser.id,
        username: newUsername
      })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to update username');
        }
        return res.json();
      })
      .then(() => {
        fetchMembers();
        setEditingUser(null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error updating username:', err);
        setError('Failed to update username');
        setLoading(false);
      });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setError('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Manage Group Members
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Box mb={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        {loading ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {members.map((member) => (
              <React.Fragment key={member.id}>
                <ListItem>
                  {editingUser && editingUser.id === member.id ? (
                    <Box display="flex" width="100%" alignItems="center">
                      <TextField
                        fullWidth
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        label="New Username"
                        variant="outlined"
                        size="small"
                      />
                      <Box ml={1}>
                        <IconButton onClick={handleSaveUsername} color="primary">
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={handleCancelEdit} color="default">
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <ListItemText
                        primary={member.username}
                        secondary={member.is_admin ? 'Admin' : 'Member'}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleEditUser(member)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleRemoveUser(member.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </>
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}