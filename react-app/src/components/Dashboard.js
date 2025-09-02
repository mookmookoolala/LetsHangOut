import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from './DashboardLayout';
import { DateVoting } from './DateVoting';
import { TaskBoard } from './TaskBoard';
import { BudgetPanel } from './BudgetPanel';
import { Chat } from './Chat';
import { InviteUser } from './InviteUser';
import { PendingInvites } from './PendingInvites';
import PullToRefresh from './PullToRefresh';
import {
  Container, Paper, Grid, Typography, Button, Select, MenuItem, FormControl, Divider, useMediaQuery, TextField, InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GroupsIcon from '@mui/icons-material/Groups';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

export function Dashboard({ user, group, onLogout, onDeleteGroup, userGroups = [], onSelectGroup }) {
  const [members, setMembers] = useState([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPendingInvites, setShowPendingInvites] = useState(false);
  const [inviteCount, setInviteCount] = useState(0);
  const theme = useTheme();
  // Define isMobile for responsive design
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Initialize navigate for routing
  const navigate = useNavigate();

  const fetchGroupMembers = useCallback(() => {
    if (group && group.id) {
      return fetch(`${API_URL}/group-members?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => {
          setMembers(Array.isArray(data) ? data : []);
          return data; // Return data for promise chaining
        })
        .catch(() => {
          setMembers([]);
          return []; // Return empty array on error
        });
    }
    return Promise.resolve([]); // Return resolved promise if no group
  }, [group]);

  // Fetch pending invites count
  const fetchPendingInvites = useCallback(() => {
    if (user && user.id) {
      fetch(`${API_URL}/pending-invites?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setInviteCount(Array.isArray(data) ? data.length : 0);
        })
        .catch(() => {
          setInviteCount(0);
        });
    }
  }, [user]);

  useEffect(() => {
    fetchGroupMembers();
    fetchPendingInvites();
    
    // Add event listener for opening invite dialog
    const handleOpenInviteDialog = () => setShowInviteDialog(true);
    window.addEventListener('open-invite-dialog', handleOpenInviteDialog);
    
    return () => {
      window.removeEventListener('open-invite-dialog', handleOpenInviteDialog);
    };
  }, [fetchGroupMembers, fetchPendingInvites]);

  // Handle accepting an invite and refreshing the group list
  const handleAcceptInvite = (groupId) => {
    // Fetch the group details
    fetch(`${API_URL}/my-groups?user_id=${user.id}`)
      .then(res => res.json())
      .then(groups => {
        const acceptedGroup = groups.find(g => g.id === groupId);
        if (acceptedGroup && onSelectGroup) {
          onSelectGroup(acceptedGroup);
        }
        setShowPendingInvites(false);
      });
  };

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
  
  // Variables below are defined but not currently used
  // They are kept for future implementation

  // Handle refresh action
  const handleRefresh = () => {
    // Return the promise so PullToRefresh can track when it completes
    return fetchGroupMembers()
      .then(() => {
        // You could add more refresh actions here if needed
        return true;
      })
      .catch(error => {
        console.error('Error refreshing data:', error);
        return false;
      });
  };

  return (
    <DashboardLayout 
      members={members} 
      onLogout={onLogout} 
      onShowInvites={() => setShowPendingInvites(true)} 
      inviteCount={inviteCount}
    >
      {showInviteDialog && <InviteUser group={group} userId={user?.id} onClose={() => setShowInviteDialog(false)} onInviteSent={fetchPendingInvites} />}
      {showPendingInvites && <PendingInvites user={user} onClose={() => setShowPendingInvites(false)} onAccept={handleAcceptInvite} onUpdate={fetchPendingInvites} />}
      <PullToRefresh onRefresh={handleRefresh}>
      {!group || !group.id ? (
        <Container maxWidth="sm" sx={{ py: 6 }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 5, 
              textAlign: 'center', 
              borderRadius: 0, 
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 60px rgba(44, 100, 255, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
              }
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                mb: 2, 
                background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              No Group Selected
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, fontSize: '1.1rem' }}>
              Please select a group to view the dashboard or create a new one.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                minWidth: 200,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
              }}
              onClick={() => navigate('/create-group')}
            >
              Create New Group
            </Button>
          </Paper>
        </Container>
      ) : (
        <Container maxWidth="md" sx={{ py: isMobile ? 2 : 6, px: isMobile ? 1 : 3, width: '100%' }}>
          <Grid container spacing={isMobile ? 2 : 4} direction="column" sx={{ width: '100%', mx: 'auto', px: 0 }}>
            {/* Group Picker */}
            {userGroups.length > 1 && (
              <Grid item>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: isMobile ? 2 : 3.5, 
                    borderRadius: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: isMobile ? 1 : 2, 
                    flexDirection: isMobile ? 'column' : 'row', 
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 40px rgba(44, 100, 255, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(42, 108, 255, 0.03) 0%, rgba(108, 71, 255, 0.03) 100%)',
                      zIndex: 0,
                    },
                    '& > *': {
                      position: 'relative',
                      zIndex: 1,
                    }
                  }}
                >
                  <Typography sx={{ 
                    fontWeight: 700, 
                    fontSize: 17, 
                    color: 'primary.main', 
                    mr: isMobile ? 0 : 2,
                    mb: isMobile ? 1 : 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                  }}>
                    <GroupsIcon fontSize="small" />
                    Group:
                  </Typography>
                  <FormControl size="small" sx={{ 
                    minWidth: 150, 
                    width: isMobile ? '100%' : 'auto',
                    flex: isMobile ? 'none' : 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    }
                  }}>

                    <InputLabel>Select Group</InputLabel>
                    <Select
                      value={group && group.id ? group.id : ''}
                      label="Select Group"
                      onChange={e => {
                        const selected = userGroups.find(g => String(g.id) === String(e.target.value));
                        if (selected && onSelectGroup) onSelectGroup(selected);
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            width: isMobile ? '90%' : 'auto',
                          },
                        },
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
                    sx={{ 
                      ml: isMobile ? 0 : 'auto', 
                      fontWeight: 700, 
                      borderRadius: 0, 
                      minWidth: isMobile ? 'unset' : 160,
                      width: isMobile ? '100%' : 'auto',
                      py: 1.2,
                      mt: isMobile ? 1 : 0,
                    }}
                    onClick={handleCopy}
                  >
                    Copy Invite Link
                  </Button>
                </Paper>
              </Grid>
            )}
            {/* Invite People Section */}
            <Grid item>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: isMobile ? 2 : 4, 
                  borderRadius: 0, 
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 15px 50px rgba(44, 100, 255, 0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100%',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                  }
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 800, 
                    color: 'text.primary', 
                    mb: 3,
                    textAlign: isMobile ? 'center' : 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flexWrap: 'wrap',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                  }}
                >
                  <GroupsIcon fontSize="large" sx={{ color: 'primary.main' }} />
                  Invite People
                </Typography>
                <Grid container spacing={isMobile ? 2 : 3} direction={isMobile ? 'column' : 'row'} alignItems="center">
                  <Grid item xs={12} sm={9}>
                    <TextField
                      value={inviteLink}
                      label="Invite Link"
                      fullWidth
                      InputProps={{ 
                        readOnly: true,
                        sx: {
                          fontSize: isMobile ? '0.95rem' : 'inherit',
                        }
                      }}
                      size="medium"
                      sx={{ 
                        color: theme.palette.text.primary,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth={isMobile}
                      sx={{ 
                        fontWeight: 700, 
                        borderRadius: 0, 
                        minHeight: isMobile ? 52 : 48,
                        py: isMobile ? 1.8 : 1.5,
                        boxShadow: '0 4px 14px rgba(42, 108, 255, 0.25)',
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(42, 108, 255, 0.35)',
                        }
                      }}
                      onClick={handleCopy}
                    >
                      Copy Link
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Divider sx={{ my: isMobile ? 2 : 4 }} />
            {/* Members Section */}
            <Grid item>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: isMobile ? 2 : 4, 
                  borderRadius: 0, 
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 15px 50px rgba(44, 100, 255, 0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100%',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                  }
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 800, 
                    color: 'text.primary', 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <GroupsIcon fontSize="large" sx={{ color: 'primary.main' }} />
                  Members
                </Typography>
                <Grid container spacing={3}>
                  {members.map(member => (
                    <Grid item key={member.id} xs={12} sm={6} md={4}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2.5, 
                          borderRadius: 0, 
                          background: 'rgba(255, 255, 255, 0.7)',
                          border: '1px solid rgba(230, 235, 255, 0.9)',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 10px 25px rgba(42, 108, 255, 0.08)',
                            background: 'rgba(255, 255, 255, 0.95)',
                          }
                        }}
                      >
                        <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', mb: 0.5 }}>{member.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>{member.email}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            {/* Main Dashboard Cards */}
            <Grid item>
              <Grid container spacing={isMobile ? 3 : 4}>
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: isMobile ? 2 : 4, 
                      borderRadius: 0, 
                      height: '100%', 
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 15px 50px rgba(44, 100, 255, 0.12)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: isMobile ? 'none' : 'translateY(-5px)',
                        boxShadow: isMobile ? '0 15px 50px rgba(44, 100, 255, 0.12)' : '0 20px 60px rgba(44, 100, 255, 0.18)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                      }
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 800, 
                        color: 'text.primary', 
                        mb: isMobile ? 2 : 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        fontSize: isMobile ? '1.2rem' : '1.5rem'
                      }}
                    >
                      Date Voting
                    </Typography>
                    <DateVoting user={user} group={group} />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: isMobile ? 2 : 4, 
                      borderRadius: 0, 
                      height: '100%', 
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 15px 50px rgba(44, 100, 255, 0.12)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: isMobile ? 'none' : 'translateY(-5px)',
                        boxShadow: isMobile ? '0 15px 50px rgba(44, 100, 255, 0.12)' : '0 20px 60px rgba(44, 100, 255, 0.18)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                      }
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 800, 
                        color: 'text.primary', 
                        mb: isMobile ? 2 : 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        fontSize: isMobile ? '1.2rem' : '1.5rem'
                      }}
                    >
                      Tasks
                    </Typography>
                    <TaskBoard user={user} group={group} />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: isMobile ? 2 : 4, 
                      borderRadius: 0, 
                      height: '100%', 
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 15px 50px rgba(44, 100, 255, 0.12)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: isMobile ? 'none' : 'translateY(-5px)',
                        boxShadow: isMobile ? '0 15px 50px rgba(44, 100, 255, 0.12)' : '0 20px 60px rgba(44, 100, 255, 0.18)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                      }
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 800, 
                        color: 'text.primary', 
                        mb: isMobile ? 2 : 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        fontSize: isMobile ? '1.2rem' : '1.5rem'
                      }}
                    >
                      Budget
                    </Typography>
                    <BudgetPanel user={user} group={group} />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: isMobile ? 2 : 4, 
                      borderRadius: 0, 
                      height: '100%', 
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 15px 50px rgba(44, 100, 255, 0.12)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: isMobile ? 'none' : 'translateY(-5px)',
                        boxShadow: isMobile ? '0 15px 50px rgba(44, 100, 255, 0.12)' : '0 20px 60px rgba(44, 100, 255, 0.18)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                      }
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 800, 
                        color: 'text.primary', 
                        mb: isMobile ? 2 : 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        fontSize: isMobile ? '1.2rem' : '1.5rem'
                      }}
                    >
                      Group Chat
                    </Typography>
                    <Chat user={user} group={group} />
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      )}
      </PullToRefresh>
    </DashboardLayout>
  );
}