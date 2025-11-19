// SubscriptionTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, TextField, Paper, Chip, CircularProgress,
  InputAdornment, TablePagination, IconButton, Tooltip, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Fade,
  MenuItem, useTheme, alpha
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Sample front-end only data
const sampleSubscriptions = [
  { id:1, name:'John Doe', email:'john@example.com', plan:'Gold', status:'Active', expiry:'2025-12-31' },
  { id:2, name:'Jane Smith', email:'jane@example.com', plan:'Silver', status:'Expired', expiry:'2024-05-15' },
  { id:3, name:'Alex Johnson', email:'alex@example.com', plan:'Diamond', status:'Active', expiry:'2025-09-20' },
];

export default function SubscriptionTab() {
  const theme = useTheme();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [planType, setPlanType] = useState('');
  const [validTill, setValidTill] = useState(null); // Single date picker

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchSubscriptions = () => {
    setRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      setSubscriptions(sampleSubscriptions);
      setLoading(false);
      setRefreshing(false);
    }, 500);
  };

  useEffect(() => { fetchSubscriptions(); }, []);

  const filtered = useMemo(() => {
    return subscriptions.filter(sub => {
      const q = query.toLowerCase();
      const matchesQuery = sub.name.toLowerCase().includes(q) || sub.email.toLowerCase().includes(q);
      const matchesStatus = status ? sub.status === status : true;
      const matchesPlan = planType ? sub.plan === planType : true;
      const subDate = new Date(sub.expiry);
      const matchesValidTill = validTill ? subDate <= validTill : true;
      return matchesQuery && matchesStatus && matchesPlan && matchesValidTill;
    });
  }, [subscriptions, query, status, planType, validTill]);

  const paginated = useMemo(() => {
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  if (loading) return (
    <Box display="flex" justifyContent="center" py={5}>
      <CircularProgress size={32} />
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight:700 }}>
          Subscription Plans
        </Typography>
        <Tooltip title="Refresh">
          <IconButton
            onClick={fetchSubscriptions}
            disabled={refreshing}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <RefreshIcon color="primary" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filters */}
      <Paper sx={{ p:2, mb:3 }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={2} flexWrap="wrap" justifyContent="flex-start">
          <TextField
            label="Name / Email"
            variant="outlined"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action"/>
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 200, flex: 2 }}
          />
          <TextField select label="Status" value={status} onChange={e => setStatus(e.target.value)} sx={{ minWidth: 140, flex: 1.3 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Expired">Expired</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </TextField>
          <TextField select label="Plan Type" value={planType} onChange={e => setPlanType(e.target.value)} sx={{ minWidth: 140, flex: 1.3 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Gold">Gold</MenuItem>
            <MenuItem value="Silver">Silver</MenuItem>
            <MenuItem value="Diamond">Diamond</MenuItem>
          </TextField>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Valid Till"
              value={validTill}
              onChange={setValidTill}
              renderInput={(params) => <TextField {...params} sx={{ minWidth: 140, flex: 1.5 }} />}
            />
          </LocalizationProvider>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, borderRadius:2, overflow:'hidden' }}>
        <TableContainer sx={{ maxHeight:560 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Plan Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>Expiry Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map(sub => (
                <Fade in key={sub.id}>
                  <TableRow hover sx={{ '&:last-of-type td': { border:0 } }}>
                    <TableCell>{sub.name}</TableCell>
                    <TableCell>{sub.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={sub.plan} 
                        color={sub.plan==='Gold' ? 'warning' : sub.plan==='Silver' ? 'info' : 'secondary'} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ pr: 0 }}>
                      <Chip 
                        label={sub.status} 
                        color={sub.status==='Active' ? 'success' : sub.status==='Expired' ? 'error' : 'warning'} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign:'right' }}>{sub.expiry}</TableCell>
                  </TableRow>
                </Fade>
              ))}
              {paginated.length===0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                      <Typography color="text.secondary">No subscriptions found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5,10,25]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_,p)=>setPage(p)}
          onRowsPerPageChange={e=>{ setRowsPerPage(parseInt(e.target.value,10)); setPage(0); }}
        />
      </Paper>
    </Box>
  );
}
