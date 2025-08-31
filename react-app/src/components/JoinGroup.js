import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export function JoinGroup({ onJoin, groupList }) {
  const [groupCode, setGroupCode] = useState('');
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleJoinClick = () => {
    if (groupList && !groupList.includes(groupCode)) {
      setError('Group does not exist.');
      return;
    }
    setError('');
    onJoin(groupCode);
  };
  
  return (
    <Card
      sx={{
        maxWidth: 500,
        width: '100%',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(44,100,255,0.08)',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(200,210,255,0.2)',
        p: { xs: 2, sm: 3 },
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0 }}>
        <Typography variant="h5" sx={{ color: '#1a237e', fontWeight: 700, mb: 3, textAlign: 'center' }}>
          Join Group
        </Typography>
        <TextField
          label="Group Code"
          value={groupCode}
          onChange={e => setGroupCode(e.target.value)}
          fullWidth
          sx={{ mb: 3, borderRadius: 2, background: '#f7f9fc' }}
          InputProps={{ style: { borderRadius: 10, color: '#1a237e' } }}
          InputLabelProps={{ style: { color: '#1a237e', fontWeight: 600 } }}
        />
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={!groupCode.trim()}
          sx={{
            background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 2,
            fontSize: isMobile ? '1.1rem' : '1.15rem',
            py: 1.2,
            mb: 2,
            boxShadow: 2,
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(90deg, #6c47ff 0%, #2a6cff 100%)',
            },
            '&:disabled': {
              background: '#ccc',
              color: '#666',
            },
          }}
          onClick={handleJoinClick}
        >
          Join Group
        </Button>
        {error && (
          <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 