const express = require('express');
const { authenticate } = require('../../middleware/auth');
const authController = require('./auth.controller');

const router = express.Router();

router.post('/signup', authController.register);    // POST /auth/signup
router.post('/register', authController.register);  // alias
router.post('/login', authController.login);         // POST /auth/login
router.get('/me', authenticate, authController.getMe);
router.post('/refresh', authController.refreshToken);

module.exports = router;
