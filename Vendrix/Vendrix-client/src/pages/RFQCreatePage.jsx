import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stepper, Step, StepLabel, Button,
  TextField, Paper, Grid, IconButton, Divider,
  Autocomplete, CircularProgress, Alert, Chip,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useForm, useFieldArray } from 'react-hook-form';
import { createRFQ } from '../api/rfqApi';
import { getVendors } from '../api/vendorsApi';

const STEPS = ['RFQ Details', 'Line Items', 'Assign Vendors'];

export default function RFQCreatePage() {
  const navigate  = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [vendors, setVendors]       = useState([]);
  const [selected, setSelected]     = useState([]);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const { register, control, trigger, getValues, formState: { errors } } = useForm({
    defaultValues: {
      title: '', description: '', deadline: '',
      items: [{ productName: '', quantity: 1, unit: 'pcs', description: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    getVendors({ limit: 100 }).then((r) => setVendors(r.data.data?.data || []));
  }, []);

  const handleNext = async () => {
    const fieldMap = [['title', 'deadline'], ['items'], []];
    const valid = await trigger(fieldMap[activeStep]);
    if (valid) setActiveStep((s) => s + 1);
  };

  const onSubmit = async () => {
    setSaving(true); setError('');
    try {
      const data = getValues();
      await createRFQ({ ...data, vendorIds: selected.map((v) => v.id) });
      navigate('/rfq');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create RFQ');
    } finally { setSaving(false); }
  };

  return (
    <Box>
      <Typography variant="h5" color="primary.main" sx={{ mb: 3 }}>Create RFQ</Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        {/* Step 1: Details */}
        {activeStep === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="RFQ Title *"
                {...register('title', { required: 'Title is required' })}
                error={!!errors.title} helperText={errors.title?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={3} {...register('description')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Deadline *" type="datetime-local"
                InputLabelProps={{ shrink: true }}
                {...register('deadline', { required: 'Deadline is required' })}
                error={!!errors.deadline} helperText={errors.deadline?.message}
              />
            </Grid>
          </Grid>
        )}

        {/* Step 2: Items */}
        {activeStep === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Line Items</Typography>
              <Button startIcon={<Add />} size="small" onClick={() => append({ productName: '', quantity: 1, unit: 'pcs', description: '' })}>
                Add Item
              </Button>
            </Box>
            {fields.map((field, idx) => (
              <Box key={field.id} sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
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
                  <Grid item xs={6} sm={2}>
                    <TextField fullWidth size="small" label="Unit" {...register(`items.${idx}.unit`)} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField fullWidth size="small" label="Description" {...register(`items.${idx}.description`)} />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton color="error" onClick={() => remove(idx)} disabled={fields.length === 1}>
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
                {idx < fields.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Box>
        )}

        {/* Step 3: Vendors */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Select Vendors to Invite
            </Typography>
            <Autocomplete
              multiple
              options={vendors}
              getOptionLabel={(v) => `${v.name} (${v.email})`}
              value={selected}
              onChange={(_, val) => setSelected(val)}
              renderTags={(val, getTagProps) =>
                val.map((v, i) => (
                  <Chip key={v.id} label={v.name} size="small" {...getTagProps({ index: i })} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Vendors" placeholder="Search vendors…" />
              )}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {selected.length} vendor{selected.length !== 1 ? 's' : ''} selected
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button disabled={activeStep === 0} onClick={() => setActiveStep((s) => s - 1)}>
          Back
        </Button>
        {activeStep < STEPS.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>Next</Button>
        ) : (
          <Button variant="contained" color="secondary" onClick={onSubmit} disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : 'Create RFQ'}
          </Button>
        )}
      </Box>
    </Box>
  );
}
