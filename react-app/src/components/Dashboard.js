import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { DateVoting } from './DateVoting';
import { TaskBoard } from './TaskBoard';
import { BudgetPanel } from './BudgetPanel';
import { Chat } from './Chat';
import {
  Container, Paper, Grid, Typography, Button, Select, MenuItem, FormControl, Divider, useMediaQuery, InputLabel, TextField
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

export function Dashboard({ user, group, onLogout, onDeleteGroup, userGroups = [], onSelectGroup }) {
  const [members, setMembers] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (group && group.id) {
      fetch(`${API_URL}/group-members?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => setMembers(Array.isArray(data) ? data : []))
        .catch(() => setMembers([]));
    }
  }, [group]);

  // Only construct inviteLink if group and group.code exist
  const inviteLink = group && group.code ? `${window.location.origin}/invite/${group.code}` : '';
  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          alert('Invite link copied!');
        })
        .catch(() => alert('Failed to copy invite link.'));
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = inviteLink;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        alert('Invite link copied!');
      } catch (err) {
        alert('Failed to copy invite link.');
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <DashboardLayout members={members} onLogout={onLogout}>
      {!group || !group.id ? (
        <Container maxWidth="sm" sx={{ py: 6 }}>
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3, background: theme.palette.background.paper }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>No group selected</Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>Please select a group to view the dashboard.</Typography>
          </Paper>
        </Container>
      ) : (
        <Container maxWidth="md" sx={{ py: isMobile ? 2 : 6 }}>
          <Grid container spacing={isMobile ? 2 : 4} direction="column">
            {/* Group Picker */}
            {userGroups.length > 1 && (
              <Grid item>
                <Paper elevation={1} sx={{ p: isMobile ? 2 : 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: isMobile ? 'wrap' : 'nowrap', background: theme.palette.background.paper }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 16, color: 'primary.main', mr: 2 }}>Group:</Typography>
                  <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
                    <InputLabel>Group</InputLabel>
                    <Select
                      value={group.id}
                      label="Group"
                      onChange={e => {
                        const selected = userGroups.find(g => String(g.id) === e.target.value);
                        if (selected && onSelectGroup) onSelectGroup(selected);
                      }}
                    >
                      {userGroups.map(g => (
                        <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 'auto', fontWeight: 700, borderRadius: 2, minWidth: isMobile ? 120 : 100 }}
                    onClick={handleCopy}
                  >
                    Copy Invite Link
                  </Button>
                </Paper>
              </Grid>
            )}
            {/* Invite People Section */}
            <Grid item>
              <Paper elevation={1} sx={{ p: isMobile ? 2 : 3, borderRadius: 3, background: theme.palette.background.paper }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2, textAlign: isMobile ? 'center' : 'left' }}>
                  Invite People
                </Typography>
                <Grid container spacing={2} direction={isMobile ? 'column' : 'row'} alignItems="center">
                  <Grid item xs={12} sm={9}>
                    <TextField
                      value={inviteLink}
                      label="Invite Link"
                      fullWidth
                      InputProps={{ readOnly: true }}
                      size="small"
                      sx={{ color: theme.palette.text.primary }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth={isMobile}
                      sx={{ fontWeight: 600, borderRadius: 2, minHeight: 44 }}
                      onClick={handleCopy}
                    >
                      Copy Link
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Divider sx={{ my: isMobile ? 2 : 4 }} />
            {/* Main Dashboard Cards */}
            <Grid item>
              <Grid container spacing={isMobile ? 2 : 4}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: isMobile ? 2 : 3, borderRadius: 3, mb: isMobile ? 2 : 0, background: theme.palette.background.paper }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Date Voting</Typography>
                    <DateVoting user={user} group={group} />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: isMobile ? 2 : 3, borderRadius: 3, mb: isMobile ? 2 : 0, background: theme.palette.background.paper }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Tasks</Typography>
                    <TaskBoard user={user} group={group} />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: isMobile ? 2 : 3, borderRadius: 3, mb: isMobile ? 2 : 0, background: theme.palette.background.paper }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Budget</Typography>
                    <BudgetPanel user={user} group={group} />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: isMobile ? 2 : 3, borderRadius: 3, mb: isMobile ? 2 : 0, background: theme.palette.background.paper }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Group Chat</Typography>
                    <Chat user={user} group={group} />
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      )}
    </DashboardLayout>
  );
} 