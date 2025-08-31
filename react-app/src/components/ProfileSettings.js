import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Avatar, 
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Save as SaveIcon, Upgrade as UpgradeIcon } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

export function ProfileSettings({ user, setUser, selectedGroup, setSelectedGroup }) {
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [picture, setPicture] = useState(user?.picture || '');
  const [preview, setPreview] = useState(user?.picture || '');
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradePassword, setUpgradePassword] = useState('');
  const [upgradeError, setUpgradeError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (!user) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h6" sx={{ color: 'text.secondary' }}>
        Loading...
      </Typography>
    </Box>
  );

  const handlePictureChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setPicture(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let pictureUrl = user.picture;
    if (picture && picture instanceof File) {
      pictureUrl = preview;
    }
    const updated = { ...user, username, phone, picture: pictureUrl };
    await fetch(`${API_URL}/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setUser(updated);
    setSaving(false);
    if (selectedGroup) {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  const handleUpgrade = async () => {
    setSaving(true);
    setUpgradeError('');
    const res = await fetch(`${API_URL}/upgrade-guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, username, password: upgradePassword })
    });
    if (res.ok) {
      const upgraded = await res.json();
      setUser({ ...upgraded, guest: false });
      setShowUpgrade(false);
      setUpgradePassword('');
      navigate(-1);
    } else {
      setUpgradeError('Upgrade failed. Try a different username or password.');
    }
    setSaving(false);
  };

  return (
    <Box
      sx={{
        maxWidth: 420,
        margin: '3.5rem auto 0 auto',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(44,100,255,0.08)',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(200,210,255,0.2)',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" sx={{ 
            textAlign: 'center', 
            color: '#2a6cff', 
            mb: 3, 
            fontWeight: 700 
          }}>
            Profile Settings
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative', cursor: 'pointer' }}>
              <Avatar
                src={preview || '/logo192.png'}
                alt="Profile"
                sx={{ 
                  width: 96, 
                  height: 96, 
                  boxShadow: '0 4px 16px rgba(44,100,255,0.15)',
                  mb: 1
                }}
              />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePictureChange}
                id="profile-pic-input"
              />
              <label htmlFor="profile-pic-input" style={{ cursor: 'pointer' }}>
                <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>
                  Click to change
                </Typography>
              </label>
            </Box>
            
            <TextField
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              fullWidth
              size="medium"
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  background: '#f7f9fc'
                }
              }}
            />
            
            <TextField
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Phone number for PayNow (optional)"
              fullWidth
              size="medium"
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  background: '#f7f9fc'
                }
              }}
            />
            
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              fullWidth
              sx={{
                background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 2,
                fontSize: isMobile ? '1.1rem' : '1.15rem',
                py: 1.2,
                mt: 1,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(90deg, #6c47ff 0%, #2a6cff 100%)',
                },
                '&:disabled': {
                  background: '#ccc',
                  color: '#666',
                },
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            
            {user.guest && !showUpgrade && (
              <Button
                variant="outlined"
                startIcon={<UpgradeIcon />}
                onClick={() => setShowUpgrade(true)}
                fullWidth
                sx={{
                  color: '#1a237e',
                  borderColor: '#1a237e',
                  fontWeight: 700,
                  borderRadius: 2,
                  fontSize: isMobile ? '1.05rem' : '1.1rem',
                  py: 1.1,
                  mt: 1,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'rgba(26,35,126,0.08)',
                    borderColor: '#1a237e',
                    color: '#2a6cff',
                  },
                }}
              >
                Upgrade to Account
              </Button>
            )}
            
            {showUpgrade && (
              <Box sx={{ width: '100%', mt: 1 }}>
                <TextField
                  type="password"
                  value={upgradePassword}
                  onChange={e => setUpgradePassword(e.target.value)}
                  placeholder="Set a password"
                  fullWidth
                  size="medium"
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      background: '#f7f9fc'
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleUpgrade}
                  disabled={saving || !upgradePassword}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: 2,
                    fontSize: isMobile ? '1.1rem' : '1.15rem',
                    py: 1.2,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #6c47ff 0%, #2a6cff 100%)',
                    },
                    '&:disabled': {
                      background: '#ccc',
                      color: '#666',
                    },
                  }}
                >
                  {saving ? 'Signing Up...' : 'Sign Up'}
                </Button>
                {upgradeError && (
                  <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                    {upgradeError}
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 