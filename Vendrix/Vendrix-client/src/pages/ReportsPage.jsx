import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, CircularProgress, Alert,
} from '@mui/material';
import { getSummary } from '../api/reportsApi';
import StatCard from '../components/common/StatCard';
import { Storefront, Assignment, Receipt, AttachMoney, People } from '@mui/icons-material';

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getSummary()
      .then((r) => setSummary(r.data.data))
      .catch(() => setError('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" color="primary.main" sx={{ mb: 3 }}>Reports & Summary</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Users"    value={summary?.totalUsers}    icon={<People fontSize="large" />}   color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Vendors"  value={summary?.totalVendors}  icon={<Storefront fontSize="large" />} color="secondary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total RFQs"     value={summary?.totalRFQs}     icon={<Assignment fontSize="large" />} color="#1565C0" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Purchase Orders" value={summary?.totalPOs}     icon={<Receipt fontSize="large" />}  color="#ED6C02" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Invoices" value={summary?.totalInvoices} icon={<Receipt fontSize="large" />}  color="#9C27B0" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Spend (Paid)"
            value={`₹${(summary?.totalSpend || 0).toLocaleString()}`}
            icon={<AttachMoney fontSize="large" />}
            color="#2E7D32"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
