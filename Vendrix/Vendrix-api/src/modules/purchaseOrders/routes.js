const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/role');
const poController = require('./purchaseOrders.controller');

const router = express.Router();

router.get('/', authenticate, poController.getAllPOs);
router.get('/:id', authenticate, poController.getPOById);
router.post('/', authenticate, authorize('PROCUREMENT_OFFICER', 'ADMIN', 'MANAGER'), poController.createPO);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'VENDOR'), poController.updateStatus);

module.exports = router;
