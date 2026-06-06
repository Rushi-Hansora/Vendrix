const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/role');
const quotationsController = require('./quotations.controller');

const router = express.Router();

router.get('/', authenticate, quotationsController.getAllQuotations);
router.get('/:id', authenticate, quotationsController.getQuotationById);
router.post('/', authenticate, authorize('VENDOR'), quotationsController.createQuotation);
router.put('/:id', authenticate, quotationsController.updateQuotation);

module.exports = router;
