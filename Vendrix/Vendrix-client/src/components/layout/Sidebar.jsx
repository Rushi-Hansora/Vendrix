import { NavLink } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Divider, Box,
} from '@mui/material';
import {
  Dashboard, Storefront, Assignment, Description,
  CheckCircle, Receipt, Timeline, BarChart, People,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: 'Dashboard',      path: '/dashboard',           icon: <Dashboard />,    roles: null },
  { label: 'Vendors',        path: '/vendors',             icon: <Storefront />,   roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER'] },
  { label: 'RFQs',           path: '/rfq',                 icon: <Assignment />,   roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER'] },
  { label: 'Quotations',     path: '/quotations',          icon: <Description />,  roles: null },
  { label: 'Approvals',      path: '/approvals',           icon: <CheckCircle />,  roles: ['ADMIN', 'MANAGER'] },
  { label: 'Purchase Orders',path: '/purchase-orders',     icon: <Receipt />,      roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER'] },
  { label: 'Invoices',       path: '/invoices',            icon: <Receipt />,      roles: ['ADMIN', 'PROCUREMENT_OFFICER'] },
  { label: 'Activity Log',   path: '/activity-log',        icon: <Timeline />,     roles: null },
  { label: 'Reports',        path: '/reports',             icon: <BarChart />,     roles: ['ADMIN', 'MANAGER'] },
  { label: 'Users',          path: '/users',               icon: <People />,       roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user } = useAuth();

  const visible = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Toolbar sx={{ bgcolor: '#163055' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32, height: 32, borderRadius: 1,
              background: 'linear-gradient(135deg, #1B998B, #fff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Typography variant="caption" fontWeight={700} color="#1E3A5F">V</Typography>
          </Box>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
            Vendrix
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      <Box sx={{ px: 1, py: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', px: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>
          {user?.role?.replace('_', ' ')}
        </Typography>
      </Box>

      <List dense>
        {visible.map(({ label, path, icon }) => (
          <ListItemButton
            key={path}
            component={NavLink}
            to={path}
            sx={{
              borderRadius: 1.5, mx: 1, mb: 0.5,
              color: 'rgba(255,255,255,0.75)',
              '&.active': {
                bgcolor: '#1B998B',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{icon}</ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
