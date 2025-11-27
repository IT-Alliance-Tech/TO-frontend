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
import axios from 'axios';
import { API_CONFIG, buildApiUrl } from '../../../config/api';

export default function SubscriptionTab() {
  const theme = useTheme();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [planType, setPlanType] = useState('');
  const [validTill, setValidTill] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await axios.get(buildApiUrl(API_CONFIG.SUBSCRIPTION.USER_SUBSCRIPTIONS));
      const subsArray = Array.isArray(response.data)
        ? response.data
        : response.data.subscriptions || [];
      setSubscriptions(subsArray);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setSubscriptions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSubscriptions(); }, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(subscriptions)) return [];
    return subscriptions.filter(sub => {
      const q = query.toLowerCase();
      const matchesQuery = sub.subscriptionId?.name?.toLowerCase().includes(q) ?? false;
      const matchesStatus = status ? (sub.active ? 'Active' : 'Inactive') === status : true;
      const matchesPlan = planType ? sub.subscriptionId?.name === planType : true;
      const subDate = sub.endDate ? new Date(sub.endDate) : null;
      const matchesValidTill = validTill && subDate ? subDate <= validTill : true;
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

  const planLimits = {
    Silver: 6,
    Gold: 12,
    Diamond: 25
  };

  return (
    <Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
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

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">

          <TextField
            label="Subscription ID"
            variant="outlined"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 200, flex: 2 }}
          />

          <TextField select label="Status" value={status} onChange={e => setStatus(e.target.value)} sx={{ minWidth: 140, flex: 1.3 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
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

      <Paper elevation={1} sx={{
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <TableContainer sx={{ maxHeight: 560 }}>
          <Table stickyHeader>

            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                {[
                  'Name',
                  'Plan Type',
                  'Created At',
                  'Expiry Date',
                  'Viewed Count',
                  'Viewed Properties',
                  'Remaining Count'
                ].map(header => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      py: 1.5,
                      minWidth: header === 'Viewed Properties' ? 200 : 140,
                      textAlign: 'center'
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.map(sub => {
                const planName = sub.subscriptionId?.name;
                const viewed = Array.isArray(sub.viewedProperties)
                  ? sub.viewedProperties.length
                  : 0;

                const totalLimit = planLimits[planName] ?? 0;
                const remaining = totalLimit - viewed;

                // ⭐ Show Property ID (or fallback to Property Name)
                const viewedPropertyList = Array.isArray(sub.viewedProperties)
                  ? sub.viewedProperties
                      .map(p =>
                        p?._id
                          ? p._id
                          : p?.propertyName
                            ? p.propertyName
                            : "-"
                      )
                      .join(', ')
                  : "-";

                return (
                  <Fade in key={sub._id}>
                    <TableRow hover sx={{ '&:last-of-type td': { border: 0 } }}>

                      <TableCell align="center">{sub.userId?.name || '-'}</TableCell>
                      <TableCell align="center">{planName || '-'}</TableCell>

                      <TableCell align="center">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '-'}
                      </TableCell>

                      <TableCell align="center">
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-'}
                      </TableCell>

                      <TableCell align="center">
                        <Chip label={viewed} color="primary" variant="outlined" size="small" />
                      </TableCell>

                      <TableCell align="center">
                        {viewedPropertyList || "-"}
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={remaining >= 0 ? remaining : 0}
                          color={remaining > 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>

                    </TableRow>
                  </Fade>
                );
              })}

              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
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
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{ px: 2 }}
        />
      </Paper>
    </Box>
  );
}
