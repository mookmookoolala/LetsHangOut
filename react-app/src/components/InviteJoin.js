import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Login from './Login';
import { Register } from './Register';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

export function InviteJoin({ onLogin, onRegister, onGuest, user, setUser, setUserGroups, setSelectedGroup }) {
  const { groupCode } = useParams();
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  const handleLogin = (username, password) => {
    fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(user => {
        setUser(user);
        joinGroup(user);
      })
      .catch(() => setError('Login failed'));
  };

  const handleRegister = (username, password) => {
    fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(user => {
        setUser(user);
        joinGroup(user);
      })
      .catch(() => setError('Registration failed'));
  };

  const joinGroup = (user) => {
    setJoining(true);
    fetch(`${API_URL}/join-group`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: groupCode, user_id: user.id })
    })
      .then(res => {
        if (!res.ok) return res.text().then(text => { throw new Error(text); });
        return res.json();
      })
      .then(data => {
        setSelectedGroup(data.group);
        // Fetch user groups
        fetch(`${API_URL}/my-groups?user_id=${user.id}`)
          .then(res => res.json())
          .then(groups => {
            setUserGroups(groups);
            navigate('/');
          });
      })
      .catch(err => {
        setError('Join group failed: ' + err.message);
        setJoining(false);
      });
  };

  if (user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          p: 2,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 700, mb: 2 }}>
            Joining group...
          </Typography>
          {joining && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Please wait...
              </Typography>
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: 2,
      }}
    >
      <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 400 }}>
        <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 700, mb: 3 }}>
          Join Group: {groupCode}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {showRegister ? (
          <Register onRegister={handleRegister} onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login 
            onLogin={handleLogin} 
            onSwitchToRegister={() => setShowRegister(true)} 
            onGuest={() => {
              if (onGuest) {
                onGuest();
                // Store the group code in localStorage to join after guest login
                localStorage.setItem('pendingInviteCode', groupCode);
                navigate('/');
              }
            }} 
          />
        )}
      </Box>
    </Box>
  );
}