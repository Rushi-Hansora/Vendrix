import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  CircularProgress, Alert, Divider, IconButton,
} from '@mui/material';
import { Add, Delete, ArrowBack } from '@mui/icons-material';
import { useForm, useFieldArray } from 'react-hook-form';
import { createQuotation } from '../api/quotationsApi';
import { getRFQ } from '../api/rfqApi';

export default function QuotationSubmitPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rfqId   = params.get('rfqId');

  const [rfq, setRfq]         = useState(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      totalAmount: '', deliveryDays: '', notes: '',
      items: [{ productName: '', quantity: 1, unitPrice: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (rfqId) getRFQ(rfqId).then((r) => setRfq(r.data.data));
  }, [rfqId]);

  const onSubmit = async (data) => {
    setSaving(true); setError('');
    try {
      await createQuotation({ ...data, rfqId });
      navigate('/quotations');
    } catch (e) {
      setError(e.response?.data?.message || 'Submission failed');
    } finally { setSaving(false); }
  };

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
      <Typography variant="h5" color="primary.main" sx={{ mb: 1 }}>Submit Quotation</Typography>
      {rfq && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          For RFQ: <b>{rfq.title}</b> — Deadline: {new Date(rfq.deadline).toLocaleDateString()}
        </Typography>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Pricing & Delivery</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Total Amount (₹) *" type="number"
                {...register('totalAmount', { required: 'Required', min: { value: 1, message: 'Must be > 0' } })}
                error={!!errors.totalAmount} helperText={errors.totalAmount?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Delivery Days *" type="number"
                {...register('deliveryDays', { required: 'Required', min: { value: 1, message: 'Must be > 0' } })}
                error={!!errors.deliveryDays} helperText={errors.deliveryDays?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Notes" {...register('notes')} />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Item Pricing</Typography>
            <Button size="small" startIcon={<Add />} onClick={() => append({ productName: '', quantity: 1, unitPrice: '' })}>
              Add Item
            </Button>
          </Box>
          {fields.map((field, idx) => (
            <Box key={field.id} sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <TextField fullWidth size="small" label="Product Name *"
                    {...register(`items.${idx}.productName`, { required: 'Required' })}
                    error={!!errors.items?.[idx]?.productName}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField fullWidth size="small" label="Qty *" type="number"
                    {...register(`items.${idx}.quantity`, { required: true, min: 1 })}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" label="Unit Price (₹) *" type="number"
                    {...register(`items.${idx}.unitPrice`, { required: 'Required', min: { value: 0.01, message: 'Required' } })}
                    error={!!errors.items?.[idx]?.unitPrice}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <IconButton color="error" onClick={() => remove(idx)} disabled={fields.length === 1}>
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
              {idx < fields.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : 'Submit Quotation'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
