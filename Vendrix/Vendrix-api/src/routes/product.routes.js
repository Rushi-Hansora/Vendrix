const express = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, authorize('VENDOR', 'ADMIN'), createProduct);
router.put('/:id', authenticate, authorize('VENDOR', 'ADMIN'), updateProduct);
router.delete('/:id', authenticate, authorize('VENDOR', 'ADMIN'), deleteProduct);

module.exports = router;
