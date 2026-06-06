const express = require('express');
const { authenticate } = require('../../middleware/auth');
const activityLogController = require('./activityLog.controller');

const router = express.Router();

router.get('/', authenticate, activityLogController.getLogs);

module.exports = router;
