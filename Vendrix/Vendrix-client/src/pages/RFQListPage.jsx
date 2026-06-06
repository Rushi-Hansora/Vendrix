import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardActions,
  Button, CircularProgress, Alert, TextField, InputAdornment, Chip,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { getRFQs } from '../api/rfqApi';
import StatusChip from '../components/common/StatusChip';
import { useAuth } from '../hooks/useAuth';

export default function RFQListPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [rfqs, setRfqs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    getRFQs({ limit: 50 })
      .then((r) => setRfqs(r.data.data?.data || []))
      .catch(() => setError('Failed to load RFQs'))
      .finally(() => setLoading(false));
  }, []);

  const canCreate = ['ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER'].includes(user?.role);

  const filtered = rfqs.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" color="primary.main">RFQs</Typography>
        {canCreate && (
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/rfq/create')}>
            Create RFQ
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        size="small" placeholder="Search RFQs…" value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, width: 300 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
      />

      {filtered.length === 0 && (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          No RFQs found.
        </Typography>
      )}

      <Grid container spacing={3}>
        {filtered.map((rfq) => (
          <Grid item xs={12} sm={6} md={4} key={rfq.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <StatusChip status={rfq.status} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(rfq.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom noWrap>{rfq.title}</Typography>
                {rfq.description && (
                  <Typography variant="body2" color="text.secondary" noWrap>{rfq.description}</Typography>
                )}
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`${rfq.items?.length || 0} items`} size="small" variant="outlined" />
                  <Chip label={`${rfq.vendors?.length || 0} vendors`} size="small" variant="outlined" />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Deadline: {new Date(rfq.deadline).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/rfq/${rfq.id}`)}>View Details</Button>
                <Button size="small" color="secondary" onClick={() => navigate(`/quotations?rfqId=${rfq.id}`)}>
                  Quotations
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
