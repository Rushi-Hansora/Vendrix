import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
} from '@mui/material';
import { getPOs } from '../api/purchaseOrdersApi';
import StatusChip from '../components/common/StatusChip';

export default function PurchaseOrdersPage() {
  const [pos, setPOs]         = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getPOs({ limit: 50 })
      .then((r) => setPOs(r.data.data?.data || []))
      .catch(() => setError('Failed to load purchase orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" color="primary.main" sx={{ mb: 3 }}>Purchase Orders</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: '#F5F7FA' } }}>
                <TableCell>PO Number</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>RFQ</TableCell>
                <TableCell>Sub Total</TableCell>
                <TableCell>Tax (18%)</TableCell>
                <TableCell>Grand Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Invoice</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pos.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center">No purchase orders yet</TableCell></TableRow>
              )}
              {pos.map((po) => (
                <TableRow key={po.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{po.poNumber?.slice(-8)}</TableCell>
                  <TableCell>{po.quotation?.vendor?.name || '—'}</TableCell>
                  <TableCell>{po.quotation?.rfq?.title || '—'}</TableCell>
                  <TableCell>₹{po.totalAmount?.toLocaleString()}</TableCell>
                  <TableCell>₹{po.taxAmount?.toLocaleString()}</TableCell>
                  <TableCell><b>₹{po.grandTotal?.toLocaleString()}</b></TableCell>
                  <TableCell><StatusChip status={po.status} /></TableCell>
                  <TableCell>
                    {po.invoice ? (
                      <StatusChip status={po.invoice.status} />
                    ) : (
                      <Typography variant="caption" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
