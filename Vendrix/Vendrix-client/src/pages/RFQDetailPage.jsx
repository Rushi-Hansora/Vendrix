import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Chip, Button, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
} from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import { getRFQ } from '../api/rfqApi';
import { getQuotations } from '../api/quotationsApi';
import StatusChip from '../components/common/StatusChip';
import { useAuth } from '../hooks/useAuth';

export default function RFQDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rfq, setRfq]             = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([getRFQ(id), getQuotations({ rfqId: id, limit: 50 })])
      .then(([r, q]) => {
        setRfq(r.data.data);
        setQuotations(q.data.data?.data || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (!rfq) return <Typography>RFQ not found</Typography>;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/rfq')} sx={{ mb: 2 }}>Back</Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" color="primary.main">{rfq.title}</Typography>
          <Typography variant="body2" color="text.secondary">{rfq.description}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <StatusChip status={rfq.status} size="medium" />
          {user?.role === 'VENDOR' && (
            <Button variant="contained" color="secondary" startIcon={<Add />}
              onClick={() => navigate(`/quotations/submit?rfqId=${id}`)}>
              Submit Quotation
            </Button>
          )}
          {['ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER'].includes(user?.role) && quotations.length > 1 && (
            <Button variant="outlined" onClick={() => navigate(`/quotations/compare?rfqId=${id}`)}>
              Compare Quotations
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Details</Typography>
            <Typography variant="body2">Deadline: <b>{new Date(rfq.deadline).toLocaleString()}</b></Typography>
            <Typography variant="body2">Created by: <b>{rfq.createdBy?.name}</b></Typography>
            <Typography variant="body2">Created: <b>{new Date(rfq.createdAt).toLocaleString()}</b></Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Invited Vendors</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {rfq.vendors?.map((rv) => (
                <Chip key={rv.vendorId} label={rv.vendor?.name} size="small" variant="outlined" />
              ))}
              {rfq.vendors?.length === 0 && <Typography variant="body2" color="text.secondary">None</Typography>}
            </Box>
          </Paper>
        </Grid>

        {/* Line Items */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Line Items</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: '#F5F7FA' } }}>
                    <TableCell>#</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rfq.items?.map((item, i) => (
                    <TableRow key={item.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit || '—'}</TableCell>
                      <TableCell>{item.description || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Submitted Quotations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Submitted Quotations ({quotations.length})
            </Typography>
            {quotations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No quotations yet.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: '#F5F7FA' } }}>
                      <TableCell>Vendor</TableCell>
                      <TableCell>Total Amount</TableCell>
                      <TableCell>Delivery (days)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quotations.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell>{q.vendor?.name}</TableCell>
                        <TableCell>₹{q.totalAmount?.toLocaleString()}</TableCell>
                        <TableCell>{q.deliveryDays}</TableCell>
                        <TableCell><StatusChip status={q.status} /></TableCell>
                        <TableCell>{q.notes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
