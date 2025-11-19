// UsersTab.jsx  –  Enhanced
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
  TablePagination,
  IconButton,
  Tooltip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { buildApiUrl, API_CONFIG } from '../../../config/api';

const UsersTab = () => {
  const theme = useTheme();

  /* ---------------- state ---------------- */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [page, setPage]   = useState(0);
  const [rowsPerPage, setRPP] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  /* --------------- fetch ----------------- */
  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('adminToken');

      const res  = await fetch(buildApiUrl(API_CONFIG.ADMIN.USERS), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (!json.success) throw new Error(json.error || 'Fetch failed');
      setUsers(json.data.users || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  /* ------------- filtering --------------- */
  const filtered = useMemo(() => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  }, [users, query]);

  /* ------------- pagination -------------- */
  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  /* --------------- render ---------------- */
  if (loading)
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress size={32} />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      {/* header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Users Management&nbsp;
        </Typography>

        <Tooltip title="Refresh">
          <IconButton
            onClick={fetchUsers}
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

      {/* search */}
      <TextField
        fullWidth
        value={query}
        placeholder="Search by name or email…"
        onChange={e => { setQuery(e.target.value); setPage(0); }}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          )
        }}
      />

      {/* table */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <TableContainer sx={{ maxHeight: 560 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 80 }}>Avatar</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell sx={{ width: 120 }}>Role</TableCell>
                <TableCell sx={{ width: 120 }}>Verified</TableCell>
                <TableCell sx={{ width: 120 }}>Joined</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.map(u => (
                <Fade in key={u.id}>
                  <TableRow
                    hover
                    sx={{
                      '&:last-of-type td': { border: 0 }
                    }}
                  >
                    <TableCell>
                      <Avatar
                        src={u.avatarUrl}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main'
                        }}
                      >
                        {u.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>{u.name}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {u.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={u.role}
                        color={
                          u.role === 'admin'
                            ? 'primary'
                            : u.role === 'owner'
                            ? 'secondary'
                            : 'default'
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        {u.isVerified ? (
                          <>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="body2" color="success.main">
                              Verified
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Cancel color="warning" fontSize="small" />
                            <Typography variant="body2" color="warning.main">
                              Pending
                            </Typography>
                          </>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                </Fade>
              ))}

              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      py={6}
                    >
                      <Typography color="text.secondary">
                        No users found
                      </Typography>
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
            setRPP(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
};

export default UsersTab;
