const express = require('express');
const { createInvoice, getMyInvoices, updateInvoiceStatus } = require('../controllers/invoice.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticate, authorize('VENDOR'), createInvoice);
router.get('/my', authenticate, authorize('VENDOR'), getMyInvoices);
router.patch('/:id/status', authenticate, authorize('VENDOR', 'ADMIN'), updateInvoiceStatus);

module.exports = router;
