import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, CircularProgress, Alert, IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { getVendors, createVendor, updateVendor, deleteVendor } from '../api/vendorsApi';
import StatusChip from '../components/common/StatusChip';

const EMPTY = { name: '', email: '', phone: '', gstNumber: '', category: '', address: '', status: 'ACTIVE' };

export default function VendorsPage() {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);
  const [editing, setEditing]     = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount]   = useState(0);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getVendors({ page: paginationModel.page + 1, limit: paginationModel.pageSize });
      setRows(res.data.data?.data || []);
      setRowCount(res.data.data?.meta?.total || 0);
    } catch { setError('Failed to load vendors'); }
    finally { setLoading(false); }
  }, [paginationModel]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { reset(EMPTY); setEditing(null); setOpen(true); };
  const openEdit = (row) => { reset(row); setEditing(row); setOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true); setError('');
    try {
      if (editing) await updateVendor(editing.id, data);
      else await createVendor(data);
      setOpen(false);
      fetchData();
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteVendor(deleting.id); setDeleting(null); fetchData(); }
    catch (e) { setError(e.response?.data?.message || 'Delete failed'); }
  };

  const columns = [
    { field: 'name',       headerName: 'Name',     flex: 1, minWidth: 150 },
    { field: 'email',      headerName: 'Email',    flex: 1, minWidth: 180 },
    { field: 'category',   headerName: 'Category', flex: 1 },
    { field: 'phone',      headerName: 'Phone',    flex: 1 },
    { field: 'gstNumber',  headerName: 'GST No.',  flex: 1 },
    {
      field: 'status', headerName: 'Status', width: 120,
      renderCell: ({ value }) => <StatusChip status={value} />,
    },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false,
      renderCell: ({ row }) => (
        <Box>
          <IconButton size="small" color="primary" onClick={() => openEdit(row)}><Edit fontSize="small" /></IconButton>
          <IconButton size="small" color="error"   onClick={() => setDeleting(row)}><Delete fontSize="small" /></IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" color="primary.main">Vendors</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Add Vendor</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={rowCount}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        paginationMode="server"
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
      />

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editing ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
          <DialogContent dividers>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField fullWidth label="Name *" margin="dense" {...register('name', { required: 'Required' })} error={!!errors.name} helperText={errors.name?.message} />
            <TextField fullWidth label="Email *" margin="dense" {...register('email', { required: 'Required' })} error={!!errors.email} helperText={errors.email?.message} />
            <TextField fullWidth label="Phone" margin="dense" {...register('phone')} />
            <TextField fullWidth label="GST Number" margin="dense" {...register('gstNumber')} />
            <TextField fullWidth label="Category" margin="dense" {...register('category')} />
            <TextField fullWidth label="Address" margin="dense" multiline rows={2} {...register('address')} />
            <Controller
              name="status" control={control} defaultValue="ACTIVE"
              render={({ field }) => (
                <TextField {...field} select fullWidth label="Status" margin="dense">
                  {['ACTIVE', 'INACTIVE', 'BLACKLISTED'].map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={18} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleting} onClose={() => setDeleting(null)}>
        <DialogTitle>Delete Vendor</DialogTitle>
        <DialogContent>Are you sure you want to delete <b>{deleting?.name}</b>?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
