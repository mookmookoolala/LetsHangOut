import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Box
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

export function PendingInvites({ open, onClose, userId, onAcceptInvite }) {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingInvite, setProcessingInvite] = useState(null);

  useEffect(() => {
    if (open && userId) {
      fetchInvites();
    }
  }, [open, userId]);

  const fetchInvites = () => {
    setLoading(true);
    setError('');

    fetch(`${API_URL}/pending-invites?user_id=${userId}`)
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
      })
      .then(data => {
        setInvites(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        setError(`Failed to fetch invites: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRespondToInvite = (inviteId, accept) => {
    setProcessingInvite(inviteId);
    setError('');

    fetch(`${API_URL}/respond-to-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invite_id: inviteId,
        user_id: userId,
        accept: accept
      })
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
      })
      .then(data => {
        // Remove the invite from the list
        setInvites(invites.filter(invite => invite.id !== inviteId));
        
        // If accepted, notify parent component
        if (accept && data.group_id) {
          onAcceptInvite(data.group_id);
        }
      })
      .catch(error => {
        setError(`Failed to respond to invite: ${error.message}`);
      })
      .finally(() => {
        setProcessingInvite(null);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#f7f9fc', color: '#1a237e', fontWeight: 700 }}>
        Pending Group Invitations
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : invites.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
            You don't have any pending invitations.
          </Typography>
        ) : (
          <List>
            {invites.map((invite, index) => (
              <React.Fragment key={invite.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={<Typography variant="subtitle1" fontWeight="bold">{invite.group_name}</Typography>}
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span" color="text.primary">
                          Invited by: {invite.inviter_username}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span" color="text.secondary">
                          {new Date(invite.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          })}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={processingInvite === invite.id}
                      onClick={() => handleRespondToInvite(invite.id, true)}
                      sx={{
                        background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                        color: '#fff',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #6c47ff 0%, #2a6cff 100%)',
                        },
                      }}
                    >
                      {processingInvite === invite.id ? <CircularProgress size={20} color="inherit" /> : 'Accept'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={processingInvite === invite.id}
                      onClick={() => handleRespondToInvite(invite.id, false)}
                      sx={{
                        borderColor: '#ff5252',
                        color: '#ff5252',
                        '&:hover': {
                          borderColor: '#ff1744',
                          backgroundColor: 'rgba(255, 23, 68, 0.04)',
                        },
                      }}
                    >
                      Decline
                    </Button>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}