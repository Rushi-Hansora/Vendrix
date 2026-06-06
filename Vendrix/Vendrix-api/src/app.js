const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');

// Module routes
const authRoutes = require('./modules/auth/routes');
const usersRoutes = require('./modules/users/routes');
const vendorsRoutes = require('./modules/vendors/routes');
const rfqRoutes = require('./modules/rfq/routes');
const quotationsRoutes = require('./modules/quotations/routes');
const approvalsRoutes = require('./modules/approvals/routes');
const purchaseOrdersRoutes = require('./modules/purchaseOrders/routes');
const invoicesRoutes = require('./modules/invoices/routes');
const activityLogRoutes = require('./modules/activityLog/routes');
const reportsRoutes = require('./modules/reports/routes');

// Activity log middleware — global mutation logger
const { activityLogger } = require('./middleware/activityLog');

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim());

// Security & parsing middleware
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (activity logger applied per-router for entity labelling)
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/vendors', activityLogger('Vendor'), vendorsRoutes);
app.use('/api/rfq', activityLogger('RFQ'), rfqRoutes);
app.use('/api/quotations', activityLogger('Quotation'), quotationsRoutes);
app.use('/api/approvals', activityLogger('Approval'), approvalsRoutes);
app.use('/api/purchase-orders', activityLogger('PurchaseOrder'), purchaseOrdersRoutes);
app.use('/api/invoices', activityLogger('Invoice'), invoicesRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
