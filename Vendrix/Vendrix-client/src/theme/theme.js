import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary:    { main: '#1E3A5F', contrastText: '#fff' },
    secondary:  { main: '#1B998B', contrastText: '#fff' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
    success:    { main: '#2E7D32' },
    warning:    { main: '#ED6C02' },
    error:      { main: '#D32F2F' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: '#1E3A5F', color: '#fff' },
      },
    },
  },
});

export default theme;
