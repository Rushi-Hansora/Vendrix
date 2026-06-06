import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

export default function ApiErrorSnackbar() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleError = (event) => setMessage(event.detail || 'Something went wrong');
    window.addEventListener('vendrix:api-error', handleError);
    return () => window.removeEventListener('vendrix:api-error', handleError);
  }, []);

  return (
    <Snackbar
      open={!!message}
      autoHideDuration={5000}
      onClose={() => setMessage('')}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert severity="error" variant="filled" onClose={() => setMessage('')}>
        {message}
      </Alert>
    </Snackbar>
  );
}
