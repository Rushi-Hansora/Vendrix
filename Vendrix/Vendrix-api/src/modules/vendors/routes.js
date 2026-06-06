const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/role');
const vendorsController = require('./vendors.controller');

const router = express.Router();

// Public
router.get('/', vendorsController.getAllVendors);
router.get('/:id', vendorsController.getVendorById);

// Protected - ADMIN manages vendors
router.post('/', authenticate, authorize('ADMIN', 'PROCUREMENT_OFFICER'), vendorsController.createVendor);
router.put('/:id', authenticate, authorize('ADMIN', 'PROCUREMENT_OFFICER'), vendorsController.updateVendor);
router.delete('/:id', authenticate, authorize('ADMIN'), vendorsController.deleteVendor);

module.exports = router;
