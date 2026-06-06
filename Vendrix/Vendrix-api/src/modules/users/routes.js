const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/role');
const usersController = require('./users.controller');

const router = express.Router();

router.get('/', authenticate, authorize('ADMIN'), usersController.getAllUsers);
router.get('/:id', authenticate, usersController.getUserById);
router.put('/:id', authenticate, usersController.updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), usersController.deleteUser);

module.exports = router;
