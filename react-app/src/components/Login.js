import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

function Login({ onLogin, onSwitchToRegister, onGuest }) {
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
          maxWidth: 420,
          width: '100%',
          borderRadius: 5,
          boxShadow: '0 20px 60px rgba(44,100,255,0.15), 0 1.5px 8px rgba(44,100,255,0.04)',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255,255,255,0.3)',
          p: { xs: 3, sm: 4 },
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 30px 80px rgba(44,100,255,0.2), 0 1.5px 8px rgba(44,100,255,0.04)',
          },
        }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0 }}>
          <Box
            sx={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(44,100,255,0.15)',
              mb: 3,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '140%',
                height: '140%',
                background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                borderRadius: '50%',
                opacity: 0.1,
                zIndex: -1,
                animation: 'pulse 2s infinite',
              },
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(0.95)',
                  opacity: 0.1,
                },
                '70%': {
                  transform: 'scale(1)',
                  opacity: 0.15,
                },
                '100%': {
                  transform: 'scale(0.95)',
                  opacity: 0.1,
                },
              },
            }}
          >
            <img
              src="https://letshangout.s3.us-east-1.amazonaws.com/icons/LHO8-removebg-preview+(1).png"
              alt="Letshangout Logo"
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%',
                transition: 'all 0.3s ease',
              }}
            />
          </Box>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 1,
              background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: 1, 
              textAlign: 'center', 
              textShadow: '0 2px 10px rgba(44, 100, 255, 0.15)'
            }}
          >
            Welcome Back
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: '#5a5a89', 
              maxWidth: '280px', 
              mx: 'auto',
              mb: 4,
              textAlign: 'center',
            }}
          >
            Sign in to continue your journey with Let's Hang Out
          </Typography>
          <TextField
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            sx={{ 
              mb: isMobile ? 3 : 2, 
              borderRadius: 2, 
              background: '#f7f9fc', 
              color: '#1a237e',
              '& .MuiInputBase-root': {
                minHeight: isMobile ? 56 : 48,
                fontSize: isMobile ? '1rem' : '0.875rem'
              },
              '& .MuiInputLabel-root': {
                fontSize: isMobile ? '1rem' : '0.875rem'
              }
            }}
            InputProps={{ 
              style: { borderRadius: 10, color: '#1a237e' },
              className: 'touch-target'
            }}
            InputLabelProps={{ style: { color: '#1a237e', fontWeight: 600 } }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            sx={{ 
              mb: isMobile ? 3 : 2, 
              borderRadius: 2, 
              background: '#f7f9fc', 
              color: '#1a237e',
              '& .MuiInputBase-root': {
                minHeight: isMobile ? 56 : 48,
                fontSize: isMobile ? '1rem' : '0.875rem'
              },
              '& .MuiInputLabel-root': {
                fontSize: isMobile ? '1rem' : '0.875rem'
              }
            }}
            InputProps={{ 
              style: { borderRadius: 10, color: '#1a237e' },
              className: 'touch-target'
            }}
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
              py: isMobile ? 2 : 1.3,
              mb: isMobile ? 2 : 1.5,
              minHeight: isMobile ? 56 : 48,
              boxShadow: 2,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(90deg, #6c47ff 0%, #2a6cff 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(42, 108, 255, 0.3)',
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 4px 15px rgba(42, 108, 255, 0.2)',
              }
            }}
            onClick={() => onLogin(username, password)}
            className="touch-target"
          >
            Login
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
              mb: 1.5,
              textTransform: 'none',
              '&:hover': {
                background: 'rgba(26,35,126,0.08)',
                borderColor: '#1a237e',
                color: '#2a6cff',
              },
            }}
            onClick={onSwitchToRegister}
          >
            Don't have an account? Register
          </Button>
          <Box sx={{ width: '100%', my: 1.5, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flex: 1, height: 1, background: '#e3e8fd' }} />
            <Typography sx={{ mx: 2, color: '#aaa', fontWeight: 600, fontSize: '0.95rem' }}>or</Typography>
            <Box sx={{ flex: 1, height: 1, background: '#e3e8fd' }} />
          </Box>
          <Button
            variant="contained"
            fullWidth
            sx={{
              background: 'linear-gradient(90deg, #6c47ff 0%, #2a6cff 100%)',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 2,
              fontSize: isMobile ? '1.08rem' : '1.12rem',
              py: 1.1,
              boxShadow: 2,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
              },
            }}
            onClick={onGuest}
          >
            Continue as Guest
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;