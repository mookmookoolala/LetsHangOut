import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Avatar,
  // useMediaQuery, // Commented out as it's not currently used
  // useTheme // Commented out as it's not currently used
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

export function Chat({ user, group }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  // const theme = useTheme(); // Commented out as it's not currently used
  // Commented out as it's not currently used but will be needed for responsive design
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch messages from backend (initial and polling)
  useEffect(() => {
    if (!group) return;
    let isMounted = true;
    const fetchMessages = () => {
      fetch(`${process.env.REACT_APP_API_URL}/group-messages?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => { if (isMounted) setMessages(data); });
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [group]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !user || !group) return;
    fetch(`${process.env.REACT_APP_API_URL}/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: group.id,
        user_id: user.id,
        username: user.username,
        message: input,
      })
    })
      .then(res => res.json())
      .then(() => {
        // Fetch new messages after sending
        fetch(`${process.env.REACT_APP_API_URL}/group-messages?group_id=${group.id}`)
          .then(res => res.json())
          .then(setMessages);
      });
    setInput('');
  };

  // Highlight @mentions, especially for the logged-in user
  function renderMessageText(text) {
    if (!user) return text;
    const mentionRegex = /(@[a-zA-Z0-9_]+)/g;
    const parts = text.split(mentionRegex);
    return parts.map((part, idx) => {
      if (mentionRegex.test(part)) {
        const mentioned = part.slice(1);
        if (mentioned.toLowerCase() === user.username.toLowerCase()) {
          return <span key={idx} style={{ background: '#ffeb3b', fontWeight: 700, padding: '2px 4px', borderRadius: 4 }}>{part}</span>;
        }
        return <span key={idx} style={{ background: '#e0e0e0', fontWeight: 500, padding: '2px 4px', borderRadius: 4 }}>{part}</span>;
      }
      return <span key={idx}>{part}</span>;
    });
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        height: 200, 
        overflowY: 'auto', 
        background: '#f8f9fa', 
        border: '1px solid #e0e0e0', 
        borderRadius: 2,
        mb: 2, 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {(messages || []).map((msg, idx) => (
          <Box key={msg.id || idx} sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 1,
            p: 1,
            borderRadius: 2,
            background: msg.username === user?.username ? '#e3f2fd' : '#fff',
            border: msg.username === user?.username ? '1px solid #2196f3' : '1px solid #e0e0e0'
          }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: '#1976d2' }}>
              {msg.username ? msg.username[0].toUpperCase() : '?'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976d2' }}>
                {msg.username}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {renderMessageText(msg.message)}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          size="small"
          fullWidth
          sx={{ 
            '& .MuiOutlinedInput-root': { borderRadius: 2 }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!input.trim()}
          startIcon={<SendIcon />}
          sx={{
            background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
            color: '#fff',
            borderRadius: 2,
            px: 2,
            py: 1,
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
          Send
        </Button>
      </Box>
    </Box>
  );
}