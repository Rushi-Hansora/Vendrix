import { useEffect, useState } from 'react';
import {
  Grid, Typography, Box, Badge, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, Button,
} from '@mui/material';
import {
  Storefront, Assignment, Receipt, AttachMoney,
  CheckCircle, Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import StatusChip from '../components/common/StatusChip';
import { getSummary } from '../api/reportsApi';
import { getPOs } from '../api/purchaseOrdersApi';
import { getPending } from '../api/approvalsApi';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary]     = useState(null);
  const [recentPOs, setRecentPOs] = useState([]);
  const [pending, setPending]     = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sRes, poRes, apRes] = await Promise.all([
          getSummary(),
          getPOs({ limit: 5 }),
          getPending(),
        ]);
        setSummary(sRes.data.data);
        setRecentPOs(poRes.data.data?.data || []);
        setPending(apRes.data.data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, color: 'primary.main' }}>
        Dashboard
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Vendors"
            value={summary?.totalVendors}
            icon={<Storefront fontSize="large" />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total RFQs"
            value={summary?.totalRFQs}
            icon={<Assignment fontSize="large" />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Purchase Orders"
            value={summary?.totalPOs}
            icon={<Receipt fontSize="large" />}
            color="#ED6C02"
            subtitle={`${summary?.totalInvoices} invoices`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Spend"
            value={`₹${(summary?.totalSpend || 0).toLocaleString()}`}
            icon={<AttachMoney fontSize="large" />}
            color="#2E7D32"
            subtitle="Paid invoices"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent POs */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Purchase Orders</Typography>
              <Button size="small" onClick={() => navigate('/purchase-orders')}>View All</Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: '#F5F7FA' } }}>
                    <TableCell>PO Number</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Grand Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentPOs.length === 0 && (
                    <TableRow><TableCell colSpan={4} align="center">No purchase orders yet</TableCell></TableRow>
                  )}
                  {recentPOs.map((po) => (
                    <TableRow key={po.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/purchase-orders`)}>
                      <TableCell>{po.poNumber?.slice(-8)}</TableCell>
                      <TableCell>{po.quotation?.vendor?.name || '—'}</TableCell>
                      <TableCell>₹{po.grandTotal?.toLocaleString()}</TableCell>
                      <TableCell><StatusChip status={po.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Pending Approvals */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                <Badge badgeContent={pending.length} color="warning" sx={{ mr: 1 }}>
                  <Warning color="warning" />
                </Badge>{' '}
                Pending Approvals
              </Typography>
              <Button size="small" onClick={() => navigate('/approvals')}>View All</Button>
            </Box>
            {pending.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 40 }} />
                <Typography variant="body2" color="text.secondary" mt={1}>
                  All caught up!
                </Typography>
              </Box>
            ) : (
              pending.slice(0, 5).map((a) => (
                <Box
                  key={a.id}
                  sx={{ p: 1.5, mb: 1, borderRadius: 1, border: '1px solid #f0f0f0', cursor: 'pointer', '&:hover': { bgcolor: '#F5F7FA' } }}
                  onClick={() => navigate('/approvals')}
                >
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {a.quotation?.rfq?.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {a.quotation?.vendor?.name}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
