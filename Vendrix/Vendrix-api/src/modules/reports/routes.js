const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/role');
const reportsController = require('./reports.controller');

const router = express.Router();

router.get('/summary', authenticate, authorize('ADMIN'), reportsController.getSummary);
router.get('/vendor/:vendorId', authenticate, reportsController.getVendorReport);

module.exports = router;
