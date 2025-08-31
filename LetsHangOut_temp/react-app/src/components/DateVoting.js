import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

export function DateVoting({ group, user }) {
  const [dates, setDates] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [confirmedEvent, setConfirmedEvent] = useState(null);
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [calendarDate, setCalendarDate] = useState(null);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (group && group.id) {
      setLoading(true);
      fetch(`${API_URL}/group-dates?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => {
          setDates(data);
          const votes = {};
          data.forEach(date => {
            if (date.votes && Array.isArray(date.votes)) {
              const myVote = date.votes.find(v => v.user_id === user.id);
              if (myVote) votes[date.id] = myVote.available;
            }
          });
          setUserVotes(votes);
        })
        .catch(() => setDates([]))
        .finally(() => setLoading(false));
    }
  }, [group, user]);

  const handlePropose = () => {
    if (rangeMode) {
      if (!rangeStart || !rangeEnd || (rangeEnd < rangeStart)) return;
      fetch(`${API_URL}/propose-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: group.id, date: rangeStart, end_date: rangeEnd, time: newTime, proposed_by: user.id })
      })
        .then(res => res.json())
        .then(() => {
          setRangeStart('');
          setRangeEnd('');
          setNewTime('');
          setSnackbar({ open: true, message: 'Date proposed!' });
          return fetch(`${API_URL}/group-dates?group_id=${group.id}`)
            .then(res => res.json())
            .then(setDates);
        });
    } else {
      if (!newDate || !newTime) return;
      fetch(`${API_URL}/propose-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: group.id, date: newDate, time: newTime, proposed_by: user.id })
      })
        .then(res => res.json())
        .then(() => {
          setNewDate('');
          setNewTime('');
          setSnackbar({ open: true, message: 'Date proposed!' });
          return fetch(`${API_URL}/group-dates?group_id=${group.id}`)
            .then(res => res.json())
            .then(setDates);
        });
    }
  };

  const handleVote = (event_date_id, available) => {
    if (userVotes[event_date_id] !== undefined) return;
    fetch(`${API_URL}/vote-date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_date_id, user_id: user.id, available })
    })
      .then(() => {
        setSnackbar({ open: true, message: 'Vote submitted!' });
        return fetch(`${API_URL}/group-dates?group_id=${group.id}`)
          .then(res => res.json())
          .then(setDates);
      });
  };

  const handleDelete = (event_date_id) => {
    fetch(`${API_URL}/delete-proposed-date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_date_id, user_id: user.id })
    })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        setSnackbar({ open: true, message: 'Date deleted.' });
        return fetch(`${API_URL}/group-dates?group_id=${group.id}`)
          .then(res => res.json())
          .then(setDates);
      })
      .catch(err => setSnackbar({ open: true, message: 'Failed to delete date.' }));
  };

  const getWeekday = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'long' });
  };

  function downloadICS(event) {
    const pad = n => n.toString().padStart(2, '0');
    const dt = event.date + (event.time ? 'T' + event.time.replace(':', '') + '00' : '');
    const dtEnd = event.date + (event.time ? 'T' + (pad(Number(event.time.split(':')[0]) + 1) + event.time.slice(2)).replace(':', '') + '00' : '');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:Letshangout - ${group?.name || 'Event'}`,
      `DTSTART:${dt.replace(/[-:]/g, '')}`,
      `DTEND:${dtEnd.replace(/[-:]/g, '')}`,
      `DESCRIPTION:Confirmed group event via Letshangout` + (event.description ? '\n' + event.description : ''),
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `letshangout-event.ics`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  // Helper: get all votes for a given date string
  const getVotersForDate = (dateStr) => {
    const found = (dates || []).find(d => d.date === dateStr && !d.end_date);
    if (!found || !found.votes) return [];
    return found.votes.map(v => v.username);
  };

  return (
    <Card
      sx={{
        maxWidth: 650,
        margin: '0 auto',
        mb: 4,
        borderRadius: { xs: 3, sm: 4 },
        boxShadow: 6,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: { xs: 1, sm: 2 },
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Gradient header inside CardContent, not overlapping */}
        <Box
          sx={{
            height: 80,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            background: 'linear-gradient(90deg, #1976d2 0%, #6c47ff 100%)',
            display: 'flex',
            alignItems: 'center',
            px: 4,
            mb: 3,
            boxShadow: 3,
          }}
        >
          <CalendarMonthIcon sx={{ color: 'white', fontSize: 36, mr: 2 }} />
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, letterSpacing: 1 }}>
            Step 1: Vote on a Date
          </Typography>
        </Box>
        <Box sx={{ px: { xs: 1, sm: 3 }, pb: 2 }}>
          <ToggleButtonGroup
            value={rangeMode ? 'range' : 'single'}
            exclusive
            onChange={(_, val) => setRangeMode(val === 'range')}
            aria-label="date mode"
            size="small"
            sx={{
              mb: 2,
              width: isMobile ? '100%' : 'auto',
              borderRadius: 3,
              boxShadow: isMobile ? 2 : 0,
              overflow: 'hidden',
              background: 'linear-gradient(90deg, #1976d2 0%, #6c47ff 100%)',
            }}
          >
            <ToggleButton
              value="single"
              sx={{
                fontSize: isMobile ? '1rem' : '1.1rem',
                px: isMobile ? 1 : 2,
                py: isMobile ? 1 : 1.5,
                minWidth: isMobile ? 90 : 120,
                width: isMobile ? '50%' : 'auto',
                borderRadius: 0,
                fontWeight: 700,
                textTransform: 'none',
                color: '#fff',
                background: 'transparent',
                '&.Mui-selected': {
                  background: 'rgba(255,255,255,0.18)',
                  color: '#fff',
                  fontWeight: 900,
                  boxShadow: '0 2px 8px #2a6cff33',
                },
                '&:hover': {
                  background: 'rgba(255,255,255,0.10)',
                },
              }}
            >
              ONE DAY
            </ToggleButton>
            <ToggleButton
              value="range"
              sx={{
                fontSize: isMobile ? '1rem' : '1.1rem',
                px: isMobile ? 1 : 2,
                py: isMobile ? 1 : 1.5,
                minWidth: isMobile ? 90 : 120,
                width: isMobile ? '50%' : 'auto',
                borderRadius: 0,
                fontWeight: 700,
                textTransform: 'none',
                color: '#fff',
                background: 'transparent',
                '&.Mui-selected': {
                  background: 'rgba(255,255,255,0.18)',
                  color: '#fff',
                  fontWeight: 900,
                  boxShadow: '0 2px 8px #6c47ff33',
                },
                '&:hover': {
                  background: 'rgba(255,255,255,0.10)',
                },
              }}
            >
              RANGE OF DAYS
            </ToggleButton>
          </ToggleButtonGroup>
          {/* Calendar for single-day voting */}
          {!rangeMode && (
            <Box sx={{ mb: 3 }}>
              <Calendar
                onClickDay={date => {
                  setCalendarDate(date);
                  setShowTimeInput(true);
                }}
                tileContent={({ date, view }) => {
                  if (view !== 'month') return null;
                  const dateStr = date.toISOString().slice(0, 10);
                  const voters = getVotersForDate(dateStr);
                  if (voters.length === 0) return null;
                  return (
                    <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {voters.map((name, idx) => (
                        <Avatar key={idx} sx={{ width: 20, height: 20, fontSize: 12, bgcolor: '#1976d2', mr: 0.2 }}>{name[0].toUpperCase()}</Avatar>
                      ))}
                    </Box>
                  );
                }}
              />
              {showTimeInput && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Time"
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      const dateStr = calendarDate.toISOString().slice(0, 10);
                      setNewDate(dateStr);
                      setShowTimeInput(false);
                      handlePropose();
                    }}
                    disabled={!newTime}
                  >
                    Vote for {calendarDate && calendarDate.toLocaleDateString()}
                  </Button>
                  <Button onClick={() => setShowTimeInput(false)}>Cancel</Button>
                </Box>
              )}
            </Box>
          )}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            {!rangeMode ? (
              <>
                <Grid item xs={6}>
                  <TextField
                    label="Date"
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Time"
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={5}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={rangeStart}
                    onChange={e => setRangeStart(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <Typography align="center">to</Typography>
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="End Date"
                    type="date"
                    value={rangeEnd}
                    onChange={e => setRangeEnd(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Time"
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePropose}
                disabled={(!rangeMode && (!newDate || !newTime)) || (rangeMode && (!rangeStart || !rangeEnd || rangeEnd < rangeStart))}
                fullWidth
                startIcon={<EventAvailableIcon />}
              >
                Propose Date{rangeMode ? ' Range' : ''}
              </Button>
            </Grid>
          </Grid>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {(dates || []).map(date => (
                <Grid item xs={12} key={date.id}>
                  <Card variant="outlined" sx={{ mb: 2, borderLeft: '6px solid #1976d2', borderRadius: 2, boxShadow: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                          {date.proposed_by_username ? date.proposed_by_username.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {!date.end_date ? (
                              <>{date.date} <span style={{ color: '#888', fontWeight: 400 }}>({getWeekday(date.date)})</span> {date.time && <span style={{ color: '#1976d2', fontWeight: 600 }}>{date.time}</span>}</>
                            ) : (
                              <>{date.date} to {date.end_date} <span style={{ color: '#888', fontWeight: 400 }}>({getWeekday(date.date)} - {getWeekday(date.end_date)})</span> {date.time && <span style={{ color: '#1976d2', fontWeight: 600 }}>{date.time}</span>}</>
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Proposed by <b>{date.proposed_by_username}</b>
                          </Typography>
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip label={`Available: ${date.available_votes}`} color="success" size="small" icon={<CheckIcon />} />
                        <Chip label={`Not: ${date.not_available_votes}`} color="error" size="small" icon={<CloseIcon />} />
                      </Stack>
                      <CardActions sx={{ gap: 1, flexWrap: 'wrap' }}>
                        {userVotes[date.id] === undefined ? (
                          <>
                            <Button variant="contained" color="success" size="small" startIcon={<CheckIcon />} onClick={() => handleVote(date.id, true)}>
                              Available
                            </Button>
                            <Button variant="contained" color="error" size="small" startIcon={<CloseIcon />} onClick={() => handleVote(date.id, false)}>
                              Not
                            </Button>
                          </>
                        ) : (
                          <Chip label={`You voted: ${userVotes[date.id] ? 'Available' : 'Not Available'}`} color={userVotes[date.id] ? 'success' : 'error'} size="small" />
                        )}
                        {date.proposed_by === user.id && (
                          <Button variant="outlined" color="warning" size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(date.id)}>
                            Delete
                          </Button>
                        )}
                        <Button variant="outlined" color="primary" size="small" startIcon={<EventAvailableIcon />} onClick={() => setConfirmedEvent(date)}>
                          Confirm
                        </Button>
                      </CardActions>
                      {confirmedEvent && confirmedEvent.id === date.id && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          <Button variant="contained" color="primary" size="small" onClick={() => downloadICS(date)}>
                            Save to Calendar
                          </Button>
                          <Typography color="primary" sx={{ mt: 1 }}>
                            Event confirmed!
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          {confirmedEvent && (
            <Typography variant="h6" color="primary" align="center" sx={{ mt: 4 }}>
              Confirmed Event: {confirmedEvent.date}
              {confirmedEvent.time && (
                <> at {confirmedEvent.time}</>
              )}
            </Typography>
          )}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={2500}
            onClose={() => setSnackbar({ open: false, message: '' })}
            message={snackbar.message}
          />
        </Box>
      </CardContent>
    </Card>
  );
} 