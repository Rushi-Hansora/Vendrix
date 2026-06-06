import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, CircularProgress, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Download, Send, Add } from '@mui/icons-material';
import { getInvoices, sendInvoice, createInvoice, getInvoiceDownloadUrl } from '../api/invoicesApi';
import { getPOs } from '../api/purchaseOrdersApi';
import StatusChip from '../components/common/StatusChip';

export default function InvoicesPage() {
  const [invoices, setInvoices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [sending, setSending]     = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [genDialog, setGenDialog] = useState(false);
  const [pos, setPOs]             = useState([]);
  const [selectedPO, setSelectedPO] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    getInvoices()
      .then((r) => setInvoices(r.data.data?.data || []))
      .catch(() => setError('Failed to load invoices'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openGenDialog = async () => {
    const r = await getPOs({ status: 'ACTIVE', limit: 100 });
    setPOs(r.data.data?.data || []);
    setGenDialog(true);
  };

  const handleGenerate = async () => {
    if (!selectedPO) return;
    setGenerating(true);
    try {
      await createInvoice({ purchaseOrderId: selectedPO });
      setGenDialog(false);
      setSelectedPO('');
      fetchData();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to generate invoice');
    } finally { setGenerating(false); }
  };

  const handleSend = async (id) => {
    setSending(id);
    try {
      await sendInvoice(id);
      fetchData();
    } catch (e) {
      setError(e.response?.data?.message || 'Email sending failed');
    } finally { setSending(null); }
  };

  const handleDownload = async (id) => {
    setDownloading(id);
    try {
      const res = await getInvoiceDownloadUrl(id);
      window.open(res.data.data.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(e.response?.data?.message || 'PDF download failed');
    } finally { setDownloading(null); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" color="primary.main">Invoices</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openGenDialog}>
          Generate Invoice
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: '#F5F7FA' } }}>
                <TableCell>Invoice #</TableCell>
                <TableCell>PO Number</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Grand Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Email Sent</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">No invoices yet</TableCell></TableRow>
              )}
              {invoices.map((inv) => {
                const po = inv.purchaseOrder;
                const vendor = po?.quotation?.vendor;
                return (
                  <TableRow key={inv.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {inv.invoiceNumber?.slice(-10)}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {po?.poNumber?.slice(-8)}
                    </TableCell>
                    <TableCell>{vendor?.name || '—'}</TableCell>
                    <TableCell>₹{po?.grandTotal?.toLocaleString()}</TableCell>
                    <TableCell><StatusChip status={inv.status} /></TableCell>
                    <TableCell>
                      <Chip
                        label={inv.emailSent ? 'Sent' : 'Not sent'}
                        color={inv.emailSent ? 'success' : 'default'}
                        size="small" variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {inv.pdfUrl && (
                          <Button
                            size="small"
                            startIcon={<Download />}
                            variant="outlined"
                            disabled={downloading === inv.id}
                            onClick={() => handleDownload(inv.id)}
                          >
                            {downloading === inv.id ? <CircularProgress size={14} /> : 'PDF'}
                          </Button>
                        )}
                        {!inv.emailSent && (
                          <Button
                            size="small" startIcon={<Send />} variant="contained" color="secondary"
                            disabled={sending === inv.id}
                            onClick={() => handleSend(inv.id)}
                          >
                            {sending === inv.id ? <CircularProgress size={14} /> : 'Email'}
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Generate Invoice Dialog */}
      <Dialog open={genDialog} onClose={() => setGenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Invoice</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>Select an approved Purchase Order:</Typography>
          {pos.map((po) => (
            <Box
              key={po.id}
              onClick={() => setSelectedPO(po.id)}
              sx={{
                p: 2, mb: 1, border: '2px solid',
                borderColor: selectedPO === po.id ? 'secondary.main' : '#e0e0e0',
                borderRadius: 1, cursor: 'pointer',
                bgcolor: selectedPO === po.id ? 'rgba(27,153,139,0.06)' : 'transparent',
                '&:hover': { borderColor: 'secondary.main' },
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {po.quotation?.vendor?.name} — {po.quotation?.rfq?.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PO: {po.poNumber?.slice(-8)} | Grand Total: ₹{po.grandTotal?.toLocaleString()}
              </Typography>
            </Box>
          ))}
          {pos.length === 0 && <Typography color="text.secondary">No active POs available.</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerate} disabled={!selectedPO || generating}>
            {generating ? <CircularProgress size={18} /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
