const express = require('express');
const { createOrUpdateVendorProfile, getVendorProfile, getMyVendorProfile, getAllVendors } = require('../controllers/vendor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getAllVendors);
router.get('/me', authenticate, authorize('VENDOR'), getMyVendorProfile);
router.get('/:id', getVendorProfile);
router.post('/profile', authenticate, authorize('VENDOR', 'ADMIN'), createOrUpdateVendorProfile);

module.exports = router;
