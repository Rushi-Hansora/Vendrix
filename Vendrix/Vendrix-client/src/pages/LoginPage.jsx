import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  CircularProgress, Alert, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { login } from '../api/authApi';
import { setCredentials } from '../store/authSlice';

export default function LoginPage() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPwd, setShowPwd]   = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await login(data);
      dispatch(setCredentials(res.data.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1E3A5F 0%, #1B998B 100%)',
      }}
    >
      <Card sx={{ width: 420, p: 2, borderRadius: 3 }}>
        <CardContent>
          {/* Logo / Brand */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1E3A5F, #1B998B)', mb: 1,
              }}
            >
              <LockOutlined sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" color="primary.main">Vendrix</Typography>
            <Typography variant="body2" color="text.secondary">
              Procurement Management Platform
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth label="Email" type="email" margin="normal" autoFocus
              {...register('email', { required: 'Email is required' })}
              error={!!errors.email} helperText={errors.email?.message}
            />
            <TextField
              fullWidth label="Password" margin="normal"
              type={showPwd ? 'text' : 'password'}
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              error={!!errors.password} helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd(!showPwd)} edge="end">
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 1, py: 1.5,
                background: 'linear-gradient(90deg, #1E3A5F, #1B998B)',
                '&:hover': { background: 'linear-gradient(90deg, #163055, #168a7c)' },
              }}
              startIcon={loading && <CircularProgress size={18} color="inherit" />}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
