import { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Paper,
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot, TimelineOppositeContent,
} from '@mui/lab';
import { getLogs } from '../api/reportsApi';

const ENTITY_COLOR = {
  RFQ: 'primary',
  Quotation: 'secondary',
  Approval: 'warning',
  PurchaseOrder: 'success',
  Invoice: 'info',
  Vendor: 'error',
};

export default function ActivityLogPage() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getLogs({ limit: 50 })
      .then((r) => setLogs(r.data.data?.data || []))
      .catch(() => setError('Failed to load activity log'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" color="primary.main" sx={{ mb: 3 }}>Activity Log</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {logs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No activity recorded yet.</Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 2 }}>
          <Timeline position="right">
            {logs.map((log, idx) => (
              <TimelineItem key={log.id}>
                <TimelineOppositeContent
                  sx={{ flex: 0.2, fontSize: 12, color: 'text.secondary', pt: '10px' }}
                >
                  {new Date(log.createdAt).toLocaleString()}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={ENTITY_COLOR[log.entity] || 'grey'} variant="outlined" />
                  {idx < logs.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent sx={{ pb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {log.action}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {log.entity} • by {log.user?.name}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Paper>
      )}
    </Box>
  );
}
