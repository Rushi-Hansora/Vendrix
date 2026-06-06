import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Alert, Button, Paper, Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ArrowBack, CheckCircle } from '@mui/icons-material';
import { getQuotations, updateQuotation } from '../api/quotationsApi';
import StatusChip from '../components/common/StatusChip';

export default function QuotationComparisonPage() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const rfqId      = params.get('rfqId');
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [selecting, setSelecting] = useState(null);

  useEffect(() => {
    getQuotations({ rfqId, limit: 100 })
      .then((r) => setRows(r.data.data?.data || []))
      .catch(() => setError('Failed to load quotations'))
      .finally(() => setLoading(false));
  }, [rfqId]);

  const lowestPrice = rows.length > 0 ? Math.min(...rows.map((q) => q.totalAmount)) : Infinity;

  const initiateApproval = async (quotationId) => {
    setSelecting(quotationId);
    try {
      await updateQuotation(quotationId, { status: 'UNDER_REVIEW', notes: 'Selected from comparison' });
      navigate('/rfq');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to initiate approval');
    } finally { setSelecting(null); }
  };

  const columns = [
    {
      field: 'vendorName', headerName: 'Vendor', flex: 1, minWidth: 150,
      valueGetter: (_, row) => row.vendor?.name,
    },
    {
      field: 'totalAmount', headerName: 'Total Amount (₹)', flex: 1, minWidth: 150,
      renderCell: ({ row }) => (
        <Chip
          label={`₹${row.totalAmount?.toLocaleString()}`}
          color={row.totalAmount === lowestPrice ? 'success' : 'default'}
          variant={row.totalAmount === lowestPrice ? 'filled' : 'outlined'}
          size="small"
        />
      ),
    },
    { field: 'deliveryDays', headerName: 'Delivery (days)', flex: 1, minWidth: 130 },
    {
      field: 'status', headerName: 'Status', width: 130,
      renderCell: ({ value }) => <StatusChip status={value} />,
    },
    { field: 'notes', headerName: 'Notes', flex: 2,
      valueGetter: (_, row) => row.notes || '—',
    },
    {
      field: 'actions', headerName: 'Action', width: 130, sortable: false,
      renderCell: ({ row }) => (
        <Button
          size="small" variant="contained" color="secondary"
          startIcon={<CheckCircle />}
          disabled={!row.approval?.id || row.status !== 'SUBMITTED' || selecting === row.id}
          onClick={() => initiateApproval(row.id)}
        >
          {selecting === row.id ? '…' : 'Select'}
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
      <Typography variant="h5" color="primary.main" sx={{ mb: 1 }}>Compare Quotations</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Lowest price highlighted in green. Click <b>Select</b> to initiate approval.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          hideFooterPagination
          sx={{ border: 0 }}
        />
      </Paper>
    </Box>
  );
}
