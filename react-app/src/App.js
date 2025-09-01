import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import { Register } from './components/Register';
import { CreateGroup } from './components/CreateGroup';
import { JoinGroup } from './components/JoinGroup';
import { DateVoting } from './components/DateVoting';
import { TaskBoard } from './components/TaskBoard';
import { BudgetPanel } from './components/BudgetPanel';
import DashboardLayout from './components/DashboardLayout';
import { InviteJoin } from './components/InviteJoin';
import { ProfileSettings } from './components/ProfileSettings';
import { Dashboard } from './components/Dashboard';
import { ApiTest } from './components/ApiTest';
import GestureNavigation from './components/GestureNavigation';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

// Consistent error handling utility - commented out as it's not currently used
// but will be useful for future API calls
/*
const handleApiError = (response, errorMessage = 'Operation failed') => {
  if (!response.ok) {
    return response.text().then(text => { 
      throw new Error(text || errorMessage); 
    });
  }
  return response.json();
};
*/

// Consistent API call wrapper - commented out as it's not currently used
// but will be useful for future API calls
/*
const apiCall = async (endpoint, options = {}, errorMessage = 'Operation failed') => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    return await handleApiError(response, errorMessage);
  } catch (error) {
    throw new Error(error.message || errorMessage);
  }
};
*/

function useAppVersionChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const currentVersion = useRef(null);

  useEffect(() => {
    fetch('/version.json')
      .then(res => res.json())
      .then(data => {
        currentVersion.current = data.version;
      });
    const interval = setInterval(() => {
      fetch('/version.json')
        .then(res => res.json())
        .then(data => {
          if (currentVersion.current && data.version !== currentVersion.current) {
            setUpdateAvailable(true);
          }
        });
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  return updateAvailable;
}

// Utility function to detect mobile devices - commented out as it's not currently used
// but will be useful for responsive design features
/*
function detectMobileDevice() {
  return /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(navigator.userAgent);
}
*/

// RequireAuth wrapper: shows login/register UI if not logged in
function RequireAuth({ user, showRegister, setShowRegister, showGuestPrompt, setShowGuestPrompt, guestName, setGuestName, onLogin, onRegister, onGuest, onConfirmGuest, children }) {
  if (!user) {
    return (
      <div className="centered-container">
        {showGuestPrompt ? (
          <div className="login-container">
            <h2>Continue as Guest</h2>
            <input placeholder="Your Name" value={guestName} onChange={e => setGuestName(e.target.value)} />
            <button className="btn-primary" onClick={onConfirmGuest} disabled={!guestName}>Continue</button>
            <button style={{marginTop: '10px'}} onClick={() => setShowGuestPrompt(false)}>Back</button>
          </div>
        ) : showRegister ? (
          <Register onRegister={onRegister} onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login onLogin={onLogin} onSwitchToRegister={() => setShowRegister(true)} onGuest={onGuest} />
        )}
      </div>
    );
  }
  return children;
}

function GroupJoinHandler({
  user,
  setGroup,
  setSelectedGroup,
  setUserGroups,
  setShowJoin,
  children
}) {
  const navigate = useNavigate();

  const handleCreateGroup = (groupName, inviteOnly = false) => {
    if (!user || !user.id) {
      alert('You must be logged in to create a group.');
      return;
    }
    fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: groupName,
        user_id: user.id,
        username: user.guest ? user.username : undefined,
        guest: user.guest ? true : undefined,
        invite_only: inviteOnly
      })
    })
      .then(async response => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
        try {
          return await response.json();
        } catch {
          throw new Error('Unexpected response from server.');
        }
      })
      .then(group => {
        setGroup(group);
        setSelectedGroup(group);
        navigate('/');
        // Fetch updated group list
        fetch(`${API_URL}/my-groups?user_id=${user.id}`)
          .then(res => res.json())
          .then(groups => setUserGroups(groups));
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
    fetch(`${API_URL}/join-group`, {
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
        const joinedGroup = data && data.group ? data.group : { code: groupCode };
        setGroup(joinedGroup);
        setSelectedGroup(joinedGroup);
        navigate('/');
        alert('Successfully joined group!');
      })
      .catch(error => {
        alert('Join group failed: ' + error.message);
      });
  };

  return children({ handleCreateGroup, handleJoinGroup });
}

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const updateAvailable = useAppVersionChecker();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  // Commented out as it's not currently used but may be needed later
  // const userHasGroups = user && userGroups && userGroups.length > 0;
  const [showJoin, setShowJoin] = useState(false);
  const [userGroupsLoading, setUserGroupsLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Clear selectedGroup when user logs out
  useEffect(() => {
    if (!user) {
      setSelectedGroup(null);
      setUserGroups([]);
      setUserGroupsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (isMobile) {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallPrompt(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isMobile]);
  // Hide prompt if already installed
  useEffect(() => {
    const handler = () => setShowInstallPrompt(false);
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);
  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setShowInstallPrompt(false));
    }
  };

  useEffect(() => {
    if (user && user.id) {
      setUserGroupsLoading(true);
      fetch(`${API_URL}/my-groups?user_id=${user.id}`)
        .then(res => res.json())
        .then(groups => {
          console.log('Fetched groups:', groups);
          setUserGroups(groups || []);
          // Don't automatically select a group - let user choose
          setSelectedGroup(null);
          setUserGroupsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching groups:', error);
          setUserGroups([]);
          setSelectedGroup(null);
          setUserGroupsLoading(false);
        });
    }
  }, [user]);

  const handleLogin = (username, password) => {
    fetch(`${API_URL}/login`, {
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
        // Clear previous state
        setSelectedGroup(null);
        setUserGroups([]);
        setUserGroupsLoading(true);
        // After login, fetch groups and if none, show create/join UI
        fetch(`${API_URL}/my-groups?user_id=${user.id}`)
          .then(res => res.json())
          .then(groups => {
            console.log('Login - fetched groups:', groups);
            setUserGroups(groups || []);
            // Don't automatically select a group - let user choose
            setSelectedGroup(null);
            setShowJoin(false); // default to create group
            setUserGroupsLoading(false);
          })
          .catch((error) => {
            console.error('Login - error fetching groups:', error);
            setUserGroups([]);
            setSelectedGroup(null);
            setUserGroupsLoading(false);
          });
      })
      .catch(error => {
        alert('Login failed: ' + error.message);
      });
  };
  const handleRegister = (username, password) => {
    fetch(`${API_URL}/register`, {
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
        // Clear previous state
        setSelectedGroup(null);
        setUserGroups([]);
        setUserGroupsLoading(true);
        // After register, fetch groups and if none, show create/join UI
        fetch(`${API_URL}/my-groups?user_id=${user.id}`)
          .then(res => res.json())
          .then(groups => {
            console.log('Register - fetched groups:', groups);
            setUserGroups(groups || []);
            // Don't automatically select a group - let user choose
            setSelectedGroup(null);
            setShowJoin(false); // default to create group
            setUserGroupsLoading(false);
          })
          .catch((error) => {
            console.error('Register - error fetching groups:', error);
            setUserGroups([]);
            setSelectedGroup(null);
            setUserGroupsLoading(false);
          });
      })
      .catch(error => {
        alert('Registration failed: ' + error.message);
      });
  };

  // These functions are defined but not currently used
  // They are kept for future implementation

  const handleGuest = () => {
    setShowGuestPrompt(true);
  };
  const confirmGuest = () => {
    if (!guestName) return;
    fetch(`${API_URL}/guest-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: guestName })
    })
      .then(res => res.json())
      .then(user => {
        console.log('Guest login successful:', user);
        setUser({ ...user, guest: true });
        setShowGuestPrompt(false);
        setGuestName('');
        // Clear previous state for guest user
        setSelectedGroup(null);
        setUserGroups([]);
        setUserGroupsLoading(true);
        
        // Check if there's a pending invite code from localStorage
        const pendingInviteCode = localStorage.getItem('pendingInviteCode');
        
        if (pendingInviteCode) {
          console.log('Found pending invite code during guest login:', pendingInviteCode);
          // Join the group with the invite code
          fetch(`${API_URL}/join-group`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: pendingInviteCode, user_id: user.id })
          })
            .then(res => {
              if (!res.ok) return res.text().then(text => { throw new Error(text); });
              return res.json();
            })
            .then(data => {
              console.log('Successfully joined group with invite code:', data);
              // Clear the pending invite code
              localStorage.removeItem('pendingInviteCode');
              
              // Fetch groups for guest user after joining
              return fetch(`${API_URL}/my-groups?user_id=${user.id}`)
                .then(res => res.json())
                .then(groups => {
                  console.log('Guest login with invite - fetched groups:', groups);
                  setUserGroups(groups || []);
                  // Select the joined group
                  if (data && data.group) {
                    setSelectedGroup(data.group);
                  }
                  setShowJoin(false);
                  setUserGroupsLoading(false);
                });
            })
            .catch(error => {
              console.error('Error joining group with invite code:', error);
              // If joining fails, just fetch groups normally
              fetchGuestGroups(user.id);
              // Clear the pending invite code to prevent repeated attempts
              localStorage.removeItem('pendingInviteCode');
            });
        } else {
          // No pending invite, just fetch groups normally
          fetchGuestGroups(user.id);
        }
      });
  };
  
  // Helper function to fetch guest groups
  const fetchGuestGroups = (userId) => {
    fetch(`${API_URL}/my-groups?user_id=${userId}`)
      .then(res => res.json())
      .then(groups => {
        console.log('Guest login - fetched groups:', groups);
        setUserGroups(groups || []);
        // Don't automatically select a group - let user choose
        setSelectedGroup(null);
        setShowJoin(false);
        setUserGroupsLoading(false);
      })
      .catch((error) => {
        console.error('Guest login - error fetching groups:', error);
        setUserGroups([]);
        setSelectedGroup(null);
        setUserGroupsLoading(false);
      });
  };

  // Commented out as it's not currently used but will be needed for group deletion functionality
  /*
  function handleDeleteGroup(g) {
    if (window.confirm('Are you sure you want to delete this group? This cannot be undone.')) {
      fetch(`${API_URL}/delete-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: g.id, user_id: user.id })
      })
        .then(res => {
          if (!res.ok) throw new Error('Delete failed');
          return res.json();
        })
        .then(() => {
          alert('Group deleted!');
          setUserGroups((prev) => (prev || []).filter(gr => gr.id !== g.id));
          setSelectedGroup(null);
          window.location.reload();
        })
        .catch(err => alert('Failed to delete group: ' + err.message));
    }
  }
  */

  // Commented out as it's not currently used but will be needed for group leaving functionality
  /*
  function handleLeaveGroup(g) {
    if (window.confirm('Are you sure you want to leave this group?')) {
      fetch(`${API_URL}/leave-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: g.id, user_id: user.id })
      })
        .then(res => {
          if (!res.ok) throw new Error('Leave failed');
          return res.json();
        })
        .then(() => {
          alert('You have left the group.');
          setUserGroups((prev) => (prev || []).filter(gr => gr.id !== g.id));
          setSelectedGroup(null);
          window.location.reload();
        })
        .catch(err => alert('Failed to leave group: ' + err.message));
    }
  }
  */

  function handleSidebarDeleteGroup() {
    if (window.confirm('Are you sure you want to delete this group? This cannot be undone.')) {
      fetch(`${API_URL}/delete-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: selectedGroup.id, user_id: user.id })
      })
        .then(res => {
          if (!res.ok) throw new Error('Delete failed');
          return res.json();
        })
        .then(() => {
          alert('Group deleted!');
          setUserGroups((prev) => (prev || []).filter(gr => gr.id !== selectedGroup.id));
          setSelectedGroup(null);
          window.location.reload();
        })
        .catch(err => alert('Failed to delete group: ' + err.message));
    }
  }

  // Debug logging for state transitions
  useEffect(() => {
    console.log('DEBUG STATE:', {
      user,
      userGroups,
      selectedGroup,
      showJoin,
      userGroupsLoading
    });
  }, [user, userGroups, selectedGroup, showJoin, userGroupsLoading]);

  // Temporary no-op to prevent ReferenceError if setGroup is still referenced
  const setGroup = () => {};

  return (
    <Router>
      {updateAvailable && (
        <div style={{
          position: 'fixed', top: 0, width: '100%', background: '#ff0', color: '#000', zIndex: 9999, textAlign: 'center', padding: '10px'
        }}>
          New update available! 
          <button onClick={() => window.location.reload(true)}>Reload</button>
          <button style={{marginLeft: 12}} onClick={() => {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations) {
                  registration.unregister().then(() => window.location.reload(true));
                }
              });
            } else {
              window.location.reload(true);
            }
          }}>Force Update</button>
        </div>
      )}
      {showInstallPrompt && (
        <div style={{
          position: 'fixed', bottom: 0, width: '100%', background: '#2a6cff', color: '#fff', zIndex: 9999, textAlign: 'center', padding: '14px', fontSize: '1.1rem', boxShadow: '0 -2px 8px #2a6cff33'
        }}>
          Add LetsHangOut to your homescreen for the best experience!
          <button style={{marginLeft: 16, background: '#fff', color: '#2a6cff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer'}} onClick={handleInstallClick}>Add to Homescreen</button>
        </div>
      )}
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
          <ProfileSettings user={user} setUser={setUser} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} />
        } />
        <Route path="/" element={
          <GroupJoinHandler
            user={user}
            setGroup={setGroup}
            setSelectedGroup={setSelectedGroup}
            setUserGroups={setUserGroups}
            setShowJoin={setShowJoin}
          >
            {({ handleCreateGroup, handleJoinGroup }) => (
              <RequireAuth
                user={user}
                showRegister={showRegister}
                setShowRegister={setShowRegister}
                showGuestPrompt={showGuestPrompt}
                setShowGuestPrompt={setShowGuestPrompt}
                guestName={guestName}
                setGuestName={setGuestName}
                onLogin={handleLogin}
                onRegister={handleRegister}
                onGuest={handleGuest}
                onConfirmGuest={confirmGuest}
              >
                {selectedGroup ? (
                  <Dashboard
                    user={user}
                    group={selectedGroup}
                    userGroups={userGroups}
                    onSelectGroup={setSelectedGroup}
                    onLogout={() => { 
                      console.log('Logout clicked');
                      // Clear user data from localStorage to prevent auto-login on refresh
                      localStorage.removeItem('user');
                      localStorage.removeItem('selectedGroup');
                      // Reset state
                      setUser(null); 
                      setSelectedGroup(null); 
                      setUserGroups([]);
                      setUserGroupsLoading(false);
                    }}
                    onDeleteGroup={handleSidebarDeleteGroup}
                  />
                ) : user && !userGroupsLoading ? (
                  <div className="centered-container">
                    <h2>Welcome, {user.username}!</h2>
                    {userGroups && userGroups.length > 0 ? (
                      <>
                        <h3>Choose a group or create/join a new one:</h3>
                        <div style={{marginBottom: 20}}>
                          <select 
                            onChange={(e) => {
                              const selected = userGroups.find(g => g.id === parseInt(e.target.value));
                              if (selected) setSelectedGroup(selected);
                            }}
                            style={{padding: '8px 12px', marginRight: 10, borderRadius: 6, border: '1.5px solid #1a237e', fontSize: 16, color: '#1a237e', fontWeight: 600}}
                          >
                            <option value="">Select existing group...</option>
                            {userGroups.map(g => (
                              <option key={g.id} value={g.id}>{g.name || g.code}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center'}}>
                          <Button
                            variant="contained"
                            sx={{
                              background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                              color: '#fff',
                              fontWeight: 700,
                              borderRadius: 2,
                              fontSize: isMobile ? '1.08rem' : '1.12rem',
                              py: 1.1,
                              px: 3,
                              boxShadow: 2,
                              textTransform: 'none',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #6c47ff 0%, #2a6cff 100%)',
                              },
                            }}
                            onClick={() => setShowJoin(false)}
                          >
                            Create New Group
                          </Button>
                          <Button
                            variant="outlined"
                            sx={{
                              color: '#1a237e',
                              borderColor: '#1a237e',
                              fontWeight: 700,
                              borderRadius: 2,
                              fontSize: isMobile ? '1.05rem' : '1.1rem',
                              py: 1.1,
                              px: 3,
                              textTransform: 'none',
                              '&:hover': {
                                background: 'rgba(26,35,126,0.08)',
                                borderColor: '#1a237e',
                                color: '#2a6cff',
                              },
                            }}
                            onClick={() => setShowJoin(true)}
                          >
                            Join Group
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3>You are not in any groups yet.</h3>
                        <div style={{marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center'}}>
                          <Button
                            variant="contained"
                            sx={{
                              background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                              color: '#fff',
                              fontWeight: 700,
                              borderRadius: 2,
                              fontSize: isMobile ? '1.08rem' : '1.12rem',
                              py: 1.1,
                              px: 3,
                              boxShadow: 2,
                              textTransform: 'none',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #6c47ff 0%, #2a6cff 100%)',
                              },
                            }}
                            onClick={() => setShowJoin(false)}
                          >
                            Create Group
                          </Button>
                          <Button
                            variant="outlined"
                            sx={{
                              color: '#1a237e',
                              borderColor: '#1a237e',
                              fontWeight: 700,
                              borderRadius: 2,
                              fontSize: isMobile ? '1.05rem' : '1.1rem',
                              py: 1.1,
                              px: 3,
                              textTransform: 'none',
                              '&:hover': {
                                background: 'rgba(26,35,126,0.08)',
                                borderColor: '#1a237e',
                                color: '#2a6cff',
                              },
                            }}
                            onClick={() => setShowJoin(true)}
                          >
                            Join Group
                          </Button>
                        </div>
                      </>
                    )}
                    {showJoin ? (
                      <JoinGroup onJoin={handleJoinGroup} groupList={[]} />
                    ) : (
                      <CreateGroup onCreate={handleCreateGroup} />
                    )}
                  </div>
                ) : null}
              </RequireAuth>
            )}
          </GroupJoinHandler>
        } />
        <Route path="/calendar" element={
          <RequireAuth
            user={user}
            showRegister={showRegister}
            setShowRegister={setShowRegister}
            showGuestPrompt={showGuestPrompt}
            setShowGuestPrompt={setShowGuestPrompt}
            guestName={guestName}
            setGuestName={setGuestName}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGuest={handleGuest}
            onConfirmGuest={confirmGuest}
          >
            <DashboardLayout>
              <DateVoting user={user} group={selectedGroup} />
            </DashboardLayout>
          </RequireAuth>
        } />
        <Route path="/groups" element={
          <RequireAuth
            user={user}
            showRegister={showRegister}
            setShowRegister={setShowRegister}
            showGuestPrompt={showGuestPrompt}
            setShowGuestPrompt={setShowGuestPrompt}
            guestName={guestName}
            setGuestName={setGuestName}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGuest={handleGuest}
            onConfirmGuest={confirmGuest}
          >
            <DashboardLayout>
              <div style={{padding: 32}}>
                <h2>Groups</h2>
                <p>Group management coming soon.</p>
              </div>
            </DashboardLayout>
          </RequireAuth>
        } />
        <Route path="/tasks" element={
          <RequireAuth
            user={user}
            showRegister={showRegister}
            setShowRegister={setShowRegister}
            showGuestPrompt={showGuestPrompt}
            setShowGuestPrompt={setShowGuestPrompt}
            guestName={guestName}
            setGuestName={setGuestName}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGuest={handleGuest}
            onConfirmGuest={confirmGuest}
          >
            <DashboardLayout>
              <TaskBoard user={user} group={selectedGroup} />
            </DashboardLayout>
          </RequireAuth>
        } />
        <Route path="/budget" element={
          <RequireAuth
            user={user}
            showRegister={showRegister}
            setShowRegister={setShowRegister}
            showGuestPrompt={showGuestPrompt}
            setShowGuestPrompt={setShowGuestPrompt}
            guestName={guestName}
            setGuestName={setGuestName}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGuest={handleGuest}
            onConfirmGuest={confirmGuest}
          >
            <DashboardLayout>
              <BudgetPanel user={user} group={selectedGroup} />
            </DashboardLayout>
          </RequireAuth>
        } />
        <Route path="/api-test" element={<ApiTest />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

