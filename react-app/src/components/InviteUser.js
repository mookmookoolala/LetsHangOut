import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';

import { API_URL } from '../config';

export function InviteUser({ open, onClose, group, userId, onInviteSent }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [noGroupSelected, setNoGroupSelected] = useState(false);
  
  useEffect(() => {
    if (!group || !group.id) {
      setNoGroupSelected(true);
    } else {
      setNoGroupSelected(false);
    }
  }, [group]);

  const handleInvite = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (!group || !group.id) {
      setError('No group selected. Please select a group first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    fetch(`${API_URL}/invite-to-group`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: group.id,
        inviter_id: userId,
        username: username.trim()
      })
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
      })
      .then(data => {
        setSuccess('Invitation sent successfully!');
        setUsername('');
        if (onInviteSent) onInviteSent();
        setTimeout(() => {
          setSuccess('');
          onClose();
        }, 2000);
      })
      .catch(error => {
        setError(`Failed to send invitation: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#f7f9fc', color: '#1a237e', fontWeight: 700 }}>
        Invite User to Group
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 2 }}>
        {noGroupSelected ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You need to select a group before inviting users.
          </Alert>
        ) : (
          <Typography variant="body1" sx={{ mb: 2 }}>
            Enter the username of the person you want to invite to this group.
          </Typography>
        )}
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          disabled={loading || noGroupSelected}
        />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleInvite}
          variant="contained"
          disabled={loading || !username.trim() || noGroupSelected}
          sx={{
            background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(90deg, #6c47ff 0%, #2a6cff 100%)',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Invite'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}