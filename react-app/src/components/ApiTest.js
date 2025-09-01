import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Container, Card, CardContent, Divider, Alert, Fade, styled } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

// Styled components for better UI
const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
  color: '#fff',
  fontWeight: 700,
  borderRadius: '8px',
  padding: '10px 24px',
  fontSize: '1rem',
  boxShadow: '0 4px 14px rgba(44, 100, 255, 0.25)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(90deg, #6c47ff 0%, #2a6cff 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(44, 100, 255, 0.3)',
  },
}));

const ResponseCard = styled(Card)(({ theme }) => ({
  background: '#fafaff',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(44, 100, 255, 0.08)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 48px rgba(44, 100, 255, 0.12)',
    transform: 'translateY(-4px)',
  },
}));

export function ApiTest() {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testSuccess, setTestSuccess] = useState(false);

  const testApi = () => {
    setLoading(true);
    setError(null);
    setTestSuccess(false);
    
    fetch(`${API_URL}/api`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setApiResponse(data);
        setTestSuccess(true);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          borderRadius: 3, 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          boxShadow: '0 12px 24px rgba(44, 100, 255, 0.08)'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 1,
              background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 10px rgba(44, 100, 255, 0.15)'
            }}
          >
            API Connection Test
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: '#5a5a89', 
              maxWidth: '600px', 
              mx: 'auto',
              mb: 3
            }}
          >
            Test the connection to the backend API and view the response data
          </Typography>
          <Divider sx={{ mb: 4, opacity: 0.6 }} />
          
          <StyledButton 
            onClick={testApi} 
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
            size="large"
          >
            {loading ? 'Testing Connection...' : 'Test API Connection'}
          </StyledButton>
        </Box>
        
        <Fade in={error !== null} timeout={500}>
          <Box sx={{ mb: error ? 3 : 0 }}>
            {error && (
              <Alert 
                severity="error" 
                variant="filled"
                sx={{ 
                  borderRadius: 2, 
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
                  mb: 3 
                }}
              >
                {error}
              </Alert>
            )}
          </Box>
        </Fade>
        
        <Fade in={testSuccess} timeout={800}>
          <Box sx={{ mb: apiResponse ? 3 : 0 }}>
            {apiResponse && (
              <ResponseCard>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
                    color: 'white',
                    fontWeight: 600
                  }}>
                    <Typography variant="h6">API Response</Typography>
                  </Box>
                  <Box sx={{ 
                    p: 3, 
                    backgroundColor: '#fff',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                    overflowX: 'auto'
                  }}>
                    <pre style={{ 
                      margin: 0, 
                      fontSize: '1rem',
                      color: '#1a237e'
                    }}>
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  </Box>
                </CardContent>
              </ResponseCard>
            )}
          </Box>
        </Fade>
      </Paper>
    </Container>
  );
}