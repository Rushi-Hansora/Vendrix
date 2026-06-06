const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/role');
const rfqController = require('./rfq.controller');

const router = express.Router();

router.get('/', authenticate, rfqController.getAllRFQs);
router.get('/:id', authenticate, rfqController.getRFQById);
router.post('/', authenticate, authorize('PROCUREMENT_OFFICER', 'ADMIN', 'MANAGER'), rfqController.createRFQ);
router.put('/:id', authenticate, authorize('PROCUREMENT_OFFICER', 'ADMIN'), rfqController.updateRFQ);
router.delete('/:id', authenticate, authorize('PROCUREMENT_OFFICER', 'ADMIN'), rfqController.deleteRFQ);

module.exports = router;
