import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

export function ApiTest() {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApi = () => {
    setLoading(true);
    setError(null);
    
    fetch(`${API_URL}/api`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setApiResponse(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        API Connection Test
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testApi} 
        disabled={loading}
        sx={{ mb: 2 }}
      >
        Test API Connection
      </Button>
      
      {loading && <CircularProgress sx={{ display: 'block', my: 2 }} />}
      
      {error && (
        <Typography color="error" sx={{ my: 2 }}>
          Error: {error}
        </Typography>
      )}
      
      {apiResponse && (
        <Box sx={{ my: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6">API Response:</Typography>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
}