import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Chip, Grid, Card, CardContent, CardActions,
} from '@mui/material';
import { CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import { getPending, approve, reject } from '../api/approvalsApi';
import StatusChip from '../components/common/StatusChip';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [dialog, setDialog]       = useState(null); // { id, action }
  const [remarks, setRemarks]     = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    getPending()
      .then((r) => setApprovals(r.data.data?.data || []))
      .catch(() => setError('Failed to load approvals'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async () => {
    setProcessing(true);
    try {
      if (dialog.action === 'approve') await approve(dialog.id, remarks);
      else await reject(dialog.id, remarks);
      setDialog(null);
      setRemarks('');
      fetchData();
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed');
    } finally { setProcessing(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h5" color="primary.main">Pending Approvals</Typography>
        <Chip
          icon={<HourglassEmpty />}
          label={`${approvals.length} pending`}
          color="warning"
          size="small"
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {approvals.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 56, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">All caught up!</Typography>
          <Typography variant="body2" color="text.secondary">No pending approvals.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {approvals.map((a) => {
            const q = a.quotation;
            return (
              <Grid item xs={12} md={6} key={a.id}>
                <Card sx={{ border: '1px solid #f0f0f0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {q?.rfq?.title}
                      </Typography>
                      <StatusChip status={a.status} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <b>Vendor:</b> {q?.vendor?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <b>Total Amount:</b> ₹{q?.totalAmount?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <b>Delivery:</b> {q?.deliveryDays} days
                    </Typography>
                    {q?.notes && (
                      <Typography variant="body2" color="text.secondary">
                        <b>Notes:</b> {q.notes}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
                    <Button
                      variant="contained" color="success" size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => setDialog({ id: a.id, action: 'approve' })}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined" color="error" size="small"
                      startIcon={<Cancel />}
                      onClick={() => setDialog({ id: a.id, action: 'reject' })}
                    >
                      Reject
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Remarks Dialog */}
      <Dialog open={!!dialog} onClose={() => { setDialog(null); setRemarks(''); }} maxWidth="xs" fullWidth>
        <DialogTitle>
          {dialog?.action === 'approve' ? '✅ Approve Quotation' : '❌ Reject Quotation'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Remarks (optional)" multiline rows={3}
            value={remarks} onChange={(e) => setRemarks(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialog(null); setRemarks(''); }}>Cancel</Button>
          <Button
            variant="contained"
            color={dialog?.action === 'approve' ? 'success' : 'error'}
            onClick={handleAction} disabled={processing}
          >
            {processing ? <CircularProgress size={18} /> : dialog?.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
