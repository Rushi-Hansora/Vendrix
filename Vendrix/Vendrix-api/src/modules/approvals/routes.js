const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/role');
const approvalsController = require('./approvals.controller');

const router = express.Router();

router.get('/pending', authenticate, authorize('ADMIN', 'MANAGER'), approvalsController.getPendingApprovals);
router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), approvalsController.getAllApprovals);
router.get('/:id', authenticate, approvalsController.getApprovalById);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), approvalsController.processApproval);
router.post('/:id/approve', authenticate, authorize('ADMIN', 'MANAGER'), approvalsController.approve);
router.post('/:id/reject', authenticate, authorize('ADMIN', 'MANAGER'), approvalsController.reject);

module.exports = router;
