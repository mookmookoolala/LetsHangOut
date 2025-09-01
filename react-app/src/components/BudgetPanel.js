import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Grid, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, OutlinedInput, Divider, Container, Avatar
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, PersonAdd as PersonAddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085';

export function BudgetPanel({ group, user }) {
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

  return (
    <Container maxWidth="sm" sx={{ py: isMobile ? 1 : 4 }}>
      <Paper elevation={2} sx={{ p: isMobile ? 2 : 4, borderRadius: 3, background: theme.palette.background.paper }}>
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
              sx={{ fontSize: 18, py: 1.2, borderRadius: 2, minWidth: 120 }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          sx={{ mt: 2, mb: 2, fontSize: 17, py: 1.1, borderRadius: 2 }}
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
        <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 1, borderRadius: 2, background: theme.palette.background.paper, overflowX: isMobile ? 'auto' : 'hidden' }}>
          <Table size={isMobile ? 'medium' : 'small'}>
            <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                 <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: isMobile ? 18 : 16, whiteSpace: 'nowrap', padding: isMobile ? '16px 12px' : undefined }}>Description</TableCell>
                 <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: isMobile ? 18 : 16, whiteSpace: 'nowrap', padding: isMobile ? '16px 12px' : undefined }}>Amount</TableCell>
                 <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: isMobile ? 18 : 16, whiteSpace: 'nowrap', padding: isMobile ? '16px 12px' : undefined }}>Paid By</TableCell>
                 <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: isMobile ? 18 : 16, whiteSpace: 'nowrap', padding: isMobile ? '16px 12px' : undefined }}>Split With</TableCell>
                 <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: isMobile ? 18 : 16, whiteSpace: 'nowrap', padding: isMobile ? '16px 12px' : undefined }}>Date</TableCell>
                 <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: isMobile ? 18 : 16, whiteSpace: 'nowrap', padding: isMobile ? '16px 12px' : undefined }}>Action</TableCell>
                </TableRow>
              </TableHead>
            <TableBody>
              {expenses.map(exp => (
                <TableRow key={exp.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}>
                  <TableCell sx={{ fontSize: isMobile ? 18 : 16, padding: isMobile ? '16px 12px' : undefined, minWidth: isMobile ? 120 : undefined }}>{exp.description}</TableCell>
                  <TableCell sx={{ fontSize: isMobile ? 18 : 16, fontWeight: 600, padding: isMobile ? '16px 12px' : undefined, minWidth: isMobile ? 100 : undefined }}>${exp.amount}</TableCell>
                  <TableCell sx={{ fontSize: isMobile ? 18 : 16, padding: isMobile ? '16px 12px' : undefined, minWidth: isMobile ? 120 : undefined }}>
                    {(() => {
                      const m = members.find(m => m.id === exp.paid_by);
                      return m ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{m.username[0]}</Avatar>
                          {m.username}
                        </Box>
                      ) : exp.paid_by;
                    })()}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? 18 : 16, padding: isMobile ? '16px 12px' : undefined, minWidth: isMobile ? 150 : undefined }}>{exp.split_with ? exp.split_with.map(id => {
                    const m = members.find(m => m.id === id);
                    return m ? m.username : id;
                  }).join(', ') : ''}</TableCell>
                  <TableCell sx={{ fontSize: isMobile ? 18 : 16, padding: isMobile ? '16px 12px' : undefined, minWidth: isMobile ? 100 : undefined }}>{exp.date}</TableCell>
                  <TableCell sx={{ padding: isMobile ? '16px 12px' : undefined, minWidth: isMobile ? 80 : undefined }}>
                    <IconButton size="small" color="error" onClick={() => handleDeleteExpense(exp.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', fontSize: isMobile ? 22 : 20 }}>Balances</Typography>
        <Grid container spacing={2} direction={isMobile ? 'column' : 'row'}>
          {balances.map((bal, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ minWidth: 120, boxShadow: 1, borderRadius: 2, background: theme.palette.background.paper }}>
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
      </Paper>
    </Container>
  );
}