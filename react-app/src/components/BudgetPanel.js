import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Grid, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, OutlinedInput, Divider, Container, Avatar, Alert, Snackbar
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, PersonAdd as PersonAddIcon, Search as SearchIcon, SwapHoriz as SwapHorizIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

export const BudgetPanel = ({ group, user }) => {
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitWith, setSplitWith] = useState([]);
  const [showAddExternal, setShowAddExternal] = useState(false);
  const [newExternalName, setNewExternalName] = useState('');
  const [adding, setAdding] = useState(false);
  const [splitSearch, setSplitSearch] = useState('');
  const [showSettleDialog, setShowSettleDialog] = useState(false);
  const [settleFrom, setSettleFrom] = useState('');
  const [settleTo, setSettleTo] = useState('');
  const [settleAmount, setSettleAmount] = useState('');
  const [settling, setSettling] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (group && group.id) {
      fetch(`${API_URL}/group-members?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => setMembers(Array.isArray(data) ? data : []));
      fetch(`${API_URL}/group-expenses?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => setExpenses(Array.isArray(data) ? data : []));
      fetch(`${API_URL}/group-balances?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => setBalances(Array.isArray(data) ? data : []));
    }
  }, [group]);

  const refresh = () => {
    if (group && group.id) {
      fetch(`${API_URL}/group-expenses?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => {
          setExpenses(Array.isArray(data) ? data : []);
        })
        .catch(() => setExpenses([]));
      fetch(`${API_URL}/group-balances?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => setBalances(Array.isArray(data) ? data : []))
        .catch(() => setBalances([]));
    }
  };

  const handleSettleBalance = () => {
    if (!settleFrom || !settleTo || !settleAmount || parseFloat(settleAmount) <= 0) {
      setSnackbar({ open: true, message: 'Please fill all fields with valid values', severity: 'error' });
      return;
    }

    setSettling(true);
    
    fetch(`${API_URL}/settle-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: group.id,
        from_user_id: settleFrom,
        to_user_id: settleTo,
        amount: parseFloat(settleAmount)
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to settle balance');
        return res.json();
      })
      .then(() => {
        setSnackbar({ open: true, message: 'Balance settled successfully!', severity: 'success' });
        setShowSettleDialog(false);
        setSettleFrom('');
        setSettleTo('');
        setSettleAmount('');
        refresh();
      })
      .catch(err => {
        console.error(err);
        setSnackbar({ open: true, message: 'Failed to settle balance. Please try again.', severity: 'error' });
      })
      .finally(() => {
        setSettling(false);
      });
  };

  const handleAddExpense = () => {
    if (!desc || !amount || !paidBy || splitWith.length === 0) return;
    setAdding(true);
    fetch(`${API_URL}/add-expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: group.id,
        description: desc,
        amount: parseFloat(amount),
        paid_by: paidBy,
        date: new Date().toISOString().slice(0, 10),
        split_with: splitWith
      })
    })
      .then(res => res.json())
      .then(() => {
        setDesc('');
        setAmount('');
        setPaidBy('');
        setSplitWith([]);
        setAdding(false);
        refresh();
      });
  };

  const handleDeleteExpense = (expenseId) => {
    fetch(`${API_URL}/delete-expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expense_id: expenseId })
    })
      .then(() => refresh());
  };

  const handleAddExternal = async () => {
    if (!newExternalName.trim()) return;
    const name = newExternalName.trim();
    const res = await fetch(`${API_URL}/add-external-member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: group.id, username: name })
    });
    if (res.ok) {
      setShowAddExternal(false);
      setNewExternalName('');
      fetch(`${API_URL}/group-members?group_id=${group.id}`)
        .then(res => res.json())
        .then(data => setMembers(Array.isArray(data) ? data : []));
    }
  };

  // The component's return statement
  return (
    <React.Fragment>
      <Container maxWidth="sm" sx={{ py: isMobile ? 1 : 4, px: isMobile ? 1 : 2 }}>
        <Paper elevation={2} sx={{ p: isMobile ? 2 : 4, borderRadius: 0, background: theme.palette.background.paper }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', textAlign: 'center', fontSize: isMobile ? 28 : 24 }}>Budget Panel</Typography>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', fontSize: isMobile ? 22 : 20 }}>Add Expense</Typography>
          <Grid container spacing={2} alignItems="center" direction="column">
          <Grid item xs={12} style={{ width: '100%' }}>
            <TextField
              label="Description"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              fullWidth
              size="medium"
              InputProps={{ style: { fontSize: 18, padding: 14 } }}
              sx={{ mb: 1 }}
            />
          </Grid>
          <Grid item xs={12} style={{ width: '100%' }}>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              fullWidth
              size="medium"
              InputProps={{ style: { fontSize: 18, padding: 14 } }}
              sx={{ mb: 1 }}
            />
          </Grid>
          <Grid item xs={12} style={{ width: '100%' }}>
            <FormControl fullWidth size="medium" sx={{ mb: 1 }}>
              <InputLabel>Paid By</InputLabel>
              <Select
                value={paidBy}
                label="Paid By"
                onChange={e => setPaidBy(e.target.value)}
                style={{ fontSize: 18 }}
                renderValue={selected => {
                  const m = members.find(mem => mem.id === selected);
                  return m ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{m.username[0]}</Avatar>
                      {m.username}
                    </Box>
                  ) : selected;
                }}
              >
                {members.map(m => (
                  <MenuItem key={m.id} value={m.id}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{m.username[0]}</Avatar>
                    {m.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} style={{ width: '100%' }}>
            <FormControl fullWidth size="medium" sx={{ mb: 1 }}>
              <InputLabel>Split With</InputLabel>
              <Select
                multiple
                value={splitWith}
                label="Split With"
                onChange={e => setSplitWith(e.target.value)}
                renderValue={selected => selected.map(id => {
                  const m = members.find(mem => mem.id === id);
                  return m ? m.username : id;
                }).join(', ')}
                style={{ fontSize: 18 }}
              >
                <MenuItem
                  value="all"
                  onClick={() => {
                    const allMemberIds = members.map(m => m.id);
                    setSplitWith(splitWith.length === allMemberIds.length ? [] : allMemberIds);
                  }}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: 'primary.light',
                    color: 'white',
                    '&:hover': { backgroundColor: 'primary.main' }
                  }}
                >
                  {splitWith.length === members.length ? 'Deselect All' : 'Select All'}
                </MenuItem>
                <MenuItem sx={{ borderTop: '1px solid #ddd' }} disabled>
                  ──────────────────
                </MenuItem>
                <MenuItem sx={{ p: 0 }}>
                  <OutlinedInput
                    placeholder="Search members..."
                    value={splitSearch}
                    onChange={(e) => setSplitSearch(e.target.value)}
                    size="small"
                    startAdornment={<SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' }
                    }}
                  />
                </MenuItem>
                {members
                  .filter(m => m.username.toLowerCase().includes(splitSearch.toLowerCase()))
                  .map(m => (
                    <MenuItem key={m.id} value={m.id}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{m.username[0]}</Avatar>
                      {m.username}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddExpense}
              disabled={adding}
              fullWidth
              sx={{ fontSize: 18, py: 1.2, borderRadius: 0, minWidth: 120 }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          sx={{ mt: 2, mb: 2, fontSize: 17, py: 1.1, borderRadius: 0 }}
          fullWidth
          onClick={() => setShowAddExternal(true)}
        >
          Add External Member
        </Button>
        <Dialog open={showAddExternal} onClose={() => setShowAddExternal(false)} fullWidth maxWidth="xs">
          <DialogTitle>Add External Member</DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              value={newExternalName}
              onChange={e => setNewExternalName(e.target.value)}
              fullWidth
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddExternal(false)}>Cancel</Button>
            <Button onClick={handleAddExternal} variant="contained">Add</Button>
          </DialogActions>
        </Dialog>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', fontSize: isMobile ? 22 : 20 }}>Expenses</Typography>
        <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 1, borderRadius: 2, background: theme.palette.background.paper, overflowX: 'auto', maxWidth: '100%' }}>
          <Table size={isMobile ? 'small' : 'medium'} sx={{ minWidth: isMobile ? 650 : 750 }}>
            <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                 <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: isMobile ? 14 : 16, whiteSpace: 'nowrap', padding: isMobile ? '10px 8px' : undefined }}>Description</TableCell>
                 <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: isMobile ? 14 : 16, whiteSpace: 'nowrap', padding: isMobile ? '10px 8px' : undefined }}>Amount</TableCell>
                 <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: isMobile ? 14 : 16, whiteSpace: 'nowrap', padding: isMobile ? '10px 8px' : undefined }}>Paid By</TableCell>
                 <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: isMobile ? 14 : 16, whiteSpace: 'nowrap', padding: isMobile ? '10px 8px' : undefined }}>Split With</TableCell>
                 <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: isMobile ? 14 : 16, whiteSpace: 'nowrap', padding: isMobile ? '10px 8px' : undefined }}>Date</TableCell>
                 <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: isMobile ? 14 : 16, whiteSpace: 'nowrap', padding: isMobile ? '10px 8px' : undefined }}>Action</TableCell>
                </TableRow>
              </TableHead>
            <TableBody>
              {expenses.map(exp => (
                <TableRow key={exp.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}>
                  <TableCell sx={{ fontSize: isMobile ? 14 : 16, padding: isMobile ? '10px 8px' : undefined, minWidth: isMobile ? 100 : undefined }}>{exp.description}</TableCell>
                  <TableCell sx={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, padding: isMobile ? '10px 8px' : undefined, minWidth: isMobile ? 80 : undefined }}>${exp.amount}</TableCell>
                  <TableCell sx={{ fontSize: isMobile ? 14 : 16, padding: isMobile ? '10px 8px' : undefined, minWidth: isMobile ? 100 : undefined }}>
                    {(() => {
                      const m = members.find(m => m.id === exp.paid_by);
                      return m ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: isMobile ? 20 : 24, height: isMobile ? 20 : 24, mr: 1 }}>{m.username[0]}</Avatar>
                          {m.username}
                        </Box>
                      ) : exp.paid_by;
                    })()}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? 14 : 16, padding: isMobile ? '10px 8px' : undefined, minWidth: isMobile ? 120 : undefined }}>{exp.split_with ? exp.split_with.map(id => {
                    const m = members.find(m => m.id === id);
                    return m ? m.username : id;
                  }).join(', ') : ''}</TableCell>
                  <TableCell sx={{ fontSize: isMobile ? 14 : 16, padding: isMobile ? '10px 8px' : undefined, minWidth: isMobile ? 80 : undefined }}>{exp.date}</TableCell>
                  <TableCell sx={{ padding: isMobile ? '10px 8px' : undefined, minWidth: isMobile ? 60 : undefined }}>
                    <IconButton size="small" color="error" onClick={() => handleDeleteExpense(exp.id)}>
                      <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: isMobile ? 22 : 20 }}>Balances</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SwapHorizIcon />}
            onClick={() => setShowSettleDialog(true)}
            sx={{ borderRadius: 0, py: 1 }}
          >
            Settle Balance
          </Button>
        </Box>
        <Grid container spacing={isMobile ? 1 : 2} direction={isMobile ? 'column' : 'row'} sx={{ maxWidth: '100%', overflow: 'hidden' }}>
          {balances.map((bal, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ minWidth: 120, boxShadow: 1, borderRadius: 0, background: theme.palette.background.paper }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: isMobile ? 18 : 16 }}>{bal.username}</Typography>
                  <Typography variant="body1" sx={{ color: bal.balance < 0 ? theme.palette.error.main : theme.palette.success.main, fontWeight: 700, fontSize: isMobile ? 20 : 18 }}>
                    {bal.balance < 0 ? '-' : ''}${Math.abs(bal.balance).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Dialog open={showSettleDialog} onClose={() => !settling && setShowSettleDialog(false)} fullWidth maxWidth="xs">
          <DialogTitle>Settle Balance</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel>From User</InputLabel>
                  <Select
                    value={settleFrom}
                    onChange={(e) => setSettleFrom(e.target.value)}
                    label="From User"
                    disabled={settling}
                  >
                    {members.map(m => (
                      <MenuItem key={m.id} value={m.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{m.username[0]}</Avatar>
                          {m.username}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>To User</InputLabel>
                  <Select
                    value={settleTo}
                    onChange={(e) => setSettleTo(e.target.value)}
                    label="To User"
                    disabled={settling}
                  >
                    {members.map(m => (
                      <MenuItem key={m.id} value={m.id} disabled={m.id === settleFrom}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{m.username[0]}</Avatar>
                          {m.username}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Amount"
                  type="number"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  fullWidth
                  disabled={settling}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSettleDialog(false)} disabled={settling}>Cancel</Button>
            <Button 
              onClick={handleSettleBalance} 
              variant="contained" 
              disabled={settling || !settleFrom || !settleTo || !settleAmount}
            >
              {settling ? 'Processing...' : 'Settle'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
    <Snackbar 
      open={snackbar.open} 
      autoHideDuration={6000} 
      onClose={() => setSnackbar({...snackbar, open: false})}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={() => setSnackbar({...snackbar, open: false})} 
        severity={snackbar.severity} 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
    </React.Fragment>
  );
};