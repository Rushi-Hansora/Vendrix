import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';
import ApiErrorSnackbar from './components/common/ApiErrorSnackbar';

import LoginPage               from './pages/LoginPage';
import DashboardPage           from './pages/DashboardPage';
import VendorsPage             from './pages/VendorsPage';
import RFQCreatePage           from './pages/RFQCreatePage';
import RFQListPage             from './pages/RFQListPage';
import RFQDetailPage           from './pages/RFQDetailPage';
import QuotationSubmitPage     from './pages/QuotationSubmitPage';
import QuotationComparisonPage from './pages/QuotationComparisonPage';
import ApprovalsPage           from './pages/ApprovalsPage';
import InvoicesPage            from './pages/InvoicesPage';
import PurchaseOrdersPage      from './pages/PurchaseOrdersPage';
import ActivityLogPage         from './pages/ActivityLogPage';
import ReportsPage             from './pages/ReportsPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard"           element={<DashboardPage />} />
                <Route path="/vendors"             element={<VendorsPage />} />
                <Route path="/rfq"                 element={<RFQListPage />} />
                <Route path="/rfq/create"          element={<RFQCreatePage />} />
                <Route path="/rfq/:id"             element={<RFQDetailPage />} />
                <Route path="/quotations"          element={<RFQListPage />} />
                <Route path="/quotations/submit"   element={<QuotationSubmitPage />} />
                <Route path="/quotations/compare"  element={<QuotationComparisonPage />} />
                <Route
                  path="/approvals"
                  element={
                    <RoleRoute roles={['ADMIN', 'MANAGER']}>
                      <ApprovalsPage />
                    </RoleRoute>
                  }
                />
                <Route path="/purchase-orders"     element={<PurchaseOrdersPage />} />
                <Route path="/invoices"            element={<InvoicesPage />} />
                <Route path="/activity-log"        element={<ActivityLogPage />} />
                <Route
                  path="/reports"
                  element={
                    <RoleRoute roles={['ADMIN', 'MANAGER']}>
                      <ReportsPage />
                    </RoleRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
        <ApiErrorSnackbar />
      </BrowserRouter>
    </ThemeProvider>
  );
}
