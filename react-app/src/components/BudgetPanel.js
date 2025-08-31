import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, OutlinedInput } from '@mui/material';
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
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1976d2' }}>Add Expense</Typography>
      <Grid container spacing={isMobile ? 2 : 3} alignItems="center" direction={isMobile ? 'column' : 'row'}>
        <Grid item xs={12} sm={3} style={{ width: isMobile ? '100%' : undefined }}>
          <TextField
            label="Description"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            fullWidth
            size={isMobile ? 'medium' : 'small'}
            InputProps={{ style: { fontSize: isMobile ? 18 : 15, padding: isMobile ? 14 : undefined } }}
            sx={{ mb: isMobile ? 1 : 0 }}
          />
        </Grid>
        <Grid item xs={12} sm={2} style={{ width: isMobile ? '100%' : undefined }}>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            fullWidth
            size={isMobile ? 'medium' : 'small'}
            InputProps={{ style: { fontSize: isMobile ? 18 : 15, padding: isMobile ? 14 : undefined } }}
            sx={{ mb: isMobile ? 1 : 0 }}
          />
        </Grid>
        <Grid item xs={12} sm={3} style={{ width: isMobile ? '100%' : undefined }}>
          <FormControl fullWidth size={isMobile ? 'medium' : 'small'} sx={{ mb: isMobile ? 1 : 0 }}>
            <InputLabel>Paid By</InputLabel>
            <Select
              value={paidBy}
              label="Paid By"
              onChange={e => setPaidBy(e.target.value)}
              style={{ fontSize: isMobile ? 18 : 15 }}
            >
              {members.map(m => (
                <MenuItem key={m.id} value={m.id}>{m.username}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3} style={{ width: isMobile ? '100%' : undefined }}>
          <FormControl fullWidth size={isMobile ? 'medium' : 'small'} sx={{ mb: isMobile ? 1 : 0 }}>
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
              style={{ fontSize: isMobile ? 18 : 15 }}
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
                  <MenuItem key={m.id} value={m.id}>{m.username}</MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={1} style={{ width: isMobile ? '100%' : undefined, display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddExpense}
            disabled={adding}
            sx={{ fontSize: isMobile ? 18 : 15, py: isMobile ? 1.2 : 0.7, px: isMobile ? 3 : 2, borderRadius: 2, minWidth: isMobile ? 120 : 80 }}
          >
            Add
          </Button>
        </Grid>
      </Grid>
      <Button
        variant="outlined"
        startIcon={<PersonAddIcon />}
        sx={{ mt: 2, mb: 2, fontSize: isMobile ? 17 : 14, py: isMobile ? 1.1 : 0.6, px: isMobile ? 2.5 : 1.5, borderRadius: 2 }}
        onClick={() => setShowAddExternal(true)}
      >
        Add External Member
      </Button>
      <Dialog open={showAddExternal} onClose={() => setShowAddExternal(false)}>
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
      <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 700, color: '#1976d2' }}>Expenses</Typography>
      <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 2 }}>
        <Table size={isMobile ? 'medium' : 'small'}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Paid By</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Split With</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map(exp => (
              <TableRow key={exp.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}>
                <TableCell sx={{ fontSize: isMobile ? 16 : 14 }}>{exp.description}</TableCell>
                <TableCell sx={{ fontSize: isMobile ? 16 : 14, fontWeight: 600 }}>${exp.amount}</TableCell>
                <TableCell sx={{ fontSize: isMobile ? 16 : 14 }}>{members.find(m => m.id === exp.paid_by)?.username || exp.paid_by}</TableCell>
                <TableCell sx={{ fontSize: isMobile ? 16 : 14 }}>{exp.split_with ? exp.split_with.map(id => members.find(m => m.id === id)?.username || id).join(', ') : ''}</TableCell>
                <TableCell sx={{ fontSize: isMobile ? 16 : 14 }}>{exp.date}</TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => handleDeleteExpense(exp.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 700, color: '#1976d2' }}>Balances</Typography>
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
        {balances.map((bal, idx) => (
          <Card key={idx} sx={{ minWidth: 120, mb: isMobile ? 2 : 0, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{bal.username}</Typography>
              <Typography variant="body1" sx={{ color: bal.balance < 0 ? 'red' : 'green', fontWeight: 700 }}>
                {bal.balance < 0 ? '-' : ''}${Math.abs(bal.balance).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
} 