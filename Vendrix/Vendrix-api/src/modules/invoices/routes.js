const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/role');
const invoicesController = require('./invoices.controller');

const router = express.Router();

router.get('/', authenticate, invoicesController.getAllInvoices);
router.get('/:id', authenticate, invoicesController.getInvoiceById);
router.get('/:id/download', authenticate, invoicesController.downloadInvoice);
router.post('/', authenticate, authorize('ADMIN', 'PROCUREMENT_OFFICER'), invoicesController.createInvoice);
router.post('/:id/send', authenticate, authorize('ADMIN', 'PROCUREMENT_OFFICER'), invoicesController.sendInvoice);
router.patch('/:id/status', authenticate, authorize('ADMIN'), invoicesController.updateStatus);

module.exports = router;
