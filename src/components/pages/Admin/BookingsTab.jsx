
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, TextField, Paper, Chip, Button, CircularProgress, Alert,
  InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Card, CardContent, Tooltip, IconButton, Fade, useTheme
} from '@mui/material';

import {
  Search as SearchIcon, Visibility, Refresh as RefreshIcon
} from '@mui/icons-material';

import { buildApiUrl, API_CONFIG } from '../../../config/api';

const BookingsTab = () => {
  const theme = useTheme();

  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState({ totalBookings: 0, totalByStatus: {} });

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ status: 'all' });

  const [page, setPage] = useState(0);
  const [rpp, setRPP] = useState(10);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [processing, setProcessing] = useState(false);

  // safe short id display
  const shortId = (id) => {
    if (!id) return 'N/A';
    if (typeof id === 'object' && id?._id) {
      return `${id._id.slice(0, 6)}…${id._id.slice(-3)}`;
    }
    if (typeof id === 'string') {
      return `${id.slice(0, 6)}…${id.slice(-3)}`;
    }
    return 'N/A';
  };

  const displayName = (obj, fallback = 'N/A') => {
    if (!obj) return fallback;
    if (typeof obj === 'string') return obj;
    if (obj.name) return obj.name;
    if (obj.title) return obj.title;
    if (obj._id) return shortId(obj._id);
    return fallback;
  };

  const safeDate = (d) => {
    if (!d) return 'N/A';
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  // statusColor accepts any casing
  const statusColor = (s) => {
    const key = (s || '').toString().toLowerCase();
    switch (key) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const fetchBookings = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch(buildApiUrl(API_CONFIG.ADMIN.BOOKINGS), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || json?.message || 'Failed to fetch');
      }

      setBookings(json.data?.bookings || []);
      setAnalytics({
        totalBookings: json.data?.totalBookings || 0,
        totalByStatus: json.data?.totalByStatus || {},
      });

      setError(null);
    } catch (err) {
      console.error('fetchBookings error:', err);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (query) {
      list = list.filter((b) =>
        [b.user?.name, b.property?.title, b.timeSlot, b.date]
          .filter(Boolean)
          .some((v) => v.toString().toLowerCase().includes(query.toLowerCase()))
      );
    }
    if (filters.status !== 'all') {
      list = list.filter((b) => (b.status || '').toString().toLowerCase() === filters.status.toLowerCase());
    }
    return list;
  }, [bookings, query, filters]);

  const paginated = useMemo(
    () => filtered.slice(page * rpp, page * rpp + rpp),
    [filtered, page, rpp]
  );

  // Update booking status using PUT (send lowercase to match backend)
  const updateStatus = async (bookingOrId, newStatus) => {
    try {
      setProcessing(true);

      // derive bookingId safely
      const bookingId = typeof bookingOrId === 'string'
        ? bookingOrId
        : bookingOrId && (bookingOrId._id || bookingOrId.id);

      console.log('updateStatus called with:', bookingOrId);
      console.log('derived bookingId:', bookingId);

      if (!bookingId) {
        setError('Invalid booking id');
        setProcessing(false);
        return;
      }

      const token = localStorage.getItem('adminToken') || '';

      // backend expects lowercase values
      const payloadStatus = (newStatus || '').toString().trim().toLowerCase();

      const finalUrl = buildApiUrl(
        API_CONFIG.ADMIN.UPDATE_BOOKING_STATUS.replace(':id', encodeURIComponent(bookingId))
      );

      const res = await fetch(finalUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: payloadStatus }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || json?.message || 'Update failed');
      }

      // refresh list & update selection
      await fetchBookings();
      setSelected(prev => (typeof prev === 'object' ? { ...prev, status: payloadStatus } : prev));
      setError(null);
    } catch (err) {
      console.error('Update error:', err);
      setError(`Failed to update booking: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>Bookings Management</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchBookings} disabled={refreshing}>
            <RefreshIcon color="primary" />
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Box mb={2}><Alert severity="error">{error}</Alert></Box>}

      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography>Total Bookings</Typography>
              <Typography variant="h4">{analytics.totalBookings}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {Object.entries(analytics.totalByStatus).map(([s, c]) => (
          <Grid item xs={6} md={3} key={s}>
            <Card>
              <CardContent>
                <Typography textTransform="capitalize">{s}</Typography>
                <Typography variant="h4">{c}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <TextField
        fullWidth
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPage(0); }}
        placeholder="Search customer, property, date…"
        sx={{ mb: 3 }}
        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
      />

      <Paper>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Property</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time Slot</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.map((b) => (
                <Fade in key={b._id}>
                  <TableRow hover>
                    <TableCell>{displayName(b.user)}</TableCell>
                    <TableCell>{displayName(b.property)}</TableCell>
                    <TableCell>{safeDate(b.date)}</TableCell>
                    <TableCell>{b.timeSlot || 'N/A'}</TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={((b.status || '') + '').toString()}
                        color={statusColor(b.status)}
                      />
                    </TableCell>

                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => { setSelected(b); setDialogOpen(true); }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                </Fade>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          rowsPerPage={rpp}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRPP(+e.target.value); setPage(0); }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent dividers>
          {selected ? (
            <>
              <Typography><strong>User:</strong> {displayName(selected.user)}</Typography>
              <Typography><strong>Property:</strong> {displayName(selected.property)}</Typography>
              <Typography><strong>Date:</strong> {safeDate(selected.date)}</Typography>
              <Typography><strong>Time Slot:</strong> {selected.timeSlot || 'N/A'}</Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Status:</strong>{' '}
                <Chip size="small" label={((selected.status || '') + '')} color={statusColor(selected.status)} />
              </Typography>
            </>
          ) : (
            <Typography>No booking selected</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => updateStatus(selected?._id || selected, 'approved')}
            color="success"
            variant="contained"
            disabled={processing || (selected && ((selected.status || '').toString().toLowerCase() === 'approved'))}
          >
            Approve
          </Button>
          <Button
            onClick={() => updateStatus(selected?._id || selected, 'rejected')}
            color="error"
            variant="contained"
            disabled={processing || (selected && ((selected.status || '').toString().toLowerCase() === 'rejected'))}
          >
            Reject
          </Button>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsTab;
