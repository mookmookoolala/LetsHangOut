import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { DateVoting } from './DateVoting';
import { TaskBoard } from './TaskBoard';
import { BudgetPanel } from './BudgetPanel';
import { Chat } from './Chat';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TextField, 
  Button,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

export function Dashboard({ user, group, onLogout, onDeleteGroup, userGroups = [], onSelectGroup }) {
  const [showInvite, setShowInvite] = useState(false);
  const [members, setMembers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeTab, setActiveTab] = useState('dashboard');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  useEffect(() => {
    if (group && group.id) {
      fetch(`${API_URL}/group-members?group_id=${group.id}`)
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
  
  const inviteLink = group && group.code ? `${window.location.origin}/invite/${group.code}` : '';
  
  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          alert('Invite link copied!');
        })
        .catch(() => alert('Failed to copy invite link.'));
    } else {
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
  
  const handleMainClick = () => {
    if (window.innerWidth <= 900 && sidebarOpen) setSidebarOpen(false);
  };
  
  return (
    <DashboardLayout members={members} onLogout={onLogout}>
      {!group || !group.id ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 700, mb: 2 }}>
            No group selected
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Please select a group to view the dashboard.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Group Picker */}
          {userGroups.length > 1 && (
            <Card sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                  Group:
                </Typography>
                <FormControl sx={{ minWidth: 200 }}>
                  <Select
                    value={group.id}
                    onChange={e => {
                      const selected = userGroups.find(g => String(g.id) === e.target.value);
                      if (selected && onSelectGroup) onSelectGroup(selected);
                    }}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    {userGroups.map(g => (
                      <MenuItem key={g.id} value={g.id}>{g.name || g.code}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {group.name || group.code}
                </Typography>
              </Box>
            </Card>
          )}
          
          {/* Invite People Section */}
          <Card sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
              Invite People
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                value={inviteLink}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ 
                  flex: 1, 
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': { borderRadius: 2 }
                }}
              />
              <Button
                variant="contained"
                startIcon={<CopyIcon />}
                onClick={handleCopy}
                sx={{
                  background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #6c47ff 0%, #2a6cff 100%)',
                  },
                }}
              >
                Copy Link
              </Button>
            </Box>
          </Card>
          
          <Grid container spacing={3} alignItems="stretch">
            {/* Date Voting Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, minHeight: 420, maxWidth: 650, mx: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', mb: 3 }}>
                  Date Voting
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <DateVoting user={user} group={group} />
                </Box>
              </Card>
            </Grid>
            
            {/* Task Board Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, minHeight: 420, maxWidth: 650, mx: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', mb: 3 }}>
                  Tasks
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <TaskBoard user={user} group={group} />
                </Box>
              </Card>
            </Grid>
            
            {/* Budget Panel Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, minHeight: 420, maxWidth: 650, mx: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', mb: 3 }}>
                  Budget
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <BudgetPanel user={user} group={group} />
                </Box>
              </Card>
            </Grid>
            
            {/* Chat Card */}
            <Grid item xs={12} md={6}>
              <Box sx={{ minHeight: 420, maxWidth: 650, mx: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Chat user={user} group={group} />
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </DashboardLayout>
  );
} 