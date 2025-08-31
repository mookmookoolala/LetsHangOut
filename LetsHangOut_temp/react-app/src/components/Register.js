import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export function Register({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          borderRadius: 5,
          boxShadow: '0 8px 32px rgba(44,100,255,0.10), 0 1.5px 8px rgba(44,100,255,0.04)',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(200,210,255,0.18)',
          p: { xs: 2, sm: 3 },
        }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0 }}>
          <Box
            sx={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 24px rgba(44,100,255,0.10)',
              mb: 2,
            }}
          >
            <img
              src="https://letshangout.s3.us-east-1.amazonaws.com/icons/LHO8-removebg-preview+(1).png"
              alt="Letshangout Logo"
              style={{ width: 64, height: 64, borderRadius: '50%' }}
            />
          </Box>
          <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 800, mb: 2, letterSpacing: 1, textAlign: 'center', textShadow: '0 1px 8px #f5f7fa' }}>
            Register
          </Typography>
          <TextField
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            sx={{ mb: 2, borderRadius: 2, background: '#f7f9fc', color: '#1a237e' }}
            InputProps={{ style: { borderRadius: 10, color: '#1a237e' } }}
            InputLabelProps={{ style: { color: '#1a237e', fontWeight: 600 } }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2, borderRadius: 2, background: '#f7f9fc', color: '#1a237e' }}
            InputProps={{ style: { borderRadius: 10, color: '#1a237e' } }}
            InputLabelProps={{ style: { color: '#1a237e', fontWeight: 600 } }}
          />
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{
              background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 2,
              fontSize: isMobile ? '1.1rem' : '1.15rem',
              py: 1.3,
              mb: 1.5,
              boxShadow: 2,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(90deg, #6c47ff 0%, #2a6cff 100%)',
              },
            }}
            onClick={() => onRegister(username, password)}
          >
            Register
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              color: '#1a237e',
              borderColor: '#1a237e',
              fontWeight: 700,
              borderRadius: 2,
              fontSize: isMobile ? '1.05rem' : '1.1rem',
              py: 1.1,
              textTransform: 'none',
              '&:hover': {
                background: 'rgba(26,35,126,0.08)',
                borderColor: '#1a237e',
                color: '#2a6cff',
              },
            }}
            onClick={onSwitchToLogin}
          >
            Already have an account? Login
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
} 