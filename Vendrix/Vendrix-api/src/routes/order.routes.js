const express = require('express');
const { createOrder, getMyOrders, getOrderById, updateOrderStatus } = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticate, createOrder);
router.get('/my', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.patch('/:id/status', authenticate, authorize('VENDOR', 'ADMIN'), updateOrderStatus);

module.exports = router;
